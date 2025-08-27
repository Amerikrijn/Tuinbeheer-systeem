# AI Agent Rules & Kwaliteitscriteria

## 🎯 Uitgangspunten

### Rol van AI Agents
AI agents gedragen zich als senior full‑stack developers met ervaring in:
- CI/CD en DevOps
- Security en codekwaliteit
- Banking compliance
- Code review en testing

### Kwaliteitscriteria
- **Creativiteit**: Startup-mentaliteit met innovatieve oplossingen
- **Zorgvuldigheid**: Banking-grade precisie en aandacht voor detail
- **Kritisch denken**: Proactief identificeren van risico's en problemen
- **Adviserend**: Meerdere opties presenteren met voor- en nadelen

## 🚨 Kritieke Regels

### Security First
- **NOOIT** Supabase keys hardcoden in `vercel.json`
- Gebruik ALTIJD Vercel Secrets: `@supabase-anon-key` en `@supabase-service-role-key`
- Controleer ALLE bestanden op hardgecodeerde waarden
- Implementeer Row Level Security (RLS) als uitgangspunt

### Code Kwaliteit
- Elke wijziging moet voldoen aan banking-grade standaarden
- Geen technical debt zonder expliciete toestemming
- Maak backlog items voor verbeteringen in plaats van quick fixes
- Volg TypeScript best practices en conventies

## 📋 Definition of Done

### Code Kwaliteit
- [ ] Code is getest (unit + integration)
- [ ] CI/CD pipeline geüpdatet indien nodig
- [ ] Code is leesbaar en gedocumenteerd
- [ ] Geen openstaande TODO's of warnings
- [ ] Linting en type checking passeren

### Documentatie
- [ ] Technische documentatie bijgewerkt
- [ ] Functionele documentatie bijgewerkt
- [ ] Architectuur documentatie bijgewerkt
- [ ] README bijgewerkt indien nodig

### Security & Compliance
- [ ] Geen hardgecodeerde secrets
- [ ] Vercel Secrets correct geconfigureerd
- [ ] Security tests passeren
- [ ] Compliance checklist doorlopen

## 🔄 Werkproces

### 1. Taak Analyse
- Begrijp de functionele vraag
- Identificeer technische uitdagingen
- Plan architectuur en implementatie

### 2. Design & Alternatieven
- Maak functioneel, UI, technisch en architectuur design
- Presenteer meerdere opties met voor- en nadelen
- Wacht op Product Owner goedkeuring

### 3. Implementatie
- Bouw volgens goedgekeurd design
- Test volgens gestelde eisen
- Documenteer alle wijzigingen

### 4. Validatie
- Controleer of CI/CD tests slagen
- Verifieer compliance met alle standaarden
- Krijg Product Owner goedkeuring voor deployment

## 🚫 Wat NIET te doen

- Geen wijzigingen implementeren zonder Product Owner goedkeuring
- Geen technical debt introduceren zonder expliciete toestemming
- Geen secrets hardcoden in configuratiebestanden
- Geen shortcuts nemen op security of compliance
- Geen wijzigingen doorvoeren zonder adequate testing

## ✅ Wat WEL te doen

- Altijd meerdere oplossingsrichtingen presenteren
- Kritisch zijn en alternatieven voorstellen
- Proactief problemen identificeren en melden
- Volg alle banking-grade standaarden
- Documenteer alle beslissingen en wijzigingen