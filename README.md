# create-ej-app

CLI to bootstrap production-ready apps with Next.js, Better Auth, Drizzle ORM, Elysia, Workflow, shadcn/ui, React Email, OpenTelemetry, and deployment already wired up.

```bash
bunx create-ej-app@latest
```

---

## Features

- **Next.js 16**: React 19, Server Components, App Router
- **Better Auth**:
  - Magic link
  - GitHub and Google OAuth
  - Account linking
  - `user`, `admin`, and `superadmin` roles
  - Organizations (SaaS starter)
- **Drizzle ORM**: type-safe SQL over PostgreSQL
- **Stripe**: subscriptions, trials, and the billing portal (SaaS starter)
- **Elysia**: HTTP APIs on Bun
- **Workflow**: durable background jobs
- **React Email**: transactional emails as React components
- **OpenTelemetry**: traces with one wide event per server action
- **shadcn/ui**: accessible components on Radix UI
- **Tailwind CSS 4**
- **TypeScript**: strict mode
- **TanStack Query**
- **Bun tests on PGlite**: in-memory Postgres, no database server needed
- **Docker**

---

## Templates

### Next.js full-stack app (`nextjs`)

Next.js 16, Better Auth, shadcn/ui, and Drizzle ORM. Use it for web apps that need sign-in, an admin panel, and server actions.

### SaaS starter (`saas-starter`)

Everything in `nextjs`, plus organizations with invitations and roles, Stripe subscriptions with trials and the billing portal, R2 uploads, support tickets, in-app feedback, and a contact form.

### API server (`api`)

REST API with Elysia on Bun, Drizzle ORM, PostgreSQL, and Zod validation. Use it for headless APIs, internal tools, and services.

---

## Quick start

```bash
bunx create-ej-app@latest
```

You will be prompted for:

- Project name
- Description
- Template (`nextjs`, `saas-starter`, or `api`)
- Whether to initialize git

Example:

```text
? Enter the project name: my-app
? Enter a description for the project: Production-ready Next.js app
? Select a template: nextjs
? Initialize a git repository? yes
```

---

## What you get

### Next.js and SaaS templates

| Layer         | Stack                                             |
| ------------- | ------------------------------------------------- |
| Framework     | Next.js 16, React 19, React Compiler              |
| Runtime       | Bun                                               |
| Database      | PostgreSQL + Drizzle ORM                          |
| Auth          | Better Auth: magic link, GitHub, Google, roles    |
| Actions       | next-safe-action with role-based clients          |
| Errors        | `AppError` with customer-safe messages            |
| Observability | OpenTelemetry, one wide event per action          |
| Email         | React Email + Nodemailer, sent by Workflow        |
| UI            | shadcn/ui, Tailwind CSS 4, dark mode, Geist fonts |
| Data fetching | TanStack Query + nuqs URL state                   |
| Forms         | react-hook-form + Zod                             |
| Tests         | Bun tests on in-memory Postgres (PGlite)          |
| Agent docs    | `AGENTS.md` and `CLAUDE.md` with project rules    |

Both templates ship with:

- An admin panel with user management, impersonation, and ban controls
- Profile page, error pages, 404 page, robots.txt, and sitemap
- A seed script, a database reset script, and focused tests
- A test that fails when a client component imports server-only code
- A test that fails when a foreign key has no index or delete rule

The SaaS starter adds:

- Organizations with owner, admin, and member roles, plus email invitations
- Stripe Checkout, trials, the billing portal, and idempotent webhooks
- Per-plan member limits
- Organization logos on Cloudflare R2, with ownership checks on every upload
- Support tickets shared by organization managers and answered from the admin panel
- In-app feedback and a public contact form, each with an admin inbox

### API server template

| Layer       | Stack                                      |
| ----------- | ------------------------------------------ |
| Runtime     | Bun                                        |
| Framework   | Elysia                                     |
| Database    | PostgreSQL + Drizzle ORM                   |
| Validation  | Zod v4                                     |
| API docs    | Auto-generated OpenAPI                     |
| Containers  | Docker, distroless images                  |
| Types       | TypeScript, strict mode                    |
| Formatting  | Prettier                                   |
| Environment | Validated env vars with `@t3-oss/env-core` |

---

## Setup

### Prerequisites

- [Bun](https://bun.sh/): the template scripts, tests, and Dockerfiles run on it
- PostgreSQL
- OAuth credentials for GitHub and Google (Next.js and SaaS templates)
- SMTP credentials from a provider such as Resend, SES, or Postmark (Next.js and SaaS templates)
- A Stripe account and the Stripe CLI (SaaS template)

### Install

```bash
cd my-app
bun install
```

Bun is required: the templates' scripts and Dockerfiles call `bun` directly.

### Environment variables

The CLI creates `.env` from `.env.example` with a random `BETTER_AUTH_SECRET`. Fill in the rest, and never commit `.env`.

---

## Development

### Next.js and SaaS templates

```bash
bun run dev
```

App: `http://localhost:3000`

### API template

```bash
bun run dev
```

API: `http://localhost:3000`
OpenAPI docs: `http://localhost:3000/docs`

---

## Docker

```bash
bun run build:docker
docker run --env-file .env -p 3000:3000 my-app
```

The Next.js and SaaS images are tagged `my-app` and the API image `my-api`; change the tag in `package.json`. The build uses `.env.example` values, so pass real ones at run time with `--env-file`. Run `bun install` first so `bun.lock` exists.

---

## Next.js and SaaS templates

Each generated project documents itself. Read these first:

- `README.md`: setup steps and commands
- `AGENTS.md`: architecture, authorization rules, and writing rules for you and for coding agents
- `src/lib/siteConfig.ts`: product name, description, and contact email
- `src/db/schema.ts`: database schema

Push the schema with `bun run db:push`, seed it with `bun run db:seed`, and run the tests with `bun test`.

Add shadcn components with:

```bash
bunx shadcn@latest add your_component_name
```

---

## API template architecture

- **Routes** (`src/routes/`): HTTP, validation, call data-access
- **Data-access** (`src/data-access/`): database access per resource
- **Database** (`src/db/`): Drizzle client, schemas, shared fields
- **Library** (`src/lib/`): shared utilities and Zod schemas

Includes a sample todos CRUD API with pagination, sorting, search, and OpenAPI docs.

### API commands

| Command              | Purpose                    |
| -------------------- | -------------------------- |
| `bun run dev`        | Dev server with hot reload |
| `bun run build`      | Type-check and compile     |
| `bun run type-check` | TypeScript check           |
| `bun run db:push`    | Push schema                |
| `bun run db:studio`  | Drizzle Studio             |
| `bun run db:seed`    | Seed the database          |

---

## Contributing

Pull requests are welcome. Please keep changes focused and working.

## License

MIT.
