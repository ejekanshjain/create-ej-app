# AGENTS.md

Shared guidance for agentic coding tools working in this repository.

## What is this project

{{PROJECT_DESCRIPTION}}

It is a multi-tenant SaaS built on the `saas-starter` template from `create-ej-app`. People sign in, create or join organizations, invite teammates, and pay per organization through Stripe. Platform admins run the product from an admin panel.

## Coding preferences

- Keep things simple. Channel "yagni" energy unless told otherwise.
- Don't export a function or type, or define a type, that nothing uses.
- Type safety is useful; take advantage of it.
- Don't write code that introduces security vulnerabilities. Include authorization checks and input validation, and follow security best practices.
- Don't be scared to propose bold ideas or breaking changes if they can meaningfully benefit our work.
- Be careful with destructive actions I haven't explicitly requested.
- Write performant, optimized code.
- Don't hardcode limits, labels, or repeated values. Put them in `src/lib/constants.ts` or the matching registry, and read them from there in the UI, validation, tests and docs so one change updates every place.
- Tests are good! Endless smoke tests and "regression tests" for feature deletions are much less good. Tests should be focused, not slop.
- Comments are a great way to clarify functionality and how code is used. Don't comment every line. Concisely describe how functions and classes are used above their definitions, and explain only the tricky lines.
- If you need a paragraph-long comment to justify why a workaround is OK, the code is wrong. Fix the code unless I tell you otherwise.
- When designing or building something new, ask me about any design or flow decision you're unsure about, unless the answer is obvious. I'd rather clarify upfront than redo work built on an assumption. When you ask, give your recommendation and suggested answers so I can confirm, redirect, or decide.
- Report any bug, problem, or security issue you notice anywhere in the codebase, even if it's unrelated to the current work. Don't silently fix or ignore it.

## Writing guidelines

These cover every word that ships: UI copy, dialog and page titles, toasts, validation and error messages, emails, code comments, commit messages, PR descriptions, and Markdown in the repo.

**Fix the English you notice.** Typos, awkward phrasing, and copy that breaks these rules get fixed on sight, even outside the task you were given. This is the one exception to the reporting rule above. Bugs and security issues are still reported rather than silently changed; wording is not.

### Casing

Title Case for headings, page and section titles, dialog titles, nav labels, button labels, and table column headers: `Support Tickets`, `Save Changes`, not `Support tickets` or `Save changes`. Sentence case for body copy, descriptions, field labels, helper text, validation messages, and Markdown headings in repo docs.

### Voice

- Active voice, present tense. Append "by monkeys" as a test: if the sentence still parses, rewrite it.
- Address the reader as `you`, never "the user".
- Imperative for actions: "Select a plan", not "You will need to select a plan".
- Aim under 20 words per sentence. Paragraphs of 2 to 4 sentences, one idea each. Contractions are welcome.
- No rhetorical questions.
- Don't open a paragraph by recapping the previous one: "With that in place…".
- Don't have machines perform human actions: "the browser fetches the URL", not "hand the browser a URL".
- Commit subjects are lowercase imperative sentences.
- Don't include `Co-authored-by` or similar attribution trailers in commit messages or descriptions.
- Avoid repeating the same information across UI copy on a page. Give each heading, description, and helper text a distinct purpose.

### Words to cut

- `easy`, `simple`, `quick`: name the concrete thing instead, such as "one command" or "default settings".
- `very`, `just`, `really`, `simply`: filler.
- Vague quantifiers such as `many`, `often`, `typically`, `significantly`, `near-zero`, and `sub-second`: give the number or the specific claim.
- Metaphor verbs such as `lands`, `carries`, `hits`, and `flows through`: name the literal action.
- Spec-sheet phrasing: "provides", "is configurable", "is explicitly labeled".

### Punctuation and units

- No em dashes or curly quotes. Use a colon, a comma, or a period, or rewrite the sentence.
- Ellipsis character `…`, never three dots. Loading states end with it: `Saving…`.
- Units take a space and an uppercase symbol: `64 KB`, `200 ms`. Seconds stay bare: `30s`.

### Emphasis and code

- Bold marks a UI element or a critical fact, never emphasis.
- Inline code for paths, identifiers, file extensions, and short snippets.
- Code blocks carry a language tag, stay under 25 lines, and are explained in prose.
- Placeholders are descriptive `snake_case`: `your_access_token_here`, never `<TOKEN>` or `xxx`.

### Lists

- Introduce every list with a colon.
- Three or more list-shaped items in a paragraph become a list.
- No trailing period on a fragment; keep it on a full sentence.
- Bold term then colon for definitions: `- **Term**: description`.

### Error and toast messages

Name the subject, the action, and the consequence. No apologies. For customer-facing copy, say what happened and what to do next: "Your plan allows 25 members. Upgrade your plan to invite more." Never "Error" or "Something went wrong" on its own. Keep internals out of anything a customer reads: no table names, stack traces, or raw IDs.

## Commands

```bash
bun run dev          # Start Next.js dev server
bun run build        # Production build
bun run lint         # ESLint
bun run type-check   # TypeScript check (tsgo)
bun run format       # Prettier

bun run db:push      # Install triggers, then apply the schema
bun run db:studio    # Open Drizzle Studio
bun run db:seed      # Seed a superadmin, a user, and one organization
bun run db:reset     # Drop every table (refuses in production)

bun test             # Bun tests against in-memory PGlite
bun run test:real    # Same suite against real Postgres (TEST_DATABASE=postgres)
bun run email:dev    # React Email preview server (src/emails/)
bun run email:test you@example.com  # Send one test email
bun run storage:cleanup  # Delete abandoned R2 uploads; schedule it

bun run stripe:setup # Create Stripe products, prices, and the portal config
bun run stripe:dev   # Forward Stripe webhooks to localhost
```

Do not start the dev server or any other long-running process unless asked.

After editing code, run `bunx prettier --write` on the files you touched, or `bun run format` after a broad refactor.

## Environment variables

All app env is defined and validated in [src/env.ts](src/env.ts) via `@t3-oss/env-nextjs`. Add a variable there and to `.env.example` in the same change.

## Architecture

**Stack:** Next.js 16 App Router, React 19, TypeScript, Drizzle ORM (PostgreSQL), Better Auth (admin and organization plugins), Stripe, shadcn/ui, Tailwind CSS 4, Zod, next-safe-action, TanStack Query, Workflow, React Email.

**Path alias:** `~/` maps to `src/`.

### Route groups

| Group          | URL prefix                | Purpose                                   |
| -------------- | ------------------------- | ----------------------------------------- |
| `(marketing)`  | `/`                       | Landing, contact, and legal pages         |
| `(auth)`       | `/login`, `/profile`      | Sign-in, profile, and account support     |
| `(app)`        | `/app/...`                | Organization workspace, settings, billing |
| `(admin)`      | `/admin/...`              | Platform admin panel                      |
| `(invitation)` | `/accept-invitation/[id]` | Accept or decline an organization invite  |

### Server actions

All server actions use `next-safe-action` with layered clients defined in [src/lib/safe-action.ts](src/lib/safe-action.ts):

- `actionClient`: injects the auth session into `ctx`; no authentication required
- `authActionClient`: requires an authenticated user
- `adminActionClient`: requires the `admin` or `superadmin` system role
- `superAdminActionClient`: requires the `superadmin` system role

Actions live beside their routes in `actions/` directories; actions shared across route groups live in `src/app/actions/`. Zod schemas for actions live in co-located `.validation.ts` files so client forms can import them.

No page or layout under `src/app` imports `~/db` directly. Fetch through an action whose client enforces the right role, then call `notFound()` when it returns no data. An ancestor layout check is not enough: the `/admin` layout checks only `isAdmin`, so any page trusting it stays open to a plain admin.

### Errors (`AppError`)

[src/lib/errors.ts](src/lib/errors.ts). Throw `AppError` for expected failures (auth, not-found, conflicts, business rules). `message` is customer-facing (what happened + next step); no internals. Use `rethrowUniqueViolation` to turn a unique-index failure into a readable conflict.

`handleServerError` in [src/lib/safe-action.ts](src/lib/safe-action.ts): `AppError` → client gets `message`; anything else → generic mask + `recordError`. Do not catch-and-rethrow as plain `Error` or return `null` on failure; let errors bubble. Try/catch only for non-fatal side effects.

### Observability

One structured span per action, with its input, duration, and outcome as attributes. Setup is in [src/instrumentation.ts](src/instrumentation.ts) and [src/lib/otel.ts](src/lib/otel.ts); add attributes with `recordWideEvent` and `recordError`. Only error spans and spans slower than 5s are exported.

Wrap new actions with `withWideEvent` from [src/lib/safe-action.ts](src/lib/safe-action.ts): `.action(withWideEvent('myAction', async ({ parsedInput, ctx }) => { … }))`. Prefer that over ad-hoc logging in handlers. No secrets in attributes.

### Client toasts

[src/lib/toast-message.ts](src/lib/toast-message.ts) only (not raw Sonner):

- `await action`: `if (toastIfActionFailed(result)) return` then `toastSuccessMessage`
- hook `onError`, or a Better Auth client `error`: `toastActionError(err, 'The thing was not saved. Try again.')`
- client-only validation: `toastErrorMessage`

Query/mutation helpers: [src/lib/safe-action-client.ts](src/lib/safe-action-client.ts). Confirm destructive actions with `ConfirmDialog` ([src/components/confirm-dialog.tsx](src/components/confirm-dialog.tsx)), never `window.confirm`.

### Client / server boundary

`'use client'` modules must never pull server runtime, secrets, or the database into the browser bundle. Transitive imports count: a Zod schema that pulls in `drizzle-orm` still ships drizzle.

**Never import from client:**

- `~/db` and anything under it (including for types)
- `~/env`
- `drizzle-orm`
- Any module with `import 'server-only'`, such as `~/lib/plans`, `~/lib/billing`, `~/lib/storage`, and `~/lib/organization-access`

**OK from client:**

- Server actions from `'use server'` modules
- Pure modules free of SQL and secrets: `constants`, `validations`, `image-url`, `rbac`, `format-*`
- Action `.validation.ts` files, as long as they only import client-safe modules

**`server-only` placement:** add it to modules that open DB connections or hold secrets or must never ship to the client. Do not add it to `~/env`, `~/db/schema`, `~/db/enums`, or `~/db/common`: drizzle-kit and scripts load those without the `react-server` condition, and the real package throws there. Scripts run with `bun --conditions=react-server` so they can import server-only modules.

[tests/lib/client-server-boundary.test.ts](tests/lib/client-server-boundary.test.ts) fails if a `'use client'` file imports a forbidden path. Keep it green; extend its list when you add a new server lib.

### Input bounds and search

Shared Zod helpers live in [src/lib/validations.ts](src/lib/validations.ts); numeric ceilings live in [src/lib/constants.ts](src/lib/constants.ts). Cap every array that reaches SQL with `MAX_FILTER_VALUES` or a named constant. Build `ILIKE` patterns with `likeContains` from [src/lib/search.ts](src/lib/search.ts) so `%` and `_` in search text stay literal.

### Two-tier RBAC

**System level** (Better Auth admin plugin, defined in [src/lib/auth-permissions.ts](src/lib/auth-permissions.ts)):

- `user`: regular customer with no admin-panel access
- `admin`: can open `/admin` and work with support tickets, feedback, and contact leads; cannot manage users
- `superadmin`: full control, including user management and impersonation

**Organization level** (Better Auth organization plugin, labels and predicates in [src/lib/rbac.ts](src/lib/rbac.ts)):

- `owner`: full control, including deletion and ownership transfer
- `admin`: manages settings, billing, and members, but not ownership
- `member`: uses the workspace

Assert organization access in actions with helpers from [src/lib/organization-access.ts](src/lib/organization-access.ts): `assertMember`, `assertRole`, `assertCanManageOrganization`. Better Auth enforces the same roles on its own organization endpoints.

Organization logos never go through the Better Auth client: its hooks reject a `logo` field, and `updateOrganizationAction` saves it after checking the upload belongs to the organization.

### Plans and billing

Plans live in [src/lib/plans.ts](src/lib/plans.ts); `getOrganizationPlan` in [src/lib/plan-limits.ts](src/lib/plan-limits.ts) returns the plan an organization is entitled to now. Only `trialing`, `active`, and `past_due` subscriptions keep a paid plan. Better Auth reads `maxMembers` for invitation and membership limits.

Stripe is the source of truth. Checkout and the billing portal are Stripe-hosted; [src/app/api/webhooks/stripe/route.ts](src/app/api/webhooks/stripe/route.ts) records each event once and calls `syncSubscriptionFromStripe`, which re-reads the customer's latest subscription instead of trusting the event payload. Deleting an organization cancels its Stripe subscription first.

### Database

Schema is all in [src/db/schema.ts](src/db/schema.ts). All enums live in [src/db/enums.ts](src/db/enums.ts). Reusable column helpers (CUID IDs, timestamps, CHECK helpers) are in [src/db/common.ts](src/db/common.ts). IDs use CUID2 with a model-name prefix (e.g., `user_xxx`, `organization_xxx`).

Functions and triggers Drizzle cannot manage (the `TICKET-000001` counter) live in [src/scripts/setup-db.ts](src/scripts/setup-db.ts); `db:push` and the test database both run it.

**Changing the schema:**

- Every foreign key must be the leading column of an index and must declare an explicit `onDelete`. Without an index, deleting a parent scans the child table while holding row locks. `tests/db/fk-indexes.test.ts` enforces both.
- Before adding a CHECK, read what the code and the seed script write to that column. Use `nonNegativeCheck` for counts and sizes.
- Better Auth owns the `users`, `sessions`, `accounts`, `verifications`, `organizations`, `members`, and `invitations` columns. Change them with `bun run gen:auth` in mind.

### File storage (R2)

Storage logic is in [src/lib/storage.ts](src/lib/storage.ts). When all five `R2_*` env vars are set, files upload directly to R2 via presigned PUT URLs with the content type signed. Otherwise the app stores base64 data URLs (dev mode).

Image DB fields hold an R2 object key (`uploads/organizations/<id>/<file>`) or a `data:image/*` URL, validated by `imageUrlValidation`. Before saving one:

- Call `assertPersistableImageValue`, which rejects data URLs while R2 is on.
- Call `assertOwnedR2Key` on any key from user input, so no request can use another organization's file.
- Call `confirmUpload(newKey, organizationId, oldKey)` after the save, which marks the upload permanent and deletes the replaced file.

Render with `resolveImageUrl`, which returns null for anything that is not a stored image. Uploads that are never confirmed stay temporary; `bun run storage:cleanup` deletes them, so run it on a schedule. The `FileUpload` component ([src/components/file-upload.tsx](src/components/file-upload.tsx)) handles the browser side; pass `currentUrl` from `resolveImageUrl`, and match `sizes` to the rendered width.

### Support, feedback, and contact

- **Support tickets** ([src/app/actions/support-tickets.ts](src/app/actions/support-tickets.ts)): a ticket with an `organizationId` is shared by that organization's owners and admins; a ticket without one is private to its author. Platform admins see and answer both; a reply counts as the support team's only when sent from the admin panel (`asSupport: true`).
- **Feedback**: any member rates the product from the header of an organization page.
- **Contact leads**: the public `/contact-us` form. Both inboxes appear in the admin panel.
- **Leaving**: owners and admins leave from Settings; members leave from the organization switcher. The last owner cannot leave or be deleted until ownership moves.

### Client data and forms

Query results are fresh object identities on every refetch, and TanStack refetches on window focus by default. An effect that depends on one re-runs on every alt-tab and discards typed input.

- Seed a dialog form once per open: depend on `[open, record?.id, reset]`, never on the record object, an options array, or a `useMemo` derived from them.
- When the data arrives after the dialog opens, guard the prefill with a ref that is cleared on close.
- These effects need `// eslint-disable-next-line react-hooks/exhaustive-deps` on the dependency array, with a comment saying why.
- Writing a ref during render is a React Compiler error here. Do it inside the effect.

### Email

Templates are React Email components in `src/emails/`. Send via helpers in [src/lib/email-service.ts](src/lib/email-service.ts), which run as Workflow steps and use Nodemailer. Call them with `start(sendXEmail, [...])` so a slow SMTP server never blocks a request.

### Tests

**Test-driven development (TDD):** For new features, bugs, or behavior changes, write or update focused tests (including edge cases).

Bun tests run against **in-memory Postgres via PGlite** by default. The preload ([tests/setup/preload.ts](tests/setup/preload.ts)) boots one PGlite instance per worker, applies the Drizzle schema plus `setup-db` triggers, mocks `~/db`, and mocks auth (`getAuthSession` via AsyncLocalStorage). Bootstrap: [tests/setup/pglite-db.ts](tests/setup/pglite-db.ts).

Tests read env from `.env`, like the app. `bun run test:real` runs the same suite against a real server; it requires `DATABASE_URL` and a schema applied with `db:push`.

**PGlite constraint:** PGlite has a single connection, so calling the outer `db` client (or any helper that uses it) inside `db.transaction(...)` deadlocks. Run checks before opening the transaction, or pass `tx` into loaders.

**Verify a test can fail:** after writing one, break the code it covers, confirm it goes red, then restore. A test that cannot fail reads as coverage and hides bugs.

**Tests must not depend on the machine clock.** Pin the current time with `setSystemTime` from `bun:test` rather than computing offsets from the real clock.

**`db.execute` result shape differs by driver:** postgres-js returns a row array, PGlite returns `{ rows }`. Normalise before reading, as `toRows` in `tests/db/fk-indexes.test.ts` does.

**Fixtures** (full API in [tests/helpers/fixtures.ts](tests/helpers/fixtures.ts)):

```ts
const fx = new Fixtures()
afterEach(() => fx.cleanup())

const ws = await fx.workspace({ plan: 'pro' }) // organization + owner/admin/member
await asUser(ws.owner, () => someAction(...))
```

Use `asUser` / `asAnonymous` to set the action actor. Suites live under `tests/organizations/`, `tests/support/`, `tests/admin/`, `tests/db/`, and `tests/lib/`.

### Legal pages

The privacy policy and terms of service live in `src/app/(marketing)`. They are starting points: read both when you change how the product behaves. If a change makes either page inaccurate or incomplete, update it and `siteConfig.legal.lastUpdated` in the same change. Describe what an end user experiences, never internal architecture.

### Branding

Never hardcode the product name. Read `siteConfig.name` from [src/lib/siteConfig.ts](src/lib/siteConfig.ts). Replace `public/logo.svg` and `public/logo-dark.svg` with the real mark, and set the brand color in `src/app/globals.css` (`--primary`) and `BRAND` in `src/emails/components/email-layout.tsx`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
