# 🚨 PHASE 1: DATABASE STABILIZATION INSTRUCTIONS

## ⚠️ WAARSCHUWING
**Dit script schakelt alle database beveiliging tijdelijk uit. Gebruik dit ALLEEN in preview/development omgevingen.**

## 🎯 Doel
- Alle RLS (Row Level Security) policies tijdelijk uitschakelen
- Database toegang consistent maken zodat opslaan altijd werkt
- Basis functionaliteit herstellen

## 📋 Stappen

### Stap 1: Backup (Optioneel maar Aanbevolen)
Maak een backup van je huidige database voordat je begint:
```sql
-- In Supabase SQL Editor
-- Exporteer je huidige schema en data
```

### Stap 2: Voer het Stabilisatie Script Uit
1. Ga naar je **Supabase Dashboard**
2. Open de **SQL Editor**
3. Kopieer en plak de inhoud van `phase1-stabilize-rls.sql`
4. Klik op **Run** om het script uit te voeren

### Stap 3: Verificeer de Wijzigingen
1. Voer het test script `test-basic-access.sql` uit
2. Controleer of alle tests **PASSED** tonen
3. Verifieer dat RLS is uitgeschakeld op alle tabellen

### Stap 4: Test je Applicatie
1. Test of je kunt inloggen
2. Test of je data kunt opslaan (consistent)
3. Test of je data kunt lezen
4. Test of je data kunt bijwerken

## 🔍 Wat het Script Doet

### RLS Uitschakelen
- `ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;`
- `ALTER TABLE public.gardens DISABLE ROW LEVEL SECURITY;`
- Enzovoort voor alle tabellen

### Policies Verwijderen
- Alle bestaande RLS policies worden weggehaald
- Geen restricties meer op database toegang

### Verificatie
- Controleert of RLS echt is uitgeschakeld
- Controleert of alle policies zijn weggehaald
- Test basis database toegang

## ✅ Verwachte Resultaten

Na uitvoering zou je moeten zien:
- **RLS_STATUS_CHECK**: Alle tabellen tonen "PASSED - RLS disabled"
- **POLICY_CLEANUP_CHECK**: "PASSED - All policies removed"
- **Alle andere tests**: "PASSED"

## 🚨 Risico's

### Tijdelijke Risico's (Acceptabel voor Development)
- Geen database beveiliging
- Alle gebruikers kunnen alle data zien/bewerken
- Geen toegangscontrole

### Permanente Risico's (Alleen als je vergeet Fase 2 te doen)
- Database blijft onbeveiligd
- Mogelijke data lekkage
- Compliance problemen

## 📅 Volgende Stappen

### Fase 2 (Volgende Week)
- Database audit uitvoeren
- Security requirements bepalen
- Nieuwe policies implementeren

### Fase 3 (Daarna)
- Policies testen in preview
- Gecontroleerde implementatie in productie

## 🆘 Problemen Oplossen

### Als het Script Faalt
1. Controleer of je admin rechten hebt in Supabase
2. Controleer of alle tabellen bestaan
3. Voer het script stap voor stap uit

### Als Tests Falen
1. Controleer of RLS echt is uitgeschakeld
2. Controleer of alle policies zijn weggehaald
3. Voer het stabilisatie script opnieuw uit

### Als Applicatie Nog Steeds Niet Werkt
1. Controleer database connectie
2. Controleer of je de juiste database gebruikt
3. Kijk naar browser console errors

## 📞 Hulp Nodig?

Als je problemen ondervindt:
1. Controleer de Supabase logs
2. Kijk naar de browser console
3. Test de database connectie handmatig
4. Documenteer alle errors voor Fase 2

---

**⚠️ HERINNERING: Dit is een tijdelijke fix. Zorg ervoor dat je Fase 2 uitvoert om security te herstellen!**