# Prompt Templates for AI-Assisted Development

This document contains reusable prompt templates for scaffolding and developing features in Next.js applications using this tech stack:

**Tech Stack:**
- Next.js 15 (App Router) with React 19
- TypeScript 5.8+
- Drizzle ORM with PostgreSQL
- Supabase Authentication
- Tailwind CSS v4
- Vitest for testing

---

## 1. App Blueprint / Initial Scaffold

**Use this right after you create or clone a base template.**

```
You are acting as a senior full-stack engineer using Cursor.

Goal:
Turn this repo into a clean, production-ready web app scaffold.

Context:
- Stack: Next.js 15 App Router + TypeScript + Tailwind CSS v4 + Drizzle ORM + Supabase Auth
- Target use case: [describe your stack, e.g. multi-tenant SaaS for X]
- See existing code and config as the baseline.

Tasks:
1) Analyze the repo and propose:
   - Folder structure (app/, components/, lib/, schema/)
   - Core domain entities
   - High-level app routing (public vs authenticated areas)

2) Create or update:
   - `docs/architecture.md` (system overview, folder layout, data flow)
   - `docs/domain-model.md` (entities, fields, relationships, invariants)

3) Set up:
   - Basic auth flow using Supabase (already scaffolded in lib/supabase/)
   - Example CRUD module for one entity (full stack: DB schema, API routes, UI)
   - Minimal tests for the CRUD module using Vitest

Constraints:
- Follow the rules defined in `.cursorrules`.
- Explain your plan briefly before making changes.
- Keep the scaffold minimal but real – no fake or dead code.
- Use Drizzle ORM for database schema (schema/*.ts files)
- Use Supabase for authentication (lib/supabase/client.ts, server.ts, middleware.ts)
- Follow Next.js 15 App Router patterns (app/ directory structure)
```

---

## 2. New Feature Scaffold

**Use this whenever you add something substantial (e.g. "add billing settings page").**

```
You're working inside this existing web app. Use `.cursorrules` and the docs as the source of truth.

Feature:
[describe feature in 3–5 sentences, including user story + acceptance criteria]

Scaffolding requirements:
For this feature, ALWAYS:

1) Define or update entities and validation:
   - Drizzle schema tables in `schema/*.ts` (if data changes)
   - TypeScript types (inferred from Drizzle schema)
   - Validation schemas if needed (Zod recommended)

2) Wire backend:
   - Route handlers in `app/api/.../route.ts`
   - Server actions if using form submissions
   - Database queries using Drizzle ORM via `lib/db.ts`
   - Any background jobs / cron if needed

3) Scaffold UI:
   - Next.js route(s) in `app/.../page.tsx`
   - Components in `components/` using Tailwind CSS v4
   - Reusable UI components if needed

4) Add tests:
   - Happy path tests
   - At least one failure/edge case
   - Use Vitest with @testing-library/react

Process:
- First, list the files you plan to create/edit.
- Then implement in small steps, updating the list as you go.
- After implementation, summarize all changes and any TODOs.

Output style:
- Show code diffs or full files as needed.
- Call out any manual steps (e.g. `pnpm db:push` or `pnpm db:generate` for migrations).
```

---

## 3. CRUD Module Template

**When you need a whole vertical slice for a resource (e.g. "Workspaces", "Projects", "Invoices"):**

```
Create a full CRUD slice for the entity: **[EntityName]**.

Requirements:

- DB: Drizzle schema table in `schema/[entity-name].ts` with fields [list core fields] and timestamps.
  - Export types: `export type [EntityName] = typeof [tableName].$inferSelect;`
  - Export insert type: `export type New[EntityName] = typeof [tableName].$inferInsert;`
  - Use `appSchema` from existing schema files for consistency

- Validation: TypeScript types (inferred from Drizzle) or Zod schemas for create/update payloads if needed.

- API/Server:
  - List [EntityName] for the current user/workspace: `app/api/[entity-name]/route.ts` (GET)
  - Get single entity: `app/api/[entity-name]/[id]/route.ts` (GET)
  - Create: `app/api/[entity-name]/route.ts` (POST)
  - Update: `app/api/[entity-name]/[id]/route.ts` (PATCH/PUT)
  - Delete: `app/api/[entity-name]/[id]/route.ts` (DELETE)
  - Use `getDatabase()` from `lib/db.ts` for database access
  - Authenticate using Supabase: `createClient()` from `lib/supabase/server.ts`

- UI:
  - List page: `app/[entity-name]/page.tsx` with table/cards, basic filters, and CTA button
  - Create/edit form: `app/[entity-name]/new/page.tsx` and `app/[entity-name]/[id]/edit/page.tsx`
  - Components: `components/[entity-name]-form.tsx` if reusable
  - Use Tailwind CSS v4 for styling

- Tests:
  - API route tests for each CRUD operation (Vitest)
  - Basic component test for the form (render + validation) using @testing-library/react

Conventions:
- Follow existing folder and naming conventions in this repo.
- Reuse existing utilities and patterns where possible (hooks, components, layouts).
- Use Supabase auth middleware for protected routes.
- Export schema from `schema/index.ts` for easy imports.

Steps:
1) Propose the shape of the Drizzle schema table + TypeScript types.
2) Show me the planned file tree for this module.
3) Implement, one section at a time (DB schema -> API routes -> UI -> tests).
4) Run `pnpm db:generate` to generate migrations, then `pnpm db:push` to apply.
5) Summarize everything at the end.
```

---

## 4. TDD / Test-Driven Development Loop

**Cursor has a "YOLO mode" + test-based loops that let it write tests and implementation and iterate until tests pass. Guides from Builder.io and others recommend exactly this pattern for complex changes.**

```
You are in test-driven mode.

For the [feature or module] described below:
1) Write tests FIRST.
2) Then implement the code.
3) Run the tests and keep iterating until they pass.

Feature:
[describe]

Scope:
- Only modify files directly related to this feature.
- Keep changes small and cohesive.

Important:
- Prefer end-to-end or integration tests that reflect real behavior.
- Use Vitest for all tests.
- For API routes, test the actual HTTP endpoints.
- For components, use @testing-library/react.
- Explain what each test verifies in a short comment.

When ready, start by:
- Printing the list of tests you'll add.
- Then creating the test files and content.
- Running tests with `pnpm test` or `pnpm test:ui`.
```

---

## Quick Reference: Tech Stack Patterns

### Database (Drizzle ORM)
- **Schema files**: `schema/*.ts` using `pgSchema` and `pgTable`
- **Database client**: `lib/db.ts` exports `getDatabase()` function
- **Migrations**: 
  - Generate: `pnpm db:generate`
  - Push: `pnpm db:push`
  - Studio: `pnpm db:studio`

### Authentication (Supabase)
- **Client-side**: `lib/supabase/client.ts` - `createClient()`
- **Server-side**: `lib/supabase/server.ts` - `createClient()` (async)
- **Middleware**: `lib/supabase/middleware.ts` - `updateSession()`
- **Auth routes**: `app/api/auth/logout/route.ts`

### API Routes
- **Location**: `app/api/*/route.ts`
- **Methods**: Export `GET`, `POST`, `PATCH`, `PUT`, `DELETE` functions
- **Auth**: Use `createClient()` from `lib/supabase/server.ts`

### UI Components
- **Pages**: `app/*/page.tsx` (Server Components by default)
- **Components**: `components/*.tsx`
- **Styling**: Tailwind CSS v4 classes
- **Utils**: `lib/utils.ts` for `cn()` (className merging)

### Testing
- **Framework**: Vitest
- **Config**: `vitest.config.ts`
- **Setup**: `vitest.setup.ts`
- **Run**: `pnpm test` or `pnpm test:ui`
