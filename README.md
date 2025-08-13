# Tuinbeheer Systeem 🌱

Een modern tuinbeheer systeem gebouwd met Next.js, Supabase en TailwindCSS.

## ✨ Features

- **Garden Management** - Beheer meerdere tuinen
- **Plant Bed Tracking** - Volg plantvakken en hun status
- **Task Management** - Organiseer tuintaken en planning
- **Plantvak Lettering System** - Automatische letter codes (A, B, C, D...)
- **Visual Garden Designer** - Visuele tuinontwerper
- **Responsive Design** - Werkt op alle apparaten

## 🚀 Tech Stack

- **Frontend:** Next.js 14, React, TypeScript
- **Styling:** TailwindCSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Deployment:** Vercel
- **CI/CD:** GitHub Actions met branch protection

## 🔒 CI/CD Pipeline

- **Branch Protection** - Geen directe pushes naar main
- **Automated Testing** - Lint, test en build bij elke push
- **Preview Deployments** - Test op staging voordat het live gaat
- **Production Safety** - Alleen via Pull Requests naar productie

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
- [System Architecture](./docs/system/README.md)

## 🤝 Contributing

Volg de CI/CD workflow:
1. Maak feature branch
2. Werk aan code
3. Push naar feature branch
4. Maak PR naar preview
5. Test op staging
6. PR naar main voor productie

**Directe pushes naar main zijn geblokkeerd voor veiligheid!**
