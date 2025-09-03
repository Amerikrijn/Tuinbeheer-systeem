# *Global
## Guardrails
- Schrijf echte code-edits; respecteer lint/format/types.
- Max 3 auto-fix rondes bij build/test failures.
- Geen secrets hardcoden; lockfiles netjes bijwerken.
## Git
- Nooit direct op main; werk via feature branches + PR.
- Gebruik `agent/cursor-pipeline` branch voor pipeline development.
- Commit messages: `feat:`, `fix:`, `test:`, `docs:`, `perf:`, `sec:`
## Pipeline
- Volg SPEC → TECH → IMPL → TEST → SEC → PERF → DOCS → READY workflow.
- Pauzeer na elk stadium tot expliciete goedkeuring in `.agent/approvals.yml`.
- Voer echte tests uit, geen mock tests.
- Implementeer echte features, geen documentatie-only changes.