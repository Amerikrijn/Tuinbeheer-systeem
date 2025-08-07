-- SQL Script om Martine's login te fixen
-- Email: groenesteinm@hotmail.com
-- Probleem: Email niet bevestigd, kan niet inloggen
-- Oplossing: Handmatig email_confirmed_at instellen

-- Stap 1: Controleer de huidige status van de gebruiker
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at
FROM auth.users 
WHERE email = 'groenesteinm@hotmail.com';

-- Stap 2: Bevestig de email voor Martine
UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'groenesteinm@hotmail.com';

-- Stap 3: Controleer of de update is gelukt
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN 'Email bevestigd ✅'
        ELSE 'Email NIET bevestigd ❌'
    END as status
FROM auth.users 
WHERE email = 'groenesteinm@hotmail.com';

-- Stap 4: Controleer ook de publieke users tabel
SELECT 
    id,
    email,
    full_name,
    role,
    status
FROM public.users 
WHERE email = 'groenesteinm@hotmail.com';

-- Optioneel: Als de gebruiker ook in public.users inactief staat, activeer deze
UPDATE public.users 
SET 
    status = 'active',
    updated_at = NOW()
WHERE email = 'groenesteinm@hotmail.com' 
AND status != 'active';

-- Finale controle: Alle informatie van Martine
SELECT 
    'auth.users' as table_name,
    au.id,
    au.email,
    au.email_confirmed_at,
    NULL as role,
    NULL as status
FROM auth.users au
WHERE au.email = 'groenesteinm@hotmail.com'

UNION ALL

SELECT 
    'public.users' as table_name,
    pu.id,
    pu.email,
    NULL as email_confirmed_at,
    pu.role,
    pu.status
FROM public.users pu
WHERE pu.email = 'groenesteinm@hotmail.com';