# 🗂️ Repository-structuur & Workflow

## Structuur (top-level)
```
app/                 # Next.js (App Router)
components/          # UI componenten
hooks/               # React hooks (in gebruik in app/components)
lib/                 # Utils, services, config
__tests__/           # Unit/Integratie/Component tests
public/              # Statics
styles/              # CSS/Tailwind
scripts/             # Build/SQL/CI hulpscripts

database/            # Actieve SQL (alleen nodig voor huidige build)
database/archive/    # Niet-actieve/eenmalige SQL

docs/system/         # Actuele systeemdocumentatie (vereist voor build)
docs/planning/       # Backlog en plannen
_docs/archive/       # Historie/analyse/eenmalige docs_
```

## Documentatie-eisen (vereist)
- Zie `docs/system/standaarden.config.json` (pre-build validatie)
- Verplichte documenten in `docs/system/`:
  - Gebruikershandleiding, Functioneel, Architectuur, Technisch (incl. RLS), Standards, Testing-Strategie, Migraties-Overzicht, Opschoonrapport

## Branch- en releaseflow
- Feature branch → PR → Vercel Preview (automatisch)
- Checks: lint, type-check, tests, build, standards-validatie
- Groen? Merge naar `main`
- Productie blijft onaangetast tenzij expliciet gedeployed

## Commit & PR-regels (banking standards)
- Geen secrets in code/logs
- Server-only keys via env vars
- Minimaal 1 review, branch protection aan op `main`
- CI moet groen zijn (preview mag versoepelde drempels hebben, `main` ≥ 80% coverage)
- Gebruik issue/PR templates met compliance-checklist

## Build-gates
- `build-success.js` valideert `docs/system/standaarden.config.json` vóór Next build
- `.vercelignore` laat `docs/system/` en `docs/planning/` toe; archief is genegeerd voor build-relevantie

## Ownership
- Kritieke paden (`app/api/admin/**`, `lib/auth/**`, `database/**`) onder `CODEOWNERS`