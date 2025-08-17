# 🚀 Project Setup Guide

## 📋 **Wat je nodig hebt:**

### **1. Vercel Secrets (voor productie)**
Deze worden automatisch gebruikt in productie via `vercel.json`:
- `@supabase-anon-key` - Anonieme Supabase key
- `@supabase-service-role-key` - Service role key voor admin functies

### **2. Lokale development (`.env.local`)**
Maak dit bestand aan in je project root:

```bash
# Supabase (gebruik je eigen project)
NEXT_PUBLIC_SUPABASE_URL=https://dwsgwqosmihsfaxuheji.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=jouw_echte_anon_key_hier
SUPABASE_SERVICE_ROLE_KEY=jouw_echte_service_role_key_hier

# Site configuratie
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_PROTECTED_ADMIN_EMAIL=admin@tuinbeheer.nl
```

## 🔧 **Hoe het werkt:**

### **Development (lokaal):**
- `.env.local` wordt gebruikt
- Je eigen Supabase keys
- Localhost URL's

### **Staging/Preview:**
- Vercel Secrets worden gebruikt
- Productie Supabase keys
- Preview URL's

### **Productie:**
- Vercel Secrets worden gebruikt
- Productie Supabase keys
- Productie URL's

## 📁 **Bestanden uitleg:**

- **`vercel.json`** - Productie configuratie (gebruikt Vercel Secrets)
- **`.env.example`** - Template voor lokale development
- **`.env.local`** - Jouw lokale secrets (niet in git)
- **`jest.setup.js`** - Test environment (gebruikt test keys)

## ⚠️ **Belangrijk:**
- **NOOIT** echte keys in git committen
- **ALTIJD** Vercel Secrets gebruiken in productie
- **ALTIJD** `.env.local` gebruiken voor lokale development

## 🚀 **Quick Start:**
1. Kopieer `.env.example` naar `.env.local`
2. Vul je eigen Supabase keys in
3. Start je development server: `npm run dev`
4. Klaar! 🎉