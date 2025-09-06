# *Global
## Guardrails
- Schrijf echte code-edits; respecteer repo’s lint/format/type-checks.
- Max 3 auto-fix rondes bij build/test failures.
- Geen secrets hardcoden; lockfiles netjes bijwerken.
- Nieuwe features achter een feature-flag.
- Conventional commits: feat|fix|chore|refactor|docs|test(scope): message.
## Git
- Nooit direct op <DEFAULT_BRANCH>; per taak eigen branch + PR.
- Splits PR’s >400 regels of >10 files (impl-core / tests / docs / refactor).
## Docs reuse
- Bij SPEC/TECH/SEC/PERF: hergebruik eisen/standaarden uit README.md, docs/*, github/docs/*.
## AI Agent Pipeline
- Alle agents zijn echte AI agents met LLM interactie
- Agents wachten op expliciete goedkeuring in .agent/approvals.yml
- Agents gebruiken banking standards en bestaande documentatie
- Agents stellen verduidelijkingsvragen en valideren requirements