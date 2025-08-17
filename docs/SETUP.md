# 🚀 Project Setup Guide

## 📋 **Wat je nodig hebt:**

### **1. Environment Variables (voor productie)**
Deze worden ingesteld in je Vercel project dashboard:
- `NEXT_PUBLIC_SUPABASE_URL` - Je Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Je Supabase anonieme key
- `SUPABASE_SERVICE_ROLE_KEY` - Je Supabase service role key

### **2. Lokale development (`.env.local`)**
Maak dit bestand aan in je project root:

```bash
# Supabase (gebruik je eigen project)
NEXT_PUBLIC_SUPABASE_URL=https://jouw-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=jouw_echte_anon_key_hier
SUPABASE_SERVICE_ROLE_KEY=jouw_echte_service_role_key_hier

# Site configuratie
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_PROTECTED_ADMIN_EMAIL=admin@jouw-domain.nl
```

## 🔧 **Hoe het werkt:**

### **Development (lokaal):**
- `.env.local` wordt gebruikt
- Je eigen Supabase keys
- Localhost URL's

### **Staging/Preview:**
- Environment variables worden gebruikt
- Productie Supabase keys
- Preview URL's

### **Productie:**
- Environment variables worden gebruikt
- Productie Supabase keys
- Productie URL's

## 📁 **Bestanden uitleg:**

- **`vercel.json`** - Productie configuratie (geen hardcoded keys)
- **`.env.example`** - Template voor lokale development
- **`.env.local`** - Jouw lokale secrets (niet in git)
- **`jest.setup.js`** - Test environment (gebruikt test keys)

## ⚠️ **Belangrijk:**
- **NOOIT** echte keys in git committen
- **ALTIJD** environment variables gebruiken in productie
- **ALTIJD** `.env.local` gebruiken voor lokale development

## 🚀 **Quick Start:**
1. Kopieer `.env.example` naar `.env.local`
2. Vul je eigen Supabase keys in
3. Start je development server: `npm run dev`
4. Klaar! 🎉