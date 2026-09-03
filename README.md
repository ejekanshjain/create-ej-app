# create-ej-app

CLI to bootstrap production-ready apps with Next.js, Better Auth, Drizzle ORM, Elysia, Workflow, shadcn/ui, React Email, OpenTelemetry, and deployment already wired up.

```bash
bunx create-ej-app@latest
```

---

## Features

- **Next.js 16** — React 19, Server Components, App Router
- **Better Auth**
  - Email / password
  - Magic link
  - GitHub and Google OAuth
  - Account linking
  - Admin role
- **Drizzle ORM** — type-safe SQL over PostgreSQL
- **Elysia** — fast HTTP APIs on Bun
- **Workflow** — durable background jobs
- **React Email** — transactional emails as React components
- **OpenTelemetry** — traces, metrics, and structured logs (GCP, Datadog, Honeycomb, Grafana)
- **shadcn/ui** — accessible components on Radix UI
- **Tailwind CSS 4**
- **TypeScript** — strict mode
- **TanStack Query**
- **Lucide React**
- **Docker + Terraform** — Cloud Run, Cloud SQL, and related GCP resources

---

## Templates

### Next.js full-stack app

Next.js 16, Better Auth, shadcn/ui, and Drizzle ORM. Use this for web apps that need auth, UI, and backend APIs.

### API server

REST API with Elysia on Bun, Drizzle ORM, PostgreSQL, and Zod validation. Use this for headless APIs, internal tools, and services.

---

## Quick start

```bash
bunx create-ej-app@latest
```

You will be prompted for:

- Project name
- Description
- Template (`nextjs` or `api`)
- Whether to initialize git

Example:

```text
? Enter the project name: my-app
? Enter a description: Production-ready Next.js app
? Select a template: nextjs
? Initialize a git repository? yes
```

---

## What you get

### Next.js full-stack template

| Layer         | Stack                                          |
| ------------- | ---------------------------------------------- |
| Framework     | Next.js                                        |
| Runtime       | Bun                                            |
| Backend       | Elysia APIs                                    |
| Database      | PostgreSQL + Drizzle                           |
| Auth          | Better Auth                                    |
| Email         | React Email (transactional and auth templates) |
| Observability | OpenTelemetry                                  |
| Jobs          | Workflow                                       |
| UI            | shadcn/ui                                      |
| Styling       | Tailwind CSS                                   |
| Server state  | TanStack Query                                 |
| Forms         | react-hook-form + Zod                          |
| Theme         | Dark mode included                             |

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

- Node 24+ or Bun
- PostgreSQL
- OAuth credentials for GitHub / Google (Next.js template)
- An email provider such as Resend, SES, or Postmark (Next.js template)

### Install

```bash
cd my-app
bun install
```

npm, pnpm, and yarn also work.

### Environment variables

Copy `.env.example` to `.env` and fill in the values. Do not commit `.env`.

---

## Development

### Next.js template

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
docker run -p 3000:3000 my-app
```

---

## Infrastructure (Next.js template)

Terraform is included for:

- Cloud Run
- Cloud SQL
- Artifact Registry
- Cloud Build
- Secret Manager
- Load balancer
- VPC

```bash
cd terraform
terraform init
terraform apply
```

---

## Authentication (Next.js template)

Better Auth is set up with:

- Email / password
- Magic links
- GitHub and Google OAuth
- Admin panel
- User impersonation

---

## UI (Next.js template)

Preinstalled components:

- Button
- Card
- Form
- Input
- Toast

Add more with:

```bash
bunx shadcn@latest add [component-name]
```

---

## Route groups (Next.js template)

- `(admin)` — admin dashboard
- `(app)` — authenticated app
- `(auth)` — login and signup
- `(marketing)` — public pages

---

## Customization

### Next.js template

- `siteConfig.ts` — name and description
- `schema.ts` — database schema
- `auth.ts` — auth providers

### API template

- `src/db/schema.ts` — schema
- `src/routes/` — endpoints
- `src/env.ts` — environment variables

Push the schema with `bun run db:push`. Type-check with `bun run type-check`.

---

## API template architecture

- **Routes** (`src/routes/`) — HTTP, validation, call data-access
- **Data-access** (`src/data-access/`) — database access per resource
- **Database** (`src/db/`) — Drizzle client, schemas, shared fields
- **Library** (`src/lib/`) — shared utilities and Zod schemas

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
