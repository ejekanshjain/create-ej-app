/**
 * @fileoverview Installs Postgres functions and triggers that Drizzle cannot
 * manage.
 *
 * Support tickets get a `TICKET-000001` number from a counter table. The
 * counter function upserts atomically, and a BEFORE INSERT trigger fills in
 * `ticket_number`, so inserts never pass the number themselves.
 *
 * Everything is CREATE OR REPLACE, so the script is safe to re-run.
 * `bun run db:push` runs it before `drizzle-kit push`.
 */

import { sql } from 'drizzle-orm'
import { db } from '~/db'

/** Installs every custom function and trigger on the given client. */
export async function setupDatabase(database: typeof db = db): Promise<void> {
  // INSERT ... ON CONFLICT ... DO UPDATE is one atomic statement, so two
  // concurrent calls never receive the same number.
  await database.execute(sql`
    CREATE OR REPLACE FUNCTION get_next_support_ticket_number()
    RETURNS TEXT AS $$
    DECLARE
        new_number INTEGER;
    BEGIN
        INSERT INTO support_ticket_counter (id, counter)
        VALUES (1, 1)
        ON CONFLICT (id)
        DO UPDATE SET counter = support_ticket_counter.counter + 1
        RETURNING counter INTO new_number;

        RETURN 'TICKET-' || LPAD(new_number::TEXT, 6, '0');
    END;
    $$ LANGUAGE plpgsql;
  `)

  // An explicit ticket_number (seeding, migrations) skips the counter.
  await database.execute(sql`
    CREATE OR REPLACE FUNCTION trg_set_support_ticket_number()
    RETURNS TRIGGER AS $$
    BEGIN
        IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
            NEW.ticket_number := get_next_support_ticket_number();
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `)

  // On a fresh database this runs before drizzle-kit push, so create a stub
  // table for the trigger to attach to. The push then adds the real columns.
  await database.execute(sql`
    CREATE TABLE IF NOT EXISTS support_tickets (
      id TEXT PRIMARY KEY
    );
  `)

  await database.execute(sql`
    CREATE OR REPLACE TRIGGER set_support_ticket_number
    BEFORE INSERT ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION trg_set_support_ticket_number();
  `)
}

if (import.meta.main) {
  setupDatabase(db)
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Error running setup-db:', err)
      process.exit(1)
    })
}
