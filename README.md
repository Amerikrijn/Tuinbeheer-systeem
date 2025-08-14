# Tuinbeheer Systeem 🌱

Een modern tuinbeheer systeem gebouwd met Next.js, Supabase en TailwindCSS.

## ✨ Features

- **Garden Management** - Beheer meerdere tuinen
- **Plant Bed Tracking** - Volg plantvakken en hun status
- **Task Management** - Organiseer tuintaken en planning
- **Plantvak Lettering System** - Automatische letter codes (A, B, C, D...)
- **Visual Garden Designer** - Visuele tuinontwerper
- **Responsive Design** - Werkt op alle apparaten
- **🚀 CI/CD Pipeline** - Zero-tolerance kwaliteit met continuous quality loop

## 🚀 Tech Stack

- **Frontend:** Next.js 14, React, TypeScript
- **Styling:** TailwindCSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Deployment:** Vercel
- **CI/CD:** GitHub Actions met continuous quality loop

## 🔒 CI/CD Pipeline

- **🚫 Geen directe pushes naar main** - Branch protection actief
- **🔄 Continuous Quality Loop** - Pipeline draait tot alle gates groen
- **🧪 Zero-tolerance testing** - 100% pass verplicht
- **🔒 Security scanning** - 100% clean verplicht
- **🚀 Preview deployment** - Alleen na quality gates succes
- **🛡️ Productie safety** - Alleen via CI/CD pipeline succes

## 📖 Getting Started

1. Clone de repository
2. Installeer dependencies: `npm install`
3. Configureer environment variables
4. Start development server: `npm run dev`

## 🌿 Plantvak Lettering System

Het systeem genereert automatisch unieke letter codes voor plantvakken:
- Eerste plantvak → A
- Tweede plantvak → B
- Derde plantvak → C
- Na Z → A1, A2, A3...

**Geen handmatige invoer meer nodig - alles is automatisch!**

## 📚 Documentatie

- [CI/CD Workflow](./docs/system/CI-CD-Workflow.md)
- [Plantvak Lettering System](./docs/system/Plantvak-Lettering-System.md)
- [Quality Gates](./docs/system/quality-gates.md)
- [Standard Development Process](./docs/system/standard-development-process.md)
- [AI Learning & Improvement](./docs/system/ai-learning-improvement.md)
- [System Architecture](./docs/system/README.md)

## 🤝 Contributing

Volg de CI/CD workflow:
1. Maak feature branch
2. Werk aan code
3. Push naar feature branch
4. Pipeline draait automatisch
5. Quality gates worden afgedwongen
6. Preview deployment bij succes
7. PR naar main voor productie

**🚫 Directe pushes naar main zijn geblokkeerd voor veiligheid!**

## 🚨 Quality Gates

**Pipeline slaagt alleen als:**
- ✅ Tests: 100% pass (0 failures)
- ✅ Security: 100% clean (0 vulnerabilities)
- ✅ Code Quality: Zero violations
- ✅ Build: 100% success (0 errors)

**Geen compromissen - alleen perfectie!** 💪
