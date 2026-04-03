-- Add OAuth provider fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email',
ADD COLUMN IF NOT EXISTS provider_id TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Create index for provider lookup
CREATE INDEX IF NOT EXISTS idx_profiles_provider_id ON public.profiles(provider_id);

-- Update existing profiles to have 'email' as default provider
UPDATE public.profiles 
SET provider = 'email' 
WHERE provider IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.provider IS 'Authentication provider (email, google, github, etc.)';
COMMENT ON COLUMN public.profiles.provider_id IS 'Unique identifier from the OAuth provider';
COMMENT ON COLUMN public.profiles.avatar_url IS 'Profile picture URL from OAuth provider';
COMMENT ON COLUMN public.profiles.full_name IS 'User full name from OAuth provider';
