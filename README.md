# Tuinbeheer Systeem

## 🌱 Overzicht

Een moderne web-applicatie voor het beheren van tuinen, plantbedden en planten. Ontwikkeld met Next.js 14, Supabase en TailwindCSS.

**🔒 Security Status:** Banking-grade security refactoring complete!
**📅 Last Updated:** January 6, 2025 - 15:45 CET (Testing deployment limits)

## ✨ Features

- **Tuin Beheer**: Overzicht en beheer van verschillende tuinen
- **Plantbed Tracking**: Gedetailleerd beheer van plantbedden per tuin  
- **Plant Database**: Uitgebreide database van planten en hun eigenschappen
- **Taakbeheer**: Planning en tracking van tuinonderhoud taken
- **Gebruikersbeheer**: Rol-gebaseerd toegangssysteem (Admin/User)
- **Responsive Design**: Optimaal voor desktop en mobiele apparaten
- **Real-time Updates**: Live synchronisatie via Supabase
- **🔐 Banking-Grade Security**: Row Level Security, audit logging, input validation

## 🛡️ Security Features

- **Row Level Security (RLS)**: Database-niveau toegangscontrole
- **Audit Logging**: Volledige security event tracking  
- **Input Validation**: Bescherming tegen SQL injection en XSS
- **Authentication**: Strikte database-only user validation
- **Security Headers**: Comprehensive HTTP security headers
- **No Hardcoded Values**: All sensitive data from database

## 🚀 Quick Start

```bash
# Installeer dependencies
npm install

# Setup database
npm run db:setup

# Start development server
npm run dev
```

## 📚 Documentatie

- **[Database Setup](docs/database-setup.md)**: Database configuratie en security
- **[Deployment Guide](docs/deployment.md)**: Production deployment instructies
- **[Security Plan](docs/CURRENT_STATUS_AND_SECURITY_PLAN.md)**: 7-day security migration roadmap
- **[Architecture](docs/architecture.md)**: Systeem architectuur
- **[API Reference](docs/api-reference.md)**: API endpoints documentatie

## 🔐 Security Migration

Voor production gebruik, volg de **7-day security migration plan**:

1. **Day 1:** Assessment & Backup
2. **Day 2:** Foundation Security (Users table RLS)  
3. **Day 3-4:** Core Tables Security
4. **Day 5:** Tasks & Logging Security
5. **Day 6:** User Management Security
6. **Day 7:** Final Hardening & Validation

📖 **Zie:** `docs/CURRENT_STATUS_AND_SECURITY_PLAN.md`

## 🎯 Current Status

- ✅ **Security Refactoring**: Complete (banking-grade standards)
- ✅ **Frontend Cleanup**: All hardcoded emails removed
- ✅ **Authentication**: Strict database-only validation
- ✅ **Documentation**: Comprehensive guides updated
- 🚧 **Database Security**: Ready for step-by-step migration
- ⏳ **Deployment**: Waiting for Vercel limits reset

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Security**: Row Level Security, Audit Logging, Input Validation

## 📊 Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── (dashboard)/       # Dashboard routes
│   ├── admin/            # Admin-only pages
│   ├── auth/             # Authentication pages
│   └── api/              # API endpoints
├── components/           # Reusable UI components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions & configurations
│   ├── security/        # Security utilities & audit logging
│   └── supabase/        # Database client & queries
├── types/               # TypeScript type definitions
└── docs/               # Project documentation
```

## 🤝 Contributing

1. Fork het project
2. Maak een feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit je wijzigingen (`git commit -m 'Add some AmazingFeature'`)
4. Push naar de branch (`git push origin feature/AmazingFeature`)
5. Open een Pull Request

## 📄 License

Dit project is gelicenseerd onder de MIT License - zie het [LICENSE](LICENSE) bestand voor details.

---

**⚠️ BELANGRIJK:** Dit systeem implementeert banking-grade security. Volg altijd de security best practices en test grondig na elke wijziging.

## 🤖 Automated Build Monitoring

This project includes an advanced automated build failure analysis and fix system that maintains DNB banking compliance standards.

### Features

- **Automatic Error Detection**: Parses TypeScript, ESLint, and build errors from Vercel deployments
- **Smart Auto-Fixes**: Applies safe, DNB-compliant fixes for common issues:
  - TypeScript type errors (implicit any, missing imports)
  - Missing dependencies installation
  - Next.js configuration issues
  - Unused variable cleanup
- **Webhook Integration**: Automatically triggers on Vercel deployment failures
- **Safety-First**: Only applies fixes marked as DNB compliant and safe
- **GitHub Actions**: Continuous monitoring with automated commits

### Usage

#### Manual Build Analysis
```bash
# Run build analysis and auto-fix
npm run build:monitor

# Run analysis + build in sequence
npm run build:fix
```

#### Webhook Setup
1. Deploy the webhook endpoint: `/api/webhooks/vercel-build`
2. Configure in Vercel dashboard:
   - URL: `https://your-domain.com/api/webhooks/vercel-build`
   - Events: `deployment.error`, `deployment.succeeded`
   - Secret: Set `VERCEL_WEBHOOK_SECRET` environment variable

#### Environment Variables
```bash
VERCEL_WEBHOOK_SECRET=your-webhook-secret-here
```

### How It Works

1. **Detection**: Webhook receives `deployment.error` from Vercel
2. **Analysis**: Parses build logs to identify error patterns
3. **Fix Application**: Applies safe, pre-defined fixes
4. **Retry**: Automatically commits fixes and triggers new build
5. **Notification**: Reports success/failure status

### Safety & Compliance

- ✅ **DNB Compliant**: All fixes maintain Dutch banking security standards
- ✅ **Type Safe**: Preserves TypeScript strict mode compliance
- ✅ **Audit Trail**: All changes logged with descriptive commit messages
- ✅ **Rollback Ready**: Git-based approach allows easy reversion

### Supported Fix Patterns

| Error Type | Description | Safety Level |
|------------|-------------|--------------|
| Implicit `any` types | Adds explicit type annotations | Safe |
| Missing imports | Adds common React/Next.js imports | Moderate |
| Unused variables | Prefixes with underscore | Safe |
| Missing dependencies | Installs whitelisted packages | Moderate |
| Next.js config warnings | Removes deprecated options | Safe |
