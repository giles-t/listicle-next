# Listicle

Listicle is a content creation platform that allows users to create beautiful, engaging listicles. Think of it as Medium, but specifically designed for list-based content.

## Features

- Create ordered, reverse ordered, and unordered lists
- Rich media embeds including images, tweets, and YouTube videos
- Interactive features like save, comment, and react to lists or individual items
- Publication system for organizations and authors
- SEO optimized for all public-facing pages

## Tech Stack

- **Frontend**: Next.js (App Router)
- **Backend**: Next.js (API routes)
- **Database**: Supabase with Drizzle ORM
- **Design System**: Subframe (Tailwind CSS based)
- **Hosting**: Vercel

## Getting Started

First, install dependencies:

```bash
npm install
```

Copy the environment variables template and update with your values:

```bash
cp env.template .env.local
```

Set up your Supabase project and update the environment variables in `.env.local` with your Supabase credentials.

Initialize the database with the required tables:

```bash
npm run db:init
```

Then run the project:

```bash
npm run dev
```

## Database Setup

The project includes scripts for database management:

- `npm run db:init` - Initialize database tables (run this first)
- `npm run db:studio` - Open Drizzle Studio for database management
- `npm run db:generate` - Generate migration files from schema changes
- `npm run db:push` - Push schema changes directly to database

**Note**: The current setup uses a custom initialization script (`npm run db:init`) due to TypeScript compilation compatibility. Once you have your `.env.local` configured with a valid `DATABASE_URL`, run this command to create all necessary tables.

## Libraries and Structure

- **Authentication**: Supabase Auth for user login and session management
- **Database Access**: Drizzle ORM with Supabase Postgres
- **State Management**: React hooks and context for state management
- **Email**: Resend for transactional emails
- **Error Handling**: Sentry for error tracking and logging
- **Validation**: Zod for schema validation

## Development Workflow

1. Environment setup: Configure your local environment with the necessary API keys
2. Database setup: Use Supabase dashboard to create your project, then run `npm run db:init`
3. Authentication: Set up auth providers in Supabase dashboard
4. Start coding: Use the Next.js App Router for creating pages and routes

## Learn More

Once running, you can Install Subframe locally by "syncing" Subframe with your Starter Kit. This is achieved by running the Subframe [Sync Command](https://app.subframe.com/library?component=installation)

For detailed project specifications, see the [SPEC.md](./SPEC.md) file.
