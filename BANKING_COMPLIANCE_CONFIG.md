# 🏦 BANKING COMPLIANCE CONFIGURATIE

## **🎯 OVERZICHT**
Configuratie gids voor banking-grade security compliance in het Tuinbeheer Systeem.

---

## **🔒 VERPLICHTE ENVIRONMENT VARIABLES**

### **Production Environment (Vercel)**
```bash
# Supabase - Public (safe in browser)
NEXT_PUBLIC_SUPABASE_URL=https://dwsgwqosmihsfaxuheji.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Supabase - Private (SERVER-SIDE ONLY!)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://tuinbeheer-systeem.vercel.app
NEXT_PUBLIC_PROTECTED_ADMIN_EMAIL=admin@tuinbeheer.nl
```

### **Preview Environment (Vercel)**
```bash
# Supabase - Same as production
NEXT_PUBLIC_SUPABASE_URL=https://dwsgwqosmihsfaxuheji.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Site Configuration - Preview URLs
NEXT_PUBLIC_SITE_URL=https://tuinbeheer-systeem-git-preview-amerikrijn.vercel.app
NEXT_PUBLIC_PROTECTED_ADMIN_EMAIL=admin@tuinbeheer.nl
```

---

## **🔐 BANKING STANDARDS COMPLIANCE**

### **✅ Server-Side API Routes**
Alle admin functies via beveiligde server routes:
- `/api/admin/invite-user` - User invitations
- `/api/admin/delete-user` - User deletion
- `/api/admin/reset-password` - Password resets
- `/api/admin/update-user-role` - Role changes  
- `/api/admin/update-user-status` - Status changes

### **✅ Privilege Separation**
- **NEXT_PUBLIC_*** = Client-side safe (anon key, URLs)
- **SUPABASE_SERVICE_ROLE_KEY** = Server-side only (admin privileges)

### **✅ Configureerbare Waarden**
- **Admin Email:** `NEXT_PUBLIC_PROTECTED_ADMIN_EMAIL`
- **Site URLs:** `NEXT_PUBLIC_SITE_URL`  
- **Geen hardcoded credentials** in code

### **✅ Audit Logging**
Alle admin acties worden gelogd:
```typescript
console.log(`🔐 ADMIN ACTION: ${action} by ${adminEmail} - ${details}`)
```

---

## **⚠️ BEVEILIGINGSWAARSCHUWINGEN**

### **🚨 NOOIT DOEN:**
```typescript
// ❌ Client-side admin calls
await supabase.auth.admin.deleteUser(id)

// ❌ Service role key in browser
const client = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY)

// ❌ Hardcoded credentials
if (user.email === 'admin@tuinbeheer.nl')
```

### **✅ WEL DOEN:**
```typescript
// ✅ Server-side API calls
await fetch('/api/admin/delete-user', { method: 'DELETE' })

// ✅ Environment variables
if (user.email === process.env.NEXT_PUBLIC_PROTECTED_ADMIN_EMAIL)

// ✅ Server-side admin client
const supabaseAdmin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY)
```

---

## **🧪 TESTING CHECKLIST**

### **Admin Functions Test:**
- [ ] User invitation werkt
- [ ] Password reset werkt (met force change)
- [ ] User deletion werkt  
- [ ] Role updates werken
- [ ] Status updates werken
- [ ] Protected admin cannot be deleted
- [ ] Audit logs verschijnen in console

### **Security Test:**
- [ ] Service role key niet zichtbaar in browser
- [ ] Admin calls falen zonder server-side API
- [ ] Environment variables correct ingesteld
- [ ] Geen hardcoded credentials in client code

---

## **📊 DEPLOYMENT STATUS**

✅ **Preview:** https://tuinbeheer-systeem-git-preview-amerikrijn.vercel.app  
⏳ **Production:** Wacht op approval na preview test

**Laatste update:** Banking-compliant admin functies geïmplementeerd