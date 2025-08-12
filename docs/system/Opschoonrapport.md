# 🧹 Opschoonrapport

## Bestanden om te verwijderen of te archiveren
- `app/gardens/[id]/plantvak-view/[bedId]/page.tsx.backup` — verwijderen
- `app/gardens/[id]/plantvak-view/[bedId]/page.tsx.broken` — verwijderen
- `database/debug-*.sql` — archiveren naar `database/archive/`
- `fix-production-rls-policies.sql` — na toepassing archiveren

## Package scripts controleren
- `package.json` scripts naar niet‑bestaande paden:
  - `apps/mobile/*` — map ontbreekt → script verwijderen of project toevoegen
  - `packages/shared/*` — map ontbreekt → idem

## Documentatie
- `README.md` bevat merge‑conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) — herstellen
- Centraliseer nieuwe docs onder `docs/system/` en verwijs vanuit `README.md`

## Database
- Niet‑meer‑benodigde hulpscripts verplaatsen naar `database/archive/`

## Overig
- Bevestig dat CI pipelines geen verwijzingen hebben naar oude paden