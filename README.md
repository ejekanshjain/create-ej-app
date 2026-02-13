# create-ej-app

A powerful CLI tool to bootstrap production-ready Next.js applications with a modern tech stack including Better Auth, Drizzle ORM, Elysia, Workflow, shadcn/ui, and comprehensive deployment setup.

```bash
npx create-ej-app@latest
```

## ✨ Features

- **Next.js 16** - Latest version with React 19, Server Components, and App Router
- **Better Auth** - Complete authentication solution with:
  - Email/Password authentication
  - Magic Link login
  - OAuth (GitHub, Google)
  - Account linking
  - Admin management capabilities
- **Drizzle ORM** - Type-safe database access with PostgreSQL
- **Elysia** - Bun-first ergonomic web framework for building backend APIs
- **Workflow** - Durable execution framework for background jobs, long-running tasks, and reliable async workflows
- **shadcn/ui** - Beautiful, accessible UI components
- **TailwindCSS 4** - Utility-first CSS with the latest features
- **TypeScript** - Full type safety across the stack
- **Form Management** - react-hook-form with Zod validation
- **Data Fetching** - TanStack Query (React Query) for server state management
- **Server Actions** - Type-safe server actions with next-safe-action
- **Email Service** - Built-in email support with Nodemailer
- **Docker Support** - Production-ready Dockerfile included
- **Terraform IaC** - Complete infrastructure setup for Google Cloud Platform
- **Pre-configured Layouts** - Admin, App, Auth, and Marketing layouts

## 🚀 Quick Start

### Create a New Project

```bash
npx create-ej-app@latest
```

The CLI will prompt you for:

- **Project Name**: Name of your project (default: `my-app`)
- **Description**: Brief description of your project
- **Template**: Choose from available templates (currently: `base`)
- **Git**: Initialize a git repository (yes/no)

### Example

```bash
npx create-ej-app@latest

# Follow the prompts:
# ? Enter the project name: awesome-app
# ? Enter a description for the project: My awesome Next.js application
# ? Select a template: base
# ? Initialize a git repository? yes
```

## 📦 What's Included

### Tech Stack

- **Framework**: Next.js
- **Runtime**: Bun (optimized for performance)
- **Backend APIs**: Elysia (Bun-first web framework)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth
- **Background Jobs**: Workflow DevKit (durable execution with automatic retries)
- **UI Library**: shadcn/ui with Radix UI primitives
- **Styling**: TailwindCSS
- **Type Safety**: TypeScript + Zod
- **Forms**: react-hook-form + @hookform/resolvers
- **State Management**: TanStack Query
- **Icons**: Lucide React
- **Theme**: next-themes (dark mode support)

### Project Structure

```
my-app/
├── src/
│   ├── app/
│   │   ├── (admin)/          # Admin dashboard routes
│   │   ├── (app)/            # Main application routes
│   │   ├── (auth)/           # Authentication pages
│   │   ├── (marketing)/      # Public marketing pages
│   │   └── api/              # API routes (Better Auth)
│   ├── components/
│   │   └── ui/               # shadcn/ui components
│   ├── db/
│   │   ├── index.ts          # Database connection
│   │   └── schema.ts         # Drizzle schema
│   └── lib/
│       ├── auth.ts           # Better Auth configuration
│       ├── auth-client.ts    # Client-side auth utilities
│       └── siteConfig.ts     # Site metadata
├── terraform/                 # Infrastructure as Code
├── Dockerfile                # Production Docker build
└── drizzle.config.ts         # Drizzle ORM configuration
```

## 🛠️ Setup & Development

### Prerequisites

- Node.js 24+ or Bun
- PostgreSQL database
- OAuth credentials (optional, for GitHub/Google login)

### Installation

```bash
cd my-app

# Install dependencies
npm install
# or
pnpm install
# or
yarn install
# or
bun install
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
APP_ENV="development"
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="your-secret-key"

# OAuth Providers (optional)
BETTER_AUTH_GITHUB_ID="your-github-client-id"
BETTER_AUTH_GITHUB_SECRET="your-github-client-secret"
BETTER_AUTH_GOOGLE_ID="your-google-client-id"
BETTER_AUTH_GOOGLE_SECRET="your-google-client-secret"

# Email Configuration
EMAIL_SERVER_USER="smtp-username"
EMAIL_SERVER_PASSWORD="smtp-password"
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT="465"
EMAIL_FROM="no-reply@example.com"
```

### Database Setup

```bash
# Push schema to database
npm run db:push

# Open Drizzle Studio
npm run db:studio
```

### Development

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check
- `npm run format` - Format code with Prettier
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio
- `npm run gen:auth` - Generate Better Auth types
- `npm run build:docker` - Build Docker image
- `npm run analyze` - Analyze bundle size

## 🔐 Authentication

The base template includes Better Auth with multiple authentication methods:

### Email/Password Login

Users can register and login with email and password.

### Magic Link

Passwordless authentication via email magic links.

### OAuth Providers

Pre-configured for:

- GitHub
- Google

### Admin Features

Built-in admin plugin for user management and impersonation.

## 🎨 UI Components

The project uses shadcn/ui with pre-installed components:

- Button
- Card
- Form
- Input
- Label
- Separator
- Sonner (Toast notifications)

Add more components:

```bash
npx shadcn@latest add [component-name]
```

## 🐳 Docker Deployment

Build and run with Docker:

```bash
# Build image
docker build -t my-app .

# Run container
docker run -p 3000:3000 my-app
```

## ☁️ Infrastructure (Terraform)

The template includes Terraform configuration for Google Cloud Platform deployment:

- Cloud Run service
- Cloud SQL (PostgreSQL)
- Artifact Registry
- Load Balancer with SSL
- VPC network configuration
- Cloud Build for CI/CD
- Secret Manager

Deploy to GCP:

```bash
cd terraform
./setup.sh
terraform init
terraform plan
terraform apply
```

## 🎯 Route Groups

The app uses Next.js route groups for layout organization:

- **(admin)** - Admin dashboard (requires admin role)
- **(app)** - Main application (requires authentication)
- **(auth)** - Login, signup pages (public)
- **(marketing)** - Landing page, privacy, terms (public)

## 🔧 Customization

### Site Configuration

Edit `src/lib/siteConfig.ts`:

```typescript
export const siteConfig = {
  name: 'Your App Name',
  description: 'Your app description'
}
```

### Database Schema

Modify `src/db/schema.ts` and run:

```bash
npm run db:push
```

### Authentication Configuration

Customize `src/lib/auth.ts` to add/remove providers or configure auth behavior.

## 📚 Package Manager Support

The CLI automatically detects your package manager:

- npm
- pnpm
- yarn
- bun

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Repository](https://github.com/ejekanshjain/create-ej-app)
- [Issues](https://github.com/ejekanshjain/create-ej-app/issues)
- [Next.js Documentation](https://nextjs.org/docs)
- [Better Auth Documentation](https://better-auth.com)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Elysia Documentation](https://elysiajs.com)
- [Workflow DevKit Documentation](https://useworkflow.dev)
- [shadcn/ui Documentation](https://ui.shadcn.com)
