-- Fix RLS policy for user_preferences to work with backend service role
-- This policy allows the backend to manage user preferences when using service role key

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own prefs" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update own prefs" ON public.user_preferences;

-- Create new policies that work with both user tokens and service role
CREATE POLICY "Users can insert own prefs" ON public.user_preferences FOR INSERT TO authenticated 
WITH CHECK (
  auth.uid() = user_id OR 
  (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
);

CREATE POLICY "Users can update own prefs" ON public.user_preferences FOR UPDATE TO authenticated 
USING (
  auth.uid() = user_id OR 
  (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
);
