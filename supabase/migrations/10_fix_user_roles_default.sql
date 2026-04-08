-- =====================================================
-- 10 - Fix User Roles Default Assignment
-- =====================================================
-- This migration ensures every user has a default 'user' role
-- and fixes any missing role assignments

-- Function to assign default role to new users
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert default 'user' role for new users
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to assign default role on user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.assign_default_role();

-- Ensure existing users have default roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'
FROM auth.users
WHERE id NOT IN (
    SELECT user_id 
    FROM public.user_roles 
    WHERE role = 'user'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.assign_default_role TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
