-- Fix existing users who don't have user_preferences records
-- This creates missing user_preferences records for users who signed up after triggers were removed

INSERT INTO public.user_preferences (user_id)
SELECT u.id 
FROM auth.users u
LEFT JOIN public.user_preferences p ON u.id = p.user_id
WHERE p.user_id IS NULL
AND EXISTS (
    SELECT 1 FROM public.user_roles r 
    WHERE r.user_id = u.id AND r.role = 'user'
);

-- Verify the fix
SELECT 
    u.id,
    u.email,
    CASE WHEN p.user_id IS NOT NULL THEN 'Has preferences' ELSE 'Missing preferences' END as status
FROM auth.users u
LEFT JOIN public.user_preferences p ON u.id = p.user_id
ORDER BY status, u.email;
