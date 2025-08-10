# 🏗️ SERVER-SIDE vs CLIENT-SIDE UITLEG

## **🎯 WAT IS HET VERSCHIL?**

### **CLIENT-SIDE (Browser/Frontend)**
- Code die **in de browser** van de gebruiker draait
- **Zichtbaar** voor iedereen (via browser developer tools)
- **Onveilig** voor gevoelige operaties
- Voorbeeld: `app/admin/users/page.tsx` React component

### **SERVER-SIDE (Vercel Server/Backend)**  
- Code die **op de server** draait (Vercel)
- **Onzichtbaar** voor gebruikers
- **Veilig** voor gevoelige operaties
- Voorbeeld: `app/api/admin/reset-password/route.ts` API route

---

## **🔒 WAAROM BANKING STANDARDS?**

### **❌ PROBLEEM: Client-Side Admin Acties**
```typescript
// ❌ ONVEILIG - In browser (app/admin/users/page.tsx)
const { error } = await supabase.auth.admin.deleteUser(userId)
```

**Problemen:**
- Service role key **zichtbaar in browser** 
- Gebruiker kan code **inspecteren en misbruiken**
- **Geen echte beveiliging** - iedereen kan admin calls doen
- **Banking standards OVERTREDEN**

### **✅ OPLOSSING: Server-Side API Routes**
```typescript
// ✅ VEILIG - Op server (app/api/admin/delete-user/route.ts)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Alleen server-side beschikbaar
  { auth: { autoRefreshToken: false, persistSession: false } }
)
```

**Voordelen:**
- Service role key **alleen op server**
- Gebruiker **kan code niet zien**
- **Echte beveiliging** - alleen server kan admin calls doen
- **Banking standards COMPLIANT**

---

## **📧 SUPABASE EMAIL SERVICES**

### **Supabase Email Infrastructure**
```
Supabase Email Service (Server-side)
├── SMTP Server (Supabase managed)
├── Email Templates (Supabase managed)  
├── Delivery System (Supabase managed)
└── Rate Limiting (Supabase managed)
```

**Dit is ALTIJD server-side:**
- Supabase's email servers draaien op **hun servers**
- Wij kunnen **niet zien** hoe dit werkt
- **Veilig** - wij hebben geen toegang tot email infrastructure

### **Onze Email Triggers**

#### **❌ OUDE MANIER (Client-side trigger)**
```typescript
// In browser - ONVEILIG voor admin functies
const { error } = await supabase.auth.admin.inviteUserByEmail(email, options)
```

#### **✅ NIEUWE MANIER (Server-side trigger)**  
```typescript
// Browser roept onze API aan
fetch('/api/admin/invite-user', { method: 'POST', body: data })

// Onze server roept Supabase aan
const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, options)
```

---

## **🔄 COMPLETE FLOW VOORBEELD**

### **Password Reset Flow:**

```
1. 🖥️  BROWSER (Client-side)
   └── Admin klikt "Reset Password" knop
   └── Browser roept aan: fetch('/api/admin/reset-password')

2. 🌐 VERCEL SERVER (Server-side)  
   └── API route: /api/admin/reset-password/route.ts
   └── Gebruikt SUPABASE_SERVICE_ROLE_KEY (veilig!)
   └── Roept aan: supabaseAdmin.auth.admin.updateUserById()

3. 🗄️  SUPABASE (Server-side)
   └── Valideert service role key
   └── Update user password in database
   └── Stuurt response terug

4. 🌐 VERCEL SERVER (Server-side)
   └── Ontvangt Supabase response  
   └── Logt admin actie (audit trail)
   └── Stuurt response naar browser

5. 🖥️  BROWSER (Client-side)
   └── Ontvangt success/error response
   └── Toont toast notification aan admin
```

---

## **🔑 ENVIRONMENT VARIABLES**

### **Client-side (Zichtbaar in browser)**
```typescript
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- **NEXT_PUBLIC_** prefix = zichtbaar in browser
- **Anon key** = beperkte rechten, veilig om te delen

### **Server-side (Onzichtbaar voor gebruikers)**
```typescript  
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- **Geen NEXT_PUBLIC_** prefix = alleen server-side
- **Service role key** = volledige admin rechten, GEHEIM!

---

## **🏦 WAAROM DIT BANKING STANDARD IS**

### **Principe: "Never Trust the Client"**
- Alles wat in browser draait = **onbetrouwbaar**
- Gebruiker kan **alle client-side code aanpassen**
- **Echte beveiliging** gebeurt altijd server-side

### **Audit Trail Requirements**
- Alle admin acties moeten **gelogd** worden
- Server-side logging is **betrouwbaar**
- Client-side logging kan **gemakkelijk omzeild** worden

### **Privilege Separation**
- **Regular users** krijgen anon key (beperkte rechten)
- **Admin functions** krijgen service role key (volledige rechten)
- Service role key **nooit** naar browser sturen

---

## **🔧 TECHNISCHE IMPLEMENTATIE**

### **Onze Nieuwe Architectuur:**
```
Browser (Client-side)          Server (Server-side)           Supabase
─────────────────────         ────────────────────          ──────────
admin/users/page.tsx    →     api/admin/invite-user/        →   Auth API
  ├── handleInviteUser()      │  └── route.ts                   ├── inviteUserByEmail()
  ├── handleDeleteUser()   →  ├── api/admin/delete-user/     →  ├── deleteUser()  
  ├── updateUserStatus()   →  ├── api/admin/update-status/   →  ├── updateUserById()
  └── updateUserRole()     →  └── api/admin/update-role/     →  └── Database queries

ANON KEY (beperkt)            SERVICE ROLE KEY (volledig)      Database
```

### **Wat hebben we veranderd:**
1. **Alle admin functies** naar server-side API routes
2. **Service role key** alleen server-side gebruiken  
3. **Client-side** roept onze APIs aan (niet direct Supabase)
4. **Audit logging** in alle server-side routes

Dit is **banking-grade security** - geen shortcuts, geen technical debt! 🏦✨