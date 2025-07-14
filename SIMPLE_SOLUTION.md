# 🎯 SIMPELE OPLOSSING: Test Environment Setup

## Het probleem
Je wilt een test environment hebben waar je veilig kunt ontwikkelen zonder je productie data te raken.

## ✅ MAKKELIJKSTE OPLOSSING

### Optie 1: Environment URLs omwisselen
```bash
# Huidige situatie:
# Productie: https://qrotadbmnkhhwhshijdy.supabase.co (met data)
# Test: https://dwsgwqosmihsfaxuheji.supabase.co (leeg)

# Nieuwe situatie:
# Productie: https://dwsgwqosmihsfaxuheji.supabase.co (jouw huidige data)
# Test: https://qrotadbmnkhhwhshijdy.supabase.co (wordt test environment)
```

**Voordeel**: Je data blijft veilig, je krijgt direct een werkende test environment!

### Optie 2: Supabase Dashboard Backup
1. Ga naar je productie database
2. Database → Backups → "Start backup"
3. Download backup
4. Ga naar test database
5. Restore backup

### Optie 3: Handmatige setup (wat we nu hebben)
1. Voer SQL uit in test database (om schema te maken)
2. Kopieer data handmatig (als je wilt)

## 🚀 AANBEVELING

**Gebruik Optie 1**: Wissel gewoon de URLs om!

1. Update je productie app om de nieuwe URL te gebruiken:
   ```
   https://dwsgwqosmihsfaxuheji.supabase.co
   ```

2. Gebruik je oude URL als test environment:
   ```
   https://qrotadbmnkhhwhshijdy.supabase.co
   ```

3. Update je `.env.test`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL_TEST=https://qrotadbmnkhhwhshijdy.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY_TEST=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZGdmaW90c2duenZ6c215bG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzA4MTMsImV4cCI6MjA2ODAwNjgxM30.5ARPqu6X_YzHmKdHZKYf69jK2KZUrwLdPHwd3toD2BY
   ```

4. Update je productie environment:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://dwsgwqosmihsfaxuheji.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE
   ```

**Klaar!** Je hebt nu:
- ✅ Productie database (nieuw, leeg, veilig)
- ✅ Test database (met al je data, perfect om mee te testen)
- ✅ Werkende environment switching

## 🎉 Resultaat
- **Geen data verlies**
- **Direct werkende setup** 
- **Veilig testen mogelijk**
- **Geen complexe scripts nodig**

---

*Soms is de simpelste oplossing de beste!* 🚀