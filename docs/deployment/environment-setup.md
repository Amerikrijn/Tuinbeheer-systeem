# 🚀 VERCEL SETUP INSTRUCTIES - Nieuwe Supabase Database

## 📋 Environment Variables voor Vercel

### Stap 1: Vercel Dashboard
1. Ga naar [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecteer je project
3. Klik op **Settings**
4. Ga naar **Environment Variables**

### Stap 2: Verwijder Oude Variables (Belangrijk!)
**DELETE** deze oude variables als ze bestaan:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
- `CUSTOM_SUPABASE_URL`
- `CUSTOM_SUPABASE_ANON_KEY`

### Stap 3: Voeg Nieuwe Variables Toe
Klik **Add New** en voeg deze 4 variables toe:

#### Variable 1:
- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://nrdgfiotsgnzvzsmylne.supabase.co`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

#### Variable 2:
- **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZGdmaW90c2duenZ6c215bG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzA4MTMsImV4cCI6MjA2ODAwNjgxM30.5ARPqu6X_YzHmKdHZKYf69jK2KZUrwLdPHwd3toD2BY`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

#### Variable 3:
- **Name:** `CUSTOM_SUPABASE_URL`
- **Value:** `https://nrdgfiotsgnzvzsmylne.supabase.co`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

#### Variable 4:
- **Name:** `CUSTOM_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZGdmaW90c2duenZ6c215bG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzA4MTMsImV4cCI6MjA2ODAwNjgxM30.5ARPqu6X_YzHmKdHZKYf69jK2KZUrwLdPHwd3toD2BY`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

### Stap 4: Vercel Integratie Verwijderen
1. Ga naar **Settings → Integrations**
2. Zoek naar **Supabase** integratie
3. Klik **Remove** of **Disconnect** als deze bestaat
4. Bevestig de verwijdering

---

## 🎯 Deployment
Na het instellen van environment variables:
1. Ga naar **Deployments** tab
2. Klik **Redeploy** op de laatste deployment
3. Of push een nieuwe commit naar je Git repository

---

## ✅ Verificatie
Na deployment, test deze URL's:
- `https://[jouw-vercel-domain]/test-db` - Database connection test
- `https://[jouw-vercel-domain]/gardens` - Main application

---

*Setup compleet! 🎉*