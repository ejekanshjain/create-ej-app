# create-ej-app

A no-bullshit CLI to bootstrap production-ready **fucking beasts** of apps with Next.js, Better Auth, Drizzle ORM, Elysia, Workflow, shadcn/ui, React Email, OTEL, and deployment wired up so you don’t screw your shit up in production.

```bash
bunx create-ej-app@latest
```

---

## ✨ Features (aka the good shit)

- **Next.js 16** – Powered by React 19, Server Components, App Router. Fast as hell.

- **Better Auth** – Auth that doesn’t suck:
  - Email/Password
  - Magic link (because passwords are annoying as fuck)
  - OAuth with GitHub and Google
  - Account linking
  - Admin powers

- **Drizzle ORM** – Type-safe SQL over PostgreSQL without the usual ORM garbage.

- **Elysia** – Built for Bun. Minimal, fast, no nonsense.

- **Workflow** – Durable jobs so your background tasks don’t randomly die like weak shit.

- **React Email** – Build transactional emails using React components instead of ugly HTML nightmares.

- **OTEL (OpenTelemetry)** – Production-grade observability:
  - Distributed tracing
  - Metrics
  - Structured logs
  - Works with GCP, Datadog, Honeycomb, Grafana, etc.

- **shadcn/ui** – Clean, accessible components built on Radix UI.

- **TailwindCSS 4** – Utility-first styling with zero CSS drama.

- **TypeScript** – Strict types so you don’t ship dumb bugs.

- **TanStack Query** – Server state that doesn’t implode.

- **Lucide React** – Icons that don’t look like 2009 garbage.

- **Docker + Terraform** – Ship this shit properly.

- Terraform setup for Google Cloud Platform so you don’t YOLO infra.

---

## 📋 Templates (Pick your poison)

Choose your template based on what you’re building:

### Next.js Full-Stack App

Full-stack setup with Next.js 16, Better Auth, shadcn/ui, and Drizzle ORM. Perfect for web apps that need auth, UI, and backend APIs.

### API Server

Production-ready REST API built with Elysia on Bun, Drizzle ORM, PostgreSQL, and Zod validation. Perfect for headless APIs, microservices, internal tools, or that backend you actually want to scale without it exploding like fragile shit.

---

## 🚀 Quick Start (Let’s fucking go)

```bash
bunx create-ej-app@latest
```

You’ll be prompted for:

- Project name
- Description
- Template (nextjs or api)
- Git init (because not using git in 2026 is wild)

Example:

```bash
? Enter the project name: badass-app
? Enter a description: My savage Next.js monster
? Select a template: nextjs
? Initialize a git repository? yes
```

Boom. Done.

---

## 📦 What You Actually Get

### Next.js Full-Stack Template

**Tech Stack (The real weapons)**

- **Framework**: Next.js
- **Runtime**: Bun (fast as shit)
- **Backend**: Elysia APIs
- **Database**: PostgreSQL + Drizzle
- **Auth**: Better Auth
- **Emails**: React Email (transactional + auth templates ready)
- **Observability**: OpenTelemetry
- **Background Jobs**: Workflow
- **UI**: shadcn/ui
- **Styling**: TailwindCSS
- **State**: TanStack Query
- **Forms**: react-hook-form + Zod
- **Theme**: Dark mode out of the box

### API Server Template

**Tech Stack (The real weapons)**

- **Runtime**: Bun (blazing fast as fuck)
- **Framework**: Elysia
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod v4
- **API Docs**: Auto-generated OpenAPI docs
- **Containerisation**: Docker with distroless images
- **Type Checking**: TypeScript with strict mode
- **Formatting**: Prettier
- **Environment**: Validated env vars with @t3-oss/env-core

---

## 🛠 Setup & Development

### Prerequisites

- Node 24+ or Bun
- PostgreSQL running
- OAuth creds if you want GitHub/Google login (Next.js template)
- Email provider (Resend, SES, Postmark, etc.) (Next.js template)

### Install

```bash
cd my-app
bun install
# or npm / pnpm / yarn if that’s your thing
```

---

### Environment Variables

Copy `.env.example` → `.env` and fill your secrets like a responsible adult.

Don’t commit this crap. Seriously.

---

## 💻 Development

### Next.js Template

```bash
bun run dev
```

Open `http://localhost:3000` and admire your badass setup.

### API Template

```bash
bun run dev
```

API runs on `http://localhost:3000`. OpenAPI docs at `http://localhost:3000/docs`.

Fire it up, hit the endpoints, break things on purpose, and watch it handle your shit properly.

---

## 🐳 Docker (Ship it like a pro)

```bash
bun run build:docker
docker run -p 3000:3000 my-awesome-project
```

No "works on my machine" bullshit anymore.

---

## ☁️ Infrastructure (The Cloud Shit) - Next.js Template

Terraform config included for:

- Cloud Run
- Cloud SQL
- Artifact Registry
- Cloud Build
- Secret Manager
- Load Balancer
- VPC

Deploy it:

```bash
cd terraform
terraform init
terraform apply
```

And now you’re running production infra like a grown-ass engineer.

---

## 🔐 Authentication - Next.js Template

Better Auth gives you:

- Email/Password login
- Magic links (no password drama)
- OAuth (GitHub, Google)
- Admin panel
- User impersonation

Secure, extensible, no duct-taped auth spaghetti.

---

## 🎨 UI Components - Next.js Template

Preinstalled:

- Button
- Card
- Form
- Input
- Toast notifications

Need more?

```bash
bunx shadcn@latest add [component-name]
```

Ship beautiful shit without reinventing buttons for the 900th time.

---

## 🎯 Route Groups - Next.js Template

Organized like a sane human:

- `(admin)` – Admin dashboard
- `(app)` – Main app (auth required)
- `(auth)` – Login/signup
- `(marketing)` – Public pages

No messy folder hell.

---

## 🔧 Customization

### Next.js Template

Edit:

- `siteConfig.ts` – change name/description
- `schema.ts` – change DB schema
- `auth.ts` – tweak providers

Then push schema and move on with your life.

### API Template

Edit:

- `src/db/schema.ts` – change DB schema and model your data like a boss
- `src/routes/` – add new API endpoints and wire your logic properly
- `src/env.ts` – add new env vars and validate that shit

Push schema with `bun run db:push` and type-check with `bun run type-check`.

---

## 🏗️ API Template Architecture

Built with a clean layered architecture (no spaghetti garbage):

- **Routes** (`src/routes/`) – HTTP endpoints, validation, call data-access. Keep it sharp.
- **Data-Access** (`src/data-access/`) – Direct DB interactions per resource. No random queries scattered like WTF.
- **Database** (`src/db/`) – Drizzle client, schemas, reusable fields. Your source of truth.
- **Library** (`src/lib/`) – Shared utilities and Zod schemas so you don’t duplicate crap everywhere.

Includes a full CRUD API for todos with pagination, sorting, search, and OpenAPI docs so you can see your shit documented without extra effort.

### API Commands

- `bun run dev` – Start dev server with hot-reload
- `bun run build` – Type-check and compile to native binary
- `bun run type-check` – Run TypeScript checker
- `bun run db:push` – Push schema to DB
- `bun run db:studio` – Open Drizzle Studio
- `bun run db:seed` – Seed database

---

## 🤝 Contributing

PRs welcome. Don’t submit half-broken shit.

---

## 📄 License

MIT. Do whatever the hell you want, just don’t blame us if you screw it up.

---

## 🔗 Links

- Repository: [https://github.com/ejekanshjain/create-ej-app](https://github.com/ejekanshjain/create-ej-app)
- Issues: [https://github.com/ejekanshjain/create-ej-app/issues](https://github.com/ejekanshjain/create-ej-app/issues)
- Docs:
  - [Next.js](https://nextjs.org/docs)
  - [Better Auth](https://better-auth.com)
  - [Drizzle ORM](https://orm.drizzle.team)
  - [Elysia](https://elysiajs.com)
  - [Workflow](https://useworkflow.dev)
  - [shadcn/ui](https://ui.shadcn.com)
  - [React Email](https://react.email)
  - [Logging](https://loggingsucks.com)

---

Now go build some badass production-ready shit instead of another half-baked side project. 🚀
