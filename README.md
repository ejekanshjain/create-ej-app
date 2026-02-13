# create-ej-app

A no-bullshit CLI to bootstrap a production-ready **fucking beast** of a app with Next.js, Better Auth, Drizzle ORM, Elysia, Workflow, shadcn/ui, and deployment wired up so you don’t screw your shit up in production.

```bash
npx create-ej-app@latest
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
- **shadcn/ui** – Clean, accessible components built on Radix UI.
- **TailwindCSS 4** – Utility-first styling with zero CSS drama. TailwindCSS
- **TypeScript** – Strict types so you don’t ship dumb bugs. TypeScript
- **TanStack Query** – Server state that doesn’t implode. TanStack Query
- **Lucide React** – Icons that don’t look like 2009 garbage. Lucide React
- **Docker + Terraform** – Ship this shit properly.
- Terraform setup for Google Cloud Platform so you don’t YOLO infra.

---

## 🚀 Quick Start (Let’s fucking go)

```bash
npx create-ej-app@latest
```

You’ll be prompted for:

- Project name
- Description
- Template
- Git init (because not using git in 2026 is wild)

Example:

```bash
? Enter the project name: badass-app
? Enter a description: My savage Next.js monster
? Select a template: base
? Initialize a git repository? yes
```

Boom. Done.

---

## 📦 What You Actually Get

### Tech Stack (The real weapons)

- **Framework**: Next.js
- **Runtime**: Bun (fast as shit)
- **Backend**: Elysia APIs
- **Database**: PostgreSQL + Drizzle
- **Auth**: Better Auth
- **Background Jobs**: Workflow
- **UI**: shadcn/ui
- **Styling**: TailwindCSS
- **State**: TanStack Query
- **Forms**: react-hook-form + Zod
- **Theme**: Dark mode out of the box

---

## 🛠 Setup & Development

### Prerequisites

- Node 24+ or Bun
- PostgreSQL running
- OAuth creds if you want GitHub/Google login

### Install

```bash
cd my-app
bun install
# or npm / pnpm / yarn if that’s your thing
```

---

### Environment Variables

Copy `.env.example` → `.env` and fill your secrets like a responsible adult.

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
BETTER_AUTH_SECRET="super-secret-shit"
```

Don’t commit this crap. Seriously.

---

## 🗄 Database

Push schema:

```bash
npm run db:push
```

Open Drizzle Studio:

```bash
npm run db:studio
```

No migrations? No tears. Just push and move on.

---

## 💻 Development

```bash
npm run dev
```

Open `http://localhost:3000` and admire your badass setup.

---

## 🐳 Docker (Ship it like a pro)

```bash
docker build -t my-app .
docker run -p 3000:3000 my-app
```

No “works on my machine” bullshit anymore.

---

## ☁️ Infrastructure (The Cloud Shit)

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

## 🔐 Authentication

Better Auth gives you:

- Email/Password login
- Magic links (no password drama)
- OAuth (GitHub, Google)
- Admin panel
- User impersonation

Secure, extensible, no duct-taped auth spaghetti.

---

## 🎨 UI Components

Preinstalled:

- Button
- Card
- Form
- Input
- Toast notifications

Need more?

```bash
npx shadcn@latest add [component-name]
```

Ship beautiful shit without reinventing buttons for the 900th time.

---

## 🎯 Route Groups

Organized like a sane human:

- `(admin)` – Admin dashboard
- `(app)` – Main app (auth required)
- `(auth)` – Login/signup
- `(marketing)` – Public pages

No messy folder hell.

---

## 🔧 Customization

Edit:

- `siteConfig.ts` – change name/description
- `schema.ts` – change DB schema
- `auth.ts` – tweak providers

Then push schema and move on with your life.

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

---

Now go build some badass production-ready shit instead of another half-baked side project. 🚀
