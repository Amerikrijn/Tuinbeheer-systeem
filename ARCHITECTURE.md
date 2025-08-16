# Architecture

## Dataflow
Front-end components call server actions or API routes, which communicate with Supabase.

## Row Level Security
Supabase enforces RLS policies so users can only access permitted rows.

## Roles
- **admin** – full access to all resources.
- **user** – limited to their own data.

## Environment
Runtime environment variables come from Vercel project settings and are validated via `lib/env.ts`.

## Coverage
Run `npm run coverage` to generate a coverage report in `coverage/index.html`.
