
-- Check Martine's garden access in database
SELECT 
    u.email,
    u.role,
    uga.garden_id,
    g.name as garden_name
FROM users u
JOIN user_garden_access uga ON u.id = uga.user_id  
JOIN gardens g ON g.id = uga.garden_id
WHERE u.email = 'groenesteinm@hotmail.com';

