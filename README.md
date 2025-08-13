# Tuinbeheer Systeem

## 🌱 Overzicht

Een moderne web-applicatie voor het beheren van tuinen, plantbedden en planten. Ontwikkeld met Next.js 14, Supabase en TailwindCSS volgens **Nederlandse banking standards**.

**🔒 Security Status:** ✅ Banking-grade security geïmplementeerd  
**📋 Planning:** Gestructureerd backlog systeem actief  
**🏦 Compliance:** Volledige server-side admin operaties

## ✨ Features

- **🌿 Tuin Beheer**: Overzicht en beheer van verschillende tuinen
- **🪴 Plantbedden**: Gedetailleerd beheer van plantbedden per tuin
- **🌸 Planten Database**: Uitgebreide plantencatalogus met eigenschappen
- **📖 Logboek**: Activiteiten tracking met foto upload
- **✅ Taken Systeem**: Wekelijkse taken beheer met status tracking
- **👥 Gebruikersbeheer**: Role-based access control (Admin/User)
- **🔐 Veilige Authenticatie**: Supabase auth met force password change
- **📱 Responsive Design**: Mobiel-vriendelijke interface

## 🏗️ Technische Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Backend:** Supabase (PostgreSQL + Auth)
- **Styling:** TailwindCSS + HeadlessUI
- **Deployment:** Vercel (Preview + Production)
- **Security:** Banking-grade server-side API routes

## 📋 Documentatie

### Kern
- `docs/system/` — centrale systeemdocumentatie (gebruikershandleiding, functioneel, architectuur, technisch, standaarden, testen, migraties, opschoonrapport)
- `docs/planning/` — backlog en verbeteringen
- Archiefdocumenten: `docs/archive/` (oude eenmalige analyses & rapporten)

### Technisch
- `SERVERSIDE_UITLEG.md` — server‑side security uitleg
- `DATABASE_MIGRATIE_INSTRUCTIES.md` — migratie instructies
- `database/README.md` — database schema en migraties
- `docs/system/Supabase-Policies.md` — RLS/policies overzicht

## 🤖 AI Governance & CI/CD Borging

- **AI‑regels**: zie `.cursor-rules` (sectie “AI Governance en Configuratie”) voor gedrag, Definition of Done, teststrategie en banking‑standaarden.
- **CI/CD**: `.github/workflows/ci.yml` draait linting, tests en build bij elke push/PR; `main` = productie, preview branches = staging.
- **Kwaliteitsgate**: voer lokaal `npm run banking:full-check` uit (type‑check, lint‑fix, tests, compliance checks) vóór commit/PR.
- **Documentatie‑discipline**: update `.cursor-rules`, `README.md` en relevante `docs/` bij elke significante wijziging.

## 🚀 Quick Start

### 1. Development Setup
```bash
npm install
cp .env.example .env.local
# Configure environment variables
npm run dev
```

### 2. Database Setup
1. Volg instructies in `DATABASE_MIGRATIE_INSTRUCTIES.md`
2. Run database migraties uit `database/` directory

### 3. Admin Access
1. Configureer `NEXT_PUBLIC_PROTECTED_ADMIN_EMAIL` in environment
2. Zie `ADMIN_GEBRUIKERSBEHEER_GIDS.md` voor gebruikershandleiding

## 🏦 Banking Standards

Dit project volgt **Nederlandse banking standards**:
- ✅ **Server-side admin operaties** (geen client-side admin calls)
- ✅ **Audit logging** voor alle security events  
- ✅ **Input validation** en error handling
- ✅ **Force password change** na admin reset
- ✅ **Privilege separation** (service role vs anon key)
- ✅ **WCAG 2.1 AA** accessibility compliance

Zie `.cursor-rules` voor volledige banking compliance configuratie.

## 📋 Planning & Backlog

**START ELKE SESSIE MET:** `docs/backlog/README.md`

Het backlog systeem beheert alle:
- 🔴 High priority features
- 🟡 Medium priority improvements  
- 📊 System analysis findings
- 🏦 Banking compliance items

## 🔧 Environment Variables

Zie **Banking Compliance Configuratie** sectie in `.cursor-rules` voor complete environment setup.

## 📞 Support

Voor vragen over banking standards implementatie, raadpleeg:
1. `.cursor-rules` — Complete standards guide
2. `SERVERSIDE_UITLEG.md` — Security architecture  
3. `docs/system/` — Centrale documentatie

## 🤝 Contributing

1. Fork het project
2. Maak een feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit je wijzigingen (`git commit -m 'Add some AmazingFeature'`)
4. Push naar de branch (`git push origin feature/AmazingFeature`)
5. Open een Pull Request

## 📄 License

Dit project is gelicenseerd onder de MIT License - zie het [LICENSE](LICENSE) bestand voor details.
