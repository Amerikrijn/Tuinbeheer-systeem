# 🏗️ Architectuurhandleiding

## Doel
Overzicht van de technische architectuur: frontend (Next.js), backend (API routes), database (Supabase/Postgres) en security (RLS, service role).

## Componenten
- Frontend: Next.js 14 (App Router), React, TypeScript
- Backend: Next.js API routes (server‑side)
- Database: Supabase (PostgreSQL)
- Auth: Supabase Auth (PKCE, sessions)
- Styling: TailwindCSS
- CI/CD: GitHub Actions, Vercel

## Datastromen
- Frontend‑componenten roepen server actions of API routes aan die communiceren met Supabase
- Client → API routes: alle admin‑acties via server‑API (`app/api/admin/...`)
- API routes → Supabase Admin client: gebruikt `SUPABASE_SERVICE_ROLE_KEY` (alleen server‑side)
- Client → Supabase anon: reguliere reads/writes binnen RLS‑policies

## Security principes
- Never trust the client: admin‑acties nooit in de browser
- RLS: ingeschakeld op `gardens`, `plant_beds`, `plants` en `users`
- Policies: zie sectie “RLS Policies” in `Technisch.md`
- Secrets: alleen server‑side; `NEXT_PUBLIC_*` enkel voor anon‑key en URL
 
## Rollen
- **admin** – volledige toegang tot alle resources
- **user** – beperkt tot eigen data

## Belangrijke modules
- `lib/supabase.ts`: client‑init, optioneel admin client server‑side
- `lib/env.ts`: omgeving en env‑validatie (runtime variabelen vanuit Vercel project settings)
- `middleware.ts`: routebeperkingen en auth‑checks
- `app/api/*`: server‑routes voor data en admin beheer

## Database schema (kern)
- `gardens (uuid, ... visual canvas velden)`
- `plant_beds (text id, garden_id, positie/visual velden)`
- `plants (uuid, status, eigenschappen)`
- Triggers: `updated_at`, `visual_updated_at`
- Indexen: performance op status, created_at, foreign keys

## Omgeving
Runtime omgevingsvariabelen komen uit de Vercel project settings en worden gevalideerd via `lib/env.ts`.

## Deployment
- Vercel preview en production
- CI: lint, type‑check, tests, security audit, build

## Coverage
Voer `npm run coverage` uit om een rapport te genereren in `coverage/index.html`.

## Observaties en adviezen
- `app/gardens/.../*.backup` en `*.broken` bestanden: opruimen (zie Opschoonrapport)
- Scripts in `package.json` naar niet‑bestaande paden (`apps/mobile`, `packages/shared`): verwijderen of fixen
