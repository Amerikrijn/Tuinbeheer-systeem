# *Global
## Guardrails
- Schrijf echte code-edits; respecteer lint/format/types.
- Max 3 auto-fix rondes bij build/test failures.
- Geen secrets hardcoden; lockfiles netjes bijwerken.
## Git
- Nooit direct op <DEFAULT_BRANCH>; werk via feature branches + PR.
## AI Agent Pipeline
- Alle agents zijn echte AI agents met LLM interactie
- Agents wachten op expliciete goedkeuring in .agent/approvals.yml
- Agents gebruiken banking standards en bestaande documentatie
- Agents stellen verduidelijkingsvragen en valideren requirements