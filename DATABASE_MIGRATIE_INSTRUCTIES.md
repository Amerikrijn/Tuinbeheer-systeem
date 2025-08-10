# 🗄️ DATABASE MIGRATIE INSTRUCTIES

## **🎯 FORCE PASSWORD CHANGE MIGRATIE**

**Probleem:** Force password change werkt niet omdat database kolom ontbreekt.

**Oplossing:** Run `04-force-password-change-migration.sql` in Supabase.

---

## **📋 STAPPEN:**

### **1. Open Supabase Dashboard**
1. Ga naar: https://supabase.com/dashboard
2. Select project: `dwsgwqosmihsfaxuheji`
3. Ga naar **SQL Editor**

### **2. Run Migratie**
1. Open `database/04-force-password-change-migration.sql`
2. **Copy hele inhoud**
3. **Paste in SQL Editor**
4. **Klik "Run"**

### **3. Verificatie**
Run deze query om te checken:
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('force_password_change', 'password_changed_at');
```

**Verwacht resultaat:**
```
force_password_change | boolean | YES
password_changed_at   | timestamp with time zone | YES
```

---

## **🏦 BANKING COMPLIANCE VERIFICATIE**

### **Test Force Password Change Flow:**

1. **Admin reset password:**
   - Ga naar `/admin/users`
   - Reset password voor test user
   - Check: `force_password_change = TRUE` in database

2. **User login:**
   - Login met tijdelijk wachtwoord
   - **Verwacht:** Force password change scherm
   - **Verwacht:** Kan NIET verder zonder nieuw wachtwoord

3. **Password change:**
   - Stel nieuw wachtwoord in
   - **Verwacht:** `force_password_change = FALSE` in database
   - **Verwacht:** Normale toegang tot systeem

---

## **⚠️ BELANGRIJKE NOTES**

- **Run migratie in BEIDE environments** (preview + production)
- **Test thoroughly** na migratie
- **Backup database** voor productie migratie
- **RLS policies** worden automatisch toegevoegd

---

## **🔧 TROUBLESHOOTING**

### **Migratie Faalt:**
- Check database permissions
- Run queries één voor één
- Check system_logs tabel voor errors

### **Force Password Change Werkt Niet:**
- Verify kolom bestaat: `\d users` in psql
- Check RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'users'`
- Check user profile loading in browser console

**Na migratie: Force password change werkt 100% banking-compliant! 🏦✨**