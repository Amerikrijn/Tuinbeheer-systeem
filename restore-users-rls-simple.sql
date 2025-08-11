-- 🔧 SIMPLE RLS RESTORE: Users Table
-- Script om RLS policy op users tabel te herstellen zoals in productie
-- Voor: Test environment gelijk maken aan productie

-- Stap 1: Zorg dat RLS is ingeschakeld op users tabel
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Stap 2: Verwijder eventuele test policies
DROP POLICY IF EXISTS "Allow all operations on users" ON public.users;
DROP POLICY IF EXISTS "Temporary test access" ON public.users;
DROP POLICY IF EXISTS "Test policy" ON public.users;

-- Stap 3: Herstel de basis RLS policies zoals in productie

-- Policy 1: Users kunnen hun eigen profiel lezen
CREATE POLICY "Users can read own profile"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Service role heeft volledige toegang (voor API calls)
CREATE POLICY "Service role full access"
ON public.users FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy 3: Admin users kunnen alle users lezen en beheren
CREATE POLICY "Admin full access"
ON public.users FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
    AND status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
    AND status = 'active'
  )
);

-- Verificatie: Check of RLS is ingeschakeld
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE tablename = 'users';

-- Verificatie: Toon alle policies op users tabel
SELECT 
  policyname as "Policy Name",
  cmd as "Command",
  roles as "Roles"
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- Log de herstel actie
INSERT INTO public.system_logs (level, message, context, created_at)
VALUES (
  'INFO',
  'RLS policies hersteld op users tabel - Test omgeving gelijk aan productie',
  'database-rls-restore',
  NOW()
) ON CONFLICT DO NOTHING;