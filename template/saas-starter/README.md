# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## Technology

The application uses:

- **Application**: Next.js, React, and TypeScript
- **Interface**: Tailwind CSS, shadcn/ui, and TanStack Query
- **Data**: PostgreSQL and Drizzle ORM
- **Authentication**: Better Auth with system roles and organizations
- **Billing**: Stripe Checkout, the billing portal, and webhooks
- **Validation and actions**: Zod and next-safe-action
- **Runtime and tests**: Bun and PGlite
- **Storage and email**: Cloudflare R2, Nodemailer, and React Email

## Architecture

Next.js route groups separate each product surface:

| Directory              | Route                  | Purpose                                   |
| ---------------------- | ---------------------- | ----------------------------------------- |
| `src/app/(marketing)`  | `/`                    | Landing, contact, and legal pages         |
| `src/app/(auth)`       | `/login`, `/profile`   | Sign-in, profile, and account support     |
| `src/app/(app)`        | `/app/*`               | Organization workspace, settings, billing |
| `src/app/(admin)`      | `/admin/*`             | Platform administration                   |
| `src/app/(invitation)` | `/accept-invitation/*` | Organization invitations                  |

Shared code has clear responsibilities:

- `src/components`: shared interface components
- `src/lib`: access checks, billing, storage, validation, and integrations
- `src/db`: schema, relations, enums, and database connection
- `src/emails`: React Email templates
- `tests`: focused integration and unit tests

Server actions sit beside their routes in `actions` directories. Each protected action validates input, enforces the correct role, and records one structured event. Page and layout files fetch data through actions instead of importing the database.

## Local setup

Install these prerequisites:

- [Bun](https://bun.sh/)
- [PostgreSQL](https://www.postgresql.org/) with an empty local database
- OAuth credentials for GitHub and Google
- SMTP credentials
- A Stripe account and the [Stripe CLI](https://docs.stripe.com/stripe-cli)

Then prepare the application:

```bash
bun install
```

`create-ej-app` already wrote `.env` from `.env.example`, with a random `BETTER_AUTH_SECRET`. Fill in working credentials.

Cloudflare R2 variables are optional. Without them, uploads are stored in the database as data URLs, so set them before production. With R2 on, schedule `bun run storage:cleanup` to delete abandoned uploads.

Create the Stripe products and prices, then copy the IDs from `stripe.txt` into `.env`:

```bash
bun run stripe:setup
```

Apply the database schema and add starter data:

```bash
bun run db:push
bun run db:seed
```

Start the development server, and forward Stripe webhooks in a second terminal:

```bash
bun run dev
bun run stripe:dev
```

Open [http://localhost:3000](http://localhost:3000). The seed creates `superadmin@example.com` and `user@example.com`; change them in `src/scripts/seed.ts` to addresses whose inbox you can read.

## Commands

Use these commands during development:

| Command                   | Purpose                             |
| ------------------------- | ----------------------------------- |
| `bun run dev`             | Start the development server        |
| `bun test`                | Run tests with in-memory PostgreSQL |
| `bun run test:real`       | Run tests against `DATABASE_URL`    |
| `bun run lint`            | Run ESLint                          |
| `bun run type-check`      | Check TypeScript                    |
| `bun run format`          | Format source and test files        |
| `bun run build`           | Create a production build           |
| `bun run db:push`         | Apply the Drizzle schema            |
| `bun run db:studio`       | Open Drizzle Studio                 |
| `bun run db:seed`         | Add starter data                    |
| `bun run db:reset`        | Drop every table                    |
| `bun run email:dev`       | Preview email templates             |
| `bun run email:test`      | Send a test email to an address     |
| `bun run storage:cleanup` | Delete abandoned uploads from R2    |

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
5. Enforce organization access with helpers from `src/lib/organization-access.ts`.
6. Throw `AppError` for expected failures and give customers a clear next step.
7. Wrap new actions with `withWideEvent` and exclude secrets from event attributes.
8. Format the files you touched, then run the relevant checks.

Read [AGENTS.md](AGENTS.md) before making a substantial change. It documents authorization, billing, file storage, testing, and writing rules.
