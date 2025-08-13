# 🧰 Technical Debt: TypeScript-opschoning & Build-Robustheid

## 🎯 Doel
- TypeScript type-check groen krijgen (CI) en build robuuster maken door lazy Supabase initialisatie.

## 📦 Scope
- Herstel TS-fouten in `app/`, `components/`, `lib/` die nu type-check blokkeren.
- Minimaliseer `any`/`never[]` problemen en incorrecte property references.
- Zorg dat build niet faalt zonder Supabase env vars (lazy init in API code of guards).

## 🔍 Huidige problemen (samenvatting)
- Tests: eerder ontbrak `node-mocks-http` (nu geïnstalleerd).
- TS-fouten o.a. in:
  - `app/admin/users/page.tsx` (void-truthiness)
  - `app/gardens/[id]/plantvak-view/[bedId]/page.tsx` (onjuiste properties zoals `plants`, `plant_beds`)
  - `app/logbook/page.tsx` (impliciete `any[]`, onjuiste property-access)
  - `components/user/simple-tasks-view.tsx` (`never[]` state-afleidingen)
  - `components/tasks/weekly-task-list.tsx` (onjuiste properties)
  - `components/auth/force-password-change.tsx` (missing symbol `auth`)
  - `lib/services/database.service.ts` (verkeerde query filter key `garden_ids`)
  - `lib/services/task.service.ts` (type `User | null | undefined` → verwacht `User | null`)

## 🛠️ Aanpak
1. Type fixes per module:
   - Introduceer expliciete types voor state en afgeleide data.
   - Corrigeer foutieve property-namen volgens `lib/types` definities.
   - Vervang `never[]` door juiste generieke types (bijv. `Task[]`).
   - Pas functie-signatures aan waar `undefined` niet toegestaan is.
2. Teststabiliteit:
   - Verifieer dat `jest.setup.js` matchers laadt en mocks volledig zijn.
3. Build-robustheid:
   - Maak Supabase client lazy en vermijd initialisatie op import-niveau in API/routes.
   - Voeg guards toe voor ontbrekende env vars tijdens build (skip of fallback).
4. CI-verificatie:
   - `npm run lint && npm run type-check && npm run test:ci && npm run build` lokaal en in CI groen.

## ✅ Acceptatiecriteria
- TypeScript: `npm run type-check` slaagt lokaal en in CI.
- Tests: `npm run test:ci` slaagt, coverage ongewijzigd of beter.
- Build: `npm run build` slaagt zonder Supabase env vars dankzij lazy init/guards.
- Geen regressies in functionaliteit (smoke test: start app en basisflows).

## ⏱️ Inschatting
- 1–2 dagen werk afhankelijk van complexiteit van `app/*` type fixes.

## 🔗 Gerelateerd
- `cursor-config.md` (Definition of Done, standards)
- `.github/workflows/ci-cd.yml` (CI gates)
- `jest.config.js`, `jest.setup.js`, `tsconfig.json`