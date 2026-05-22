# Repository Guidelines

## Project Structure & Module Organization
RiseGO is a mobile-first Next.js application integrated with Supabase.
- **`app/`**: Contains the Next.js App Router pages and API routes.
- **`components/`**: Shared UI components like `AuthCard` and `AdminUserTable`.
- **`lib/`**: Supabase client configurations for both browser and server environments.
- **`scripts/`**: SQL scripts for initializing the database schema in Supabase.
- **`types/`**: TypeScript definitions, including generated Supabase types.

## Build, Test, and Development Commands
- **Install dependencies**: `npm install`
- **Start development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Lint the codebase**: `npm run lint`

## Coding Style & Naming Conventions
- Enforced by ESLint with `next/core-web-vitals` configuration.
- Uses TypeScript for type safety across the application.
- Tailwind CSS is used for styling with a mobile-first approach.

## Database Setup
Ensure all SQL scripts in the `scripts/` directory are executed in the Supabase SQL editor to initialize the required tables (`users`, `posts`, `follows`) and their respective RLS policies.

## Commit Guidelines
Commits should follow a concise, descriptive format. Recent patterns include feature-prefixed messages (e.g., `feat-add-create-post-view`) and fix-prefixed messages (e.g., `fix-db-error`).
