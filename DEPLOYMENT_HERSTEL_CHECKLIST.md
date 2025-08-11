# ✅ DEPLOYMENT HERSTEL CHECKLIST

## 🎯 DOEL
Herstel de Vercel deployment zodat de gebruikersflows weer werken.

---

## 📋 STAP-VOOR-STAP ACTIEPLAN

### **FASE 1: Vercel Dashboard Check (5 min)**

1. **Login naar Vercel Dashboard**
   - Ga naar: https://vercel.com/dashboard
   - Login met GitHub account

2. **Check Project Status**
   - Zoek project: `tuinbeheer-systeem` of `Amerikrijn/Tuinbeheer-systeem`
   - Check deployment status (Failed/Success/Building)
   - Kijk naar laatste deployment logs

3. **Verify Environment Variables**
   - Project Settings → Environment Variables
   - Check of deze variabelen bestaan:
     ```
     ✅ NEXT_PUBLIC_SUPABASE_URL
     ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY  
     ✅ SUPABASE_SERVICE_ROLE_KEY
     ✅ NEXT_PUBLIC_SITE_URL
     ✅ NEXT_PUBLIC_PROTECTED_ADMIN_EMAIL
     ```

### **FASE 2: Supabase Dashboard Check (5 min)**

1. **Login naar Supabase Dashboard**
   - Ga naar: https://supabase.com/dashboard
   - Open project: `dwsgwqosmihsfaxuheji`

2. **Check API Keys**
   - Project Settings → API
   - Kopieer/verify:
     - `anon/public` key
     - `service_role` key (⚠️ GEHEIM!)

3. **Check Database Tables**
   - SQL Editor → Run:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('users', 'user_garden_access', 'gardens');
   ```

### **FASE 3: Deployment Herstellen (10 min)**

1. **Push Latest Changes**
   ```bash
   git checkout main
   git merge cursor/analyze-and-optimize-user-invitation-flows-7ec4
   git push origin main
   ```

2. **Trigger New Deployment**
   - Vercel auto-deploys from main branch
   - Check deployment progress in dashboard
   - Wait for build completion (2-5 min)

3. **Test Deployment**
   ```bash
   # Test homepage
   curl -s -w "Status: %{http_code}\n" https://tuinbeheer-systeem.vercel.app/
   
   # Test API route
   curl -X POST https://tuinbeheer-systeem.vercel.app/api/admin/invite-user \
     -H "Content-Type: application/json" \
     -d '{"test":"data"}'
   ```

### **FASE 4: Database Setup (10 min)**

1. **Run Users Table Setup**
   - Open Supabase SQL Editor
   - Copy/paste content van `database/00-users-table-setup.sql`
   - Execute query

2. **Run Force Password Change Migration**
   - Copy/paste content van `database/04-force-password-change-migration.sql`
   - Execute query

3. **Verify Setup**
   ```sql
   -- Check tables
   \dt public.users
   \dt public.user_garden_access
   
   -- Check functions
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_name = 'create_user_profile';
   ```

### **FASE 5: Email Templates Setup (5 min)**

1. **Customize Invite Template**
   - Supabase Dashboard → Authentication → Email Templates
   - Edit "Invite user" template:
   ```html
   <h2>Welkom bij het Tuinbeheer Systeem!</h2>
   <p>Hallo {{ .FullName }},</p>
   <p>Je bent uitgenodigd om deel te nemen aan ons tuinbeheer systeem.</p>
   <p>Klik op onderstaande link om je account te activeren:</p>
   <p><a href="{{ .ConfirmationURL }}" style="background: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Account Activeren</a></p>
   <p>Deze link is 72 uur geldig.</p>
   <p>Met vriendelijke groet,<br>Het Tuinbeheer Team</p>
   ```

---

## 🧪 VERIFICATIE TESTS

### **Test 1: Homepage Bereikbaar**
```bash
curl -s https://tuinbeheer-systeem.vercel.app/ | grep -q "Tuinbeheer"
echo "Homepage: $?"  # Should be 0 (success)
```

### **Test 2: API Routes Werken**
```bash
curl -X POST https://tuinbeheer-systeem.vercel.app/api/admin/invite-user \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","fullName":"Test","role":"user","adminEmail":"admin@test.com","siteUrl":"https://tuinbeheer-systeem.vercel.app"}'
# Should return JSON (not HTML error)
```

### **Test 3: Database Connectie**
- Login naar admin interface
- Check of gebruikerslijst laadt
- Test "Handmatig Toevoegen" functie

---

## 🚨 TROUBLESHOOTING

### **Als Vercel Deployment Faalt:**
1. Check build logs in Vercel dashboard
2. Look for TypeScript errors
3. Check if all dependencies are in package.json
4. Verify next.config.mjs syntax

### **Als Database Queries Falen:**
1. Check RLS policies in Supabase
2. Verify service_role key permissions
3. Check table existence with \dt command

### **Als Email Sending Faalt:**
1. Check Supabase SMTP configuration
2. Verify redirect URLs in auth settings
3. Test with simple email first

---

## 🎯 SUCCESS CRITERIA

### **Deployment Succesvol Als:**
- ✅ Homepage laadt zonder errors
- ✅ API routes returnen JSON (niet HTML)
- ✅ Admin interface is bereikbaar
- ✅ Database queries werken

### **User Flows Succesvol Als:**
- ✅ Uitnodiging versturen werkt zonder 404
- ✅ Email wordt ontvangen door test user
- ✅ Accept invitation flow werkt compleet
- ✅ Handmatige user creation werkt

---

## ⏱️ GESCHATTE TIJDEN

| Fase | Tijd | Prioriteit |
|------|------|------------|
| Vercel Dashboard Check | 5 min | 🔴 Kritiek |
| Supabase Dashboard Check | 5 min | 🔴 Kritiek |
| Deployment Herstellen | 10 min | 🔴 Kritiek |
| Database Setup | 10 min | 🔴 Kritiek |
| Email Templates | 5 min | 🟡 Belangrijk |
| **TOTAAL** | **35 min** | |

**Na deze 35 minuten:** Volledig werkende gebruikersflows! 🎉