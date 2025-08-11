-- 🔧 TIJDELIJKE OPLOSSING: Handmatige Gebruikerstoevoeging
-- Voor gebruik tot de email flows zijn geoptimaliseerd

-- Stap 1: Voeg gebruiker toe aan auth.users (met wachtwoord)
-- Dit moet via Supabase Dashboard -> Authentication -> Users -> "Add user"
-- Of via deze SQL (vervang waarden):

-- Voorbeeld voor handmatige toevoeging:
-- Email: gebruiker@example.com
-- Password: TempPass123! (moet door gebruiker worden gewijzigd)

-- Stap 2: Voeg profiel toe aan public.users
INSERT INTO public.users (
    id, 
    email, 
    full_name, 
    role, 
    status,
    created_at
) VALUES (
    -- Vervang met de UUID van de auth.users record
    'REPLACE_WITH_AUTH_USER_ID',
    'gebruiker@example.com',
    'Jan de Vries',
    'user', -- of 'admin'
    'active', -- direct actief
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = NOW();

-- Stap 3: Voeg tuin toegang toe (alleen voor users, niet admins)
INSERT INTO public.user_garden_access (user_id, garden_id) VALUES 
    ('REPLACE_WITH_AUTH_USER_ID', 'REPLACE_WITH_GARDEN_ID');

-- INSTRUCTIES VOOR 20 GEBRUIKERS:
-- 1. Ga naar Supabase Dashboard -> Authentication -> Users
-- 2. Klik "Add user" voor elke gebruiker
-- 3. Gebruik tijdelijk wachtwoord: TempPass123!
-- 4. Kopieer de gegenereerde UUID
-- 5. Run bovenstaande INSERT queries voor elke gebruiker
-- 6. Gebruikers moeten wachtwoord wijzigen bij eerste login

-- VOORBEELD BATCH VOOR 3 GEBRUIKERS:
/*
INSERT INTO public.users (id, email, full_name, role, status, created_at) VALUES 
    ('USER_ID_1', 'user1@example.com', 'Gebruiker Een', 'user', 'active', NOW()),
    ('USER_ID_2', 'user2@example.com', 'Gebruiker Twee', 'user', 'active', NOW()),
    ('USER_ID_3', 'admin@example.com', 'Admin Gebruiker', 'admin', 'active', NOW());
*/