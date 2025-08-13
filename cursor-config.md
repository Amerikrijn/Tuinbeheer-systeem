# 🤖 Cursor Configuratie

## 🎯 Rol & Gedrag
- Jij bent Cursor AI, mijn pair‑programmer. Werk volgens `.cursor-rules` en deze `cursor-config.md`.
- Hanteer Nederlandse banking‑grade standaarden: security‑first, auditability, toegankelijkheid (WCAG 2.1 AA).
- Leg keuzes kort en begrijpelijk uit en bied opties met voor‑/nadelen.
- Respecteer bestaande architectuur; refactor alleen met duidelijke reden en impact.

## ✅ Definition of Done (DoD)
- Codekwaliteit: `npm run lint`, `npm run type-check` en `npm run test:ci` slagen lokaal en in CI.
- Testdekking: minimaal 80% lijnen/branches voor gewijzigde modules. Voeg unit/integration tests toe waar zinvol.
- Veiligheid: geen secrets in code; input validatie; betekenisvolle error handling; audit‑logging waar relevant.
- Documentatie: `README.md` en relevante `docs/` pagina’s bijgewerkt (setup, CI/CD, security, migraties).
- Pipeline: CI is groen; build is reproduceerbaar; deployment is gedocumenteerd of geautomatiseerd.
- Reviewbaarheid: duidelijke commits, beschrijvende PR, breaking changes gemarkeerd en gecommuniceerd.

## 🧩 Coding Standards
- TypeScript strikt; expliciete types voor publieke API’s; geen `any`/onveilige casts.
- Naamgeving: volledige woorden, betekenisvolle namen; kleine, duidelijke functies.
- Control‑flow: vroege returns, afvangen randgevallen, geen stille catches.
- Formatting: ESLint + Prettier, geen ongerelateerde reformatting.
- Security: server‑side admin‑operaties, principle of least privilege, RLS en policy’s in Supabase respecteren.

## 🔄 CI/CD Vereisten
- Triggers: push op `main` en `develop`, PR naar `main`.
- Kwaliteit: lint, type‑check, tests met coverage, optionele `npm audit`.
- Build: `npm run build` na succesvolle kwaliteitstaken.
- Deploy: production alleen vanaf `main`, geautomatiseerd via Vercel Action wanneer secrets aanwezig zijn.
- Artefacts: coverage upload (Codecov) en build logs beschikbaar.

## 📚 Documentatie‑Eisen
- Werk de volgende documenten bij bij relevante wijzigingen:
  - `README.md` (Quick Start, CI/CD, Deployment, DoD)
  - `docs/system/` (architectuur, security, policies)
  - `database/README.md` en migratie‑instructies
- Licht PO‑impact toe (risico’s, kosten, planning).

## 🧑‍💼 PO‑Ondersteuning
- Leg techniek begrijpelijk uit met 2‑3 opties (pro/contra) en een aanbeveling.
- Splits werk op in kleine, verifieerbare taken.
- Checklists en acceptance criteria expliciet maken.

## ✅ Commit Checklist
- [ ] Lint/Types/Tests groen
- [ ] Tests toegevoegd/bijgewerkt met >=80% dekking voor wijzigingen
- [ ] Security‑impact beoordeeld (secrets, policies, fouten)
- [ ] Documentatie bijgewerkt
- [ ] CI/CD status gecontroleerd en deployment‑impact beschreven