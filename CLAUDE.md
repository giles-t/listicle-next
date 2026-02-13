# CLAUDE.md

## Project Overview

Listicle is a content platform for creating and sharing list-based articles ("Medium for listicles"). See `SPEC.md` for detailed product requirements and feature specifications.

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript 5.8
- **Auth & DB:** Supabase (Auth + PostgreSQL), Drizzle ORM
- **Styling:** Tailwind CSS 4 + Subframe UI component library
- **Editor:** TipTap rich text editor with collaboration, AI, and media extensions
- **Services:** OpenAI (AI features), Resend (email), Sentry (errors), Upstash Redis (caching/rate limiting)
- **Hosting:** Vercel (standalone output)
- **Package Manager:** npm

## Commands

```bash
npm run dev            # Start dev server
npm run build          # Production build
npm run lint           # ESLint (next/core-web-vitals)
npm run db:generate    # Generate Drizzle migrations from schema changes
npm run db:migrate     # Run pending migrations
npm run db:push        # Push schema directly (no migration file)
npm run db:studio      # Open Drizzle Studio GUI
```

## Project Structure

```
src/
├── app/           # Next.js App Router - pages, layouts, API routes
│   └── api/       # REST API endpoints (lists, profile, publications, ai-text, etc.)
├── server/        # Server-side logic
│   ├── db/        # Drizzle schema, connection, queries (one file per domain)
│   │   ├── schema.ts    # All table/enum definitions
│   │   └── queries/     # lists.ts, profiles.ts, comments.ts, reactions.ts, etc.
│   ├── supabase.ts      # Supabase server client + middleware helpers
│   ├── middleware.ts    # withMiddleware() - rate limiting, auth, CORS
│   ├── api-error.ts     # ApiError class for consistent error responses
│   └── ...              # email, redis, rate-limit, moderation, ai, logger
├── client/        # Client-side code ("use client" boundary)
│   ├── components/      # React components (18 subdirectories)
│   ├── hooks/           # useAuth, useApi, and other custom hooks
│   ├── auth/            # AuthManager singleton for client auth state
│   └── tiptap/          # TipTap editor extensions and SCSS styles
├── shared/        # Code shared between client and server
│   ├── validation/      # Zod schemas (list.ts, user.ts, publication.ts, etc.)
│   └── utils/           # slug, pagination, date, media, metadata helpers
└── ui/            # Subframe design system (50+ components)
    ├── components/      # Button, TextField, Dialog, Accordion, etc.
    └── layouts/         # DefaultPageLayout and other page layouts
```

## Path Aliases (tsconfig)

| Alias | Maps To |
|-------|---------|
| `@/*` | `./` (project root) |
| `@/server/*` | `./src/server/*` |
| `@/client/*` | `./src/client/*` |
| `@/shared/*` | `./src/shared/*` |
| `@/ui/*` | `./src/ui/*` |
| `@/subframe/*` | `./src/subframe/*` |

## Architecture & Conventions

- **Server components by default.** Only add `"use client"` when interactivity is needed.
- **Use Subframe UI components** (`src/ui/components/`) before building custom ones.
- **API routes** follow REST conventions in `src/app/api/` using Next.js route handlers (`GET`, `POST`, `PATCH`, `DELETE` exports).
- **Validate all input** with Zod schemas from `src/shared/validation/`.
- **Database queries** live in `src/server/db/queries/` - one file per domain (lists, profiles, comments, etc.).
- **Auth:** Use `createClient()` from `@/server/supabase` and call `supabase.auth.getUser()` to authenticate requests.
- **Rate limiting:** Wrap API handlers with `withMiddleware()` from `@/server/middleware`.
- **Error responses:** Use `ApiError.badRequest()`, `ApiError.unauthorized()`, etc. from `@/server/api-error`.
- **File naming:** PascalCase for components (`FilteredListFeed.tsx`), kebab-case for utilities (`rate-limit.ts`).
- **Styling:** Tailwind utility classes everywhere; SCSS only for TipTap editor styles in `src/client/tiptap/styles/`.
- **Constants:** UPPERCASE_SNAKE_CASE (e.g., `RATE_LIMITS`).

## Database

- **ORM:** Drizzle with PostgreSQL (Supabase)
- **Schema:** `src/server/db/schema.ts` - all tables and enums
- **Migrations:** `drizzle/` directory, managed with Drizzle Kit
- **Connection:** Singleton pool (max 10 connections, 20s idle timeout)
- **Key tables:** profiles, lists, list_items, comments, reactions, follows, notifications, categories, publications, bookmarks, tags
- **Key enums:** list_type (ordered/unordered/reversed), media_type (image/tweet/youtube/none), notification_type, publication_role

## Key Patterns

- **Route protection:** Middleware protects `/dashboard`, `/create`, `/settings`, `/me`, `/lists/drafts`, `/onboarding`
- **URL rewrites:** `/@username` → `/profile/username`, `/pub/:slug` → `/publication/:slug`
- **Onboarding guard:** Users without a username are redirected to `/onboarding` (checked via user metadata, no DB call)
- **View counting:** Decoupled from requests, synced via Vercel cron job every 5 minutes (`/api/views/sync`)
- **Client state:** AuthManager singleton + useAuth hook; no external state library (no Redux/Zustand)
- **Data fetching:** SWR for client-side caching, server components for SSR data

## Environment Variables

See `.env.example` for all required variables. Key ones:

- `NEXT_PUBLIC_*` vars are exposed to the client (Supabase URL, anon key, app URL)
- Server-only: `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `RESEND_API_KEY`, `OPENAI_API_KEY`, `SENTRY_DSN`

## Subframe MCP (Design Integration)

A Subframe MCP server is available for looking up designs. When building or modifying UI, you can use it to:

- **View designs:** Paste a Subframe MCP link (from the browser address bar or "Code > Inspect" in Subframe) to see the design spec and generate matching code.
- **Design pages:** Use the MCP tools to create design variations during planning or implementation.

The MCP generates code using the project's existing Subframe components and theme. See https://docs.subframe.com/learn/guides/working-with-ai-agents for full details.

## Testing

No test framework is currently configured. No test files exist in the project.
