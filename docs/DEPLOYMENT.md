# Deployment Guide

Deze gids legt uit hoe je de Tuinbeheer applicatie kunt deployen naar Vercel zonder hardcoded Supabase waarden.

## 🚀 **Vercel Deployment**

### 1. **Environment Variables Instellen in Vercel**

Ga naar je Vercel project dashboard en stel de volgende environment variables in:

#### **Verplichte Variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

#### **Optionele Variables:**
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
DATABASE_URL=your_database_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
```

### 2. **Vercel CLI Setup (Optioneel)**

```bash
# Installeer Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Deploy
vercel --prod
```

### 3. **Automatische Deployment**

De applicatie wordt automatisch gedeployed wanneer je naar de `main` branch pusht.

## 🔧 **Lokale Development**

### **Optioneel: Lokale Environment File**

Voor lokale development kun je een `.env.local` bestand maken:

```bash
# Kopieer het voorbeeld bestand
cp .env.local.example .env.local

# Vul je lokale waarden in
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Let op:** Dit bestand wordt niet naar Git gepusht en is alleen voor lokale development.

## 📋 **Vercel Environment Variables**

### **Hoe instellen:**

1. Ga naar je Vercel project dashboard
2. Klik op "Settings" → "Environment Variables"
3. Voeg elke variable toe:
   - **Name:** `NEXT_PUBLIC_SUPABASE_URL`
   - **Value:** `https://your-project.supabase.co`
   - **Environment:** Production, Preview, Development
4. Herhaal voor alle benodigde variables

### **Environment Types:**

- **Production:** Live applicatie
- **Preview:** Pull request deployments
- **Development:** Lokale development

## 🔒 **Security Best Practices**

### **Wat NOOIT te doen:**
- ❌ Hardcode API keys in de code
- ❌ Commit `.env.local` bestanden naar Git
- ❌ Deel API keys in publieke repositories

### **Wat WEL te doen:**
- ✅ Gebruik Vercel environment variables
- ✅ Gebruik lokale `.env.local` voor development
- ✅ Rotate API keys regelmatig
- ✅ Monitor API usage

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **"Environment variables missing"**
   - Controleer of alle variables in Vercel zijn ingesteld
   - Zorg dat de namen exact kloppen

2. **"Supabase connection failed"**
   - Controleer of de URL correct is
   - Controleer of de anon key geldig is

3. **"Build failed"**
   - Controleer of alle environment variables beschikbaar zijn
   - Kijk naar de build logs in Vercel

### **Debug Commands:**

```bash
# Controleer lokale environment
npm run dev:stable

# Test build proces
npm run build

# Controleer types
npm run typecheck
```

## 📚 **Meer Informatie**

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## 🆘 **Support**

Voor vragen over deployment:
1. Controleer de Vercel logs
2. Controleer de Supabase logs
3. Maak een issue aan in de repository