import { describe, expect, test } from 'bun:test'
import { sql } from 'drizzle-orm'
import { db } from '~/db'

/**
 * Postgres does not index foreign key columns automatically. Without an index,
 * every cascade or SET NULL from the parent side sequentially scans the child
 * table while holding row locks, so deleting one organization can stall the
 * platform.
 *
 * This finds every FK whose leading column is not the leading column of any
 * index, which is exactly the shape that degrades.
 */
const UNINDEXED_FOREIGN_KEYS = sql`
  SELECT
    c.conrelid::regclass::text AS table_name,
    a.attname::text AS column_name
  FROM pg_constraint c
  JOIN pg_attribute a
    ON a.attrelid = c.conrelid AND a.attnum = c.conkey[1]
  WHERE c.contype = 'f'
    AND NOT EXISTS (
      SELECT 1
      FROM pg_index i
      WHERE i.indrelid = c.conrelid
        AND i.indkey[0] = c.conkey[1]
    )
  ORDER BY 1, 2
`

/** postgres-js returns a row array; PGlite returns `{ rows }`. */
const toRows = <T>(result: unknown): T[] =>
  Array.isArray(result)
    ? (result as T[])
    : ((result as { rows: T[] }).rows ?? [])

describe('foreign key indexing', () => {
  test('every foreign key column leads an index', async () => {
    const rows = toRows<{ table_name: string; column_name: string }>(
      await db.execute(UNINDEXED_FOREIGN_KEYS)
    )

    expect(rows.map(r => `${r.table_name}.${r.column_name}`)).toEqual([])
  })

  test('every foreign key declares an explicit delete rule', async () => {
    const rows = toRows<{ table_name: string; constraint_name: string }>(
      await db.execute(sql`
        SELECT
          c.conrelid::regclass::text AS table_name,
          c.conname::text AS constraint_name
        FROM pg_constraint c
        WHERE c.contype = 'f' AND c.confdeltype = 'a'
        ORDER BY 1, 2
      `)
    )

    // confdeltype 'a' is NO ACTION, which is what an omitted onDelete leaves
    // behind. Every FK should say cascade, set null, or restrict on purpose.
    expect(rows.map(r => `${r.table_name}.${r.constraint_name}`)).toEqual([])
  })
})
