-- 🔍 STAP 1: CHECK HUIDIGE RLS STATUS
-- Script om te controleren welke RLS policies er momenteel actief zijn
-- Datum: $(date)

-- ========================================
-- CHECK 1: WELKE TABELLEN HEBBEN RLS ENABLED
-- ========================================

SELECT 
  schemaname as "Schema",
  tablename as "Tabel",
  CASE 
    WHEN rowsecurity THEN '✅ RLS ENABLED' 
    ELSE '❌ RLS DISABLED' 
  END as "RLS Status"
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('users', 'gardens', 'plant_beds', 'plants', 'tasks', 'logbook_entries', 'user_garden_access')
ORDER BY tablename;

-- ========================================
-- CHECK 2: ALLE RLS POLICIES OP USERS TABEL
-- ========================================

SELECT 
  policyname as "Policy Naam",
  cmd as "Operatie",
  roles as "Rollen",
  permissive as "Type",
  CASE 
    WHEN qual IS NOT NULL THEN 'Heeft USING clause'
    ELSE 'Geen USING clause'
  END as "USING Status",
  CASE 
    WHEN with_check IS NOT NULL THEN 'Heeft WITH CHECK'
    ELSE 'Geen WITH CHECK'
  END as "CHECK Status"
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'users'
ORDER BY policyname;

-- ========================================
-- CHECK 3: ALLE RLS POLICIES OP ANDERE CORE TABELLEN
-- ========================================

SELECT 
  tablename as "Tabel",
  policyname as "Policy Naam",
  cmd as "Operatie",
  roles as "Rollen"
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('gardens', 'plant_beds', 'plants', 'tasks', 'logbook_entries', 'user_garden_access')
ORDER BY tablename, policyname;

-- ========================================
-- CHECK 4: USERS TABEL STRUCTUUR
-- ========================================

SELECT 
  column_name as "Kolom",
  data_type as "Type",
  is_nullable as "Nullable",
  column_default as "Default"
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- ========================================
-- CHECK 5: ZIJN ER USERS IN DE TABEL?
-- ========================================

SELECT 
  COUNT(*) as "Totaal Users",
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as "Admin Users",
  COUNT(CASE WHEN role = 'user' THEN 1 END) as "Regular Users",
  COUNT(CASE WHEN status = 'active' THEN 1 END) as "Active Users"
FROM public.users;

-- ========================================
-- CHECK 6: TEST AUTH.UID() FUNCTIE
-- ========================================

SELECT 
  auth.uid() as "Current Auth UID",
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ Auth UID is NULL'
    ELSE '✅ Auth UID werkt'
  END as "Auth Status";

-- ========================================
-- RESULTAAT INTERPRETATIE
-- ========================================

-- Na het runnen van dit script zie je:
-- 1. Welke tabellen RLS hebben (ENABLED/DISABLED)
-- 2. Welke policies er zijn op users tabel
-- 3. Of er data in users tabel staat
-- 4. Of auth.uid() werkt
--
-- Verwachte productie situatie:
-- - users tabel: RLS ENABLED met policies voor user/admin/service access
-- - andere tabellen: RLS ENABLED met appropriate policies
-- - auth.uid() kan NULL zijn (normaal voor service calls)

-- ========================================
-- NOTES
-- ========================================

-- Dit script is read-only en verandert niets
-- Het geeft alleen informatie over de huidige staat
-- Gebruik de output om te bepalen wat er hersteld moet worden