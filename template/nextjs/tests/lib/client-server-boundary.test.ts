/**
 * Guard: `'use client'` modules must not import server runtime, secrets, or
 * the database directly. Transitive imports leak too, but this test only reads
 * each client file's own imports, so review what a new import pulls in.
 */
import { describe, expect, test } from 'bun:test'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const SRC = path.resolve(import.meta.dir, '../../src')

/**
 * Import paths that must never appear in a `'use client'` module. Add every
 * new server-only lib here.
 */
const FORBIDDEN_IMPORT_RE =
  /from\s+['"](~\/db(?:\/(?:schema|enums|relations|common|index))?|~\/env|~\/lib\/(?:auth|safe-action|email-service|nodemailer)|server-only|drizzle-orm(?:\/[^'"]*)?)['"]/

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.(ts|tsx)$/.test(name)) out.push(full)
  }
  return out
}

describe('client / server boundary', () => {
  test('no use-client file imports server runtime or db modules', () => {
    const violations: string[] = []

    for (const file of walk(SRC)) {
      const source = readFileSync(file, 'utf8')
      if (
        !source.includes("'use client'") &&
        !source.includes('"use client"')
      ) {
        continue
      }

      for (const [index, line] of source.split('\n').entries()) {
        // Type-only imports are erased, but they are banned too so a later
        // value import is harder to slip in.
        if (!FORBIDDEN_IMPORT_RE.test(line)) continue
        // Explicit client-safe siblings
        if (line.includes('auth-client')) continue
        if (line.includes('safe-action-client')) continue

        const rel = path.relative(SRC, file)
        violations.push(`${rel}:${index + 1}: ${line.trim()}`)
      }
    }

    expect(violations).toEqual([])
  })
})
