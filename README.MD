# Danira

A TypeScript-based school management backend built with Express, Prisma, PostgreSQL, and modern tooling.

## Overview

This repository contains the backend for a school management system. It uses:

- `Express` for API routing
- `TypeScript` for type-safe application logic
- `Prisma` with PostgreSQL for database modeling and access
- `bcryptjs` for password hashing
- `jsonwebtoken` for authentication support
- `dotenv` / `dotenv-cli` for environment configuration

## Key Features

- Full Prisma schema modeling core school entities:
  - `Admin`, `School`, `Staff`, `Student`, `Guardian`, `Class`, `Lesson`, `Subject`, `Attendance`, `Fees`, `ReportCard`, `Assignment`, `Exam`, `Test`, `GradeYear`, `Term`, `Event`
- Postgres-backed database connection using `@prisma/adapter-pg`
- Seed script to populate sample schools and grade years
- Express API entrypoint in `src/index.ts`

## Project Structure

- `src/index.ts` - main Express server and root route
- `src/utils/prisma.ts` - Prisma client initialization with PostgreSQL adapter
- `src/routes/user.ts` - placeholder router file for user routes
- `src/generated/` - Prisma client and generated type definitions
- `prisma/schema.prisma` - database schema and model definitions
- `prisma/seed.ts` - database seeding logic
- `prisma/migrations/` - Prisma migration history

## Environment Variables

Create a `.env.local` or `.env` file at the repo root with the following values:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
SERVER_PORT=4000
```

> The `dev` script loads `.env.local` explicitly, so `.env.local` is recommended for local development.

## Installation

```bash
npm install
npm run prisma:generate
```

## Database Setup

Run migrations and seed the database:

```bash
npm run prisma:migrate
npm run prisma:seed
```

You can also launch Prisma Studio to inspect the database:

```bash
npm run prisma:studio
```

## Development

Start the development server:

```bash
npm run dev
```

This command runs TypeScript watch mode and restarts the server with `nodemon` after compilation.

## Available Scripts

- `npm run dev` - run Express app in development mode with live rebuilds
- `npm run build` - compile TypeScript to `dist/`
- `npm run prisma:generate` - generate Prisma client
- `npm run prisma:migrate` - apply Prisma migrations
- `npm run prisma:seed` - reset the database and run the seed script
- `npm run prisma:studio` - open Prisma Studio

## API

### Root Endpoint

- `GET /`
  - Returns a list of students with related data:
    - `school`
    - `attendances`
    - `fees`
    - `subject`

## Notes

- The current implementation only exposes a single root route in `src/index.ts`.
- `src/routes/user.ts` exists as a router placeholder but is not mounted in the server yet.
- The Prisma client is configured for PostgreSQL and expects a valid `DATABASE_URL`.
- If you add new routes, mount them in `src/index.ts` and wire any new controllers or routers.

## TypeScript

The project uses `tsconfig.json` configured for Node 24 compatibility with `ES2023`, strict type checking, source maps, and declaration generation.

## Contribution

To contribute, add new route modules, update the Prisma schema, create migrations, and keep the generated client in sync with `npm run prisma:generate`.

## License

This repository does not currently specify a project license.
