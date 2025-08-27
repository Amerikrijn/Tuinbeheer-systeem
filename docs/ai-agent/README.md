# AI Agent Governance & Compliance

## 📋 Overzicht

Deze documentatie bevat de volledige governance en compliance structuur voor AI agents binnen het Tuinbeheer Systeem. Alle AI agents moeten deze standaarden volgen om te voldoen aan banking-grade security en compliance eisen.

## 🗂️ Documentatie Structuur

- **[RULES.md](./RULES.md)** - Kernregels en gedragsrichtlijnen voor AI agents
- **[GOVERNANCE.md](./GOVERNANCE.md)** - Bestuursstructuur en besluitvorming
- **[STANDARDS.md](./STANDARDS.md)** - Technische en security standaarden
- **[COMPLIANCE.md](./COMPLIANCE.md)** - Compliance vereisten en audit procedures
- **[WORKFLOW.md](./WORKFLOW.md)** - Werkprocessen en CI/CD procedures

## 🚨 Kritieke Waarschuwingen

- **SUPABASE KEYS MOGEN NOOIT IN `vercel.json` WORDEN HARDCODEERD!**
- Gebruik ALTIJD Vercel Secrets: `@supabase-anon-key` en `@supabase-service-role-key`
- Elke wijziging moet voldoen aan banking-grade security standaarden
- Alle database wijzigingen moeten audit logging hebben

## 🎯 Doel

Continue verbetering van de codebase door het hanteren van banking‑grade standaarden. Elke wijziging en commit voldoet aan deze standaarden en de regels in deze documentatie.

## 🔗 Gerelateerde Documenten

- [Hoofd README](../../README.md)
- [PR Instructies](../../PR_INSTRUCTIONS.md)
- [AI Agent Rules](../../.AI%20agent%20rules)

## 📞 Contact

Voor vragen over deze documentatie of AI agent governance, neem contact op met het development team.