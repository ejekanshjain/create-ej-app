# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## Technology

The application uses:

- **Application**: Next.js, React, and TypeScript
- **Interface**: Tailwind CSS, shadcn/ui, and TanStack Query
- **Data**: PostgreSQL and Drizzle ORM
- **Authentication**: Better Auth with magic links, OAuth, and system roles
- **Validation and actions**: Zod and next-safe-action
- **Runtime and tests**: Bun and PGlite
- **Email**: Nodemailer and React Email

## Architecture

Next.js route groups separate each product surface:

| Directory             | Route                | Purpose                 |
| --------------------- | -------------------- | ----------------------- |
| `src/app/(marketing)` | `/`                  | Landing and legal pages |
| `src/app/(auth)`      | `/login`, `/profile` | Sign-in and profile     |
| `src/app/(app)`       | `/app/*`             | Signed-in product       |
| `src/app/(admin)`     | `/admin/*`           | Platform administration |

Shared code has clear responsibilities:

- `src/components`: shared interface components
- `src/lib`: access checks, validation, formatting, and integrations
- `src/db`: schema, relations, and database connection
- `src/emails`: React Email templates
- `tests`: focused integration and unit tests

Server actions sit beside their routes in `actions` directories. Each protected action validates input, enforces the correct role, and records one structured event. Page and layout files fetch data through actions instead of importing the database.

## Local setup

Install these prerequisites:

- [Bun](https://bun.sh/)
- [PostgreSQL](https://www.postgresql.org/) with an empty local database
- OAuth credentials for GitHub and Google
- SMTP credentials

Then prepare the application:

```bash
bun install
```

`create-ej-app` already wrote `.env` from `.env.example`. Fill in working credentials, then apply the database schema and add starter data:

```bash
bun run db:push
bun run db:seed
```

Start the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). The seed creates `superadmin@example.com` and `user@example.com`; change them in `src/scripts/seed.ts` to addresses whose inbox you can read.

## Commands

Use these commands during development:

| Command              | Purpose                             |
| -------------------- | ----------------------------------- |
| `bun run dev`        | Start the development server        |
| `bun test`           | Run tests with in-memory PostgreSQL |
| `bun run test:real`  | Run tests against `DATABASE_URL`    |
| `bun run lint`       | Run ESLint                          |
| `bun run type-check` | Check TypeScript                    |
| `bun run format`     | Format source and test files        |
| `bun run build`      | Create a production build           |
| `bun run db:push`    | Apply the Drizzle schema            |
| `bun run db:studio`  | Open Drizzle Studio                 |
| `bun run db:seed`    | Add starter data                    |
| `bun run db:reset`   | Drop every table                    |
| `bun run email:dev`  | Preview email templates             |
| `bun run email:test` | Send a test email to an address     |

Before opening a pull request, run:

```bash
bun test
bun run lint
bun run type-check
bun run build
```

## Implement a change

Follow this path for product changes:

1. Find the matching route under `src/app` and read its nearby actions and components.
2. Add or update a focused test before changing behavior.
3. Put shared limits and repeated values in `src/lib/constants.ts`.
4. Validate action input with Zod and select the narrowest action client in `src/lib/safe-action.ts`.
5. Throw `AppError` for expected failures and give customers a clear next step.
6. Wrap new actions with `withWideEvent` and exclude secrets from event attributes.
7. Format the files you touched, then run the relevant checks.

Read [AGENTS.md](AGENTS.md) before making a substantial change. It documents authorization, testing, and writing rules.
