-- Migration: Create User Profiles Table
-- Description: Create the user_profiles table with basic structure before adding attributes
-- Created: 2026-04-08

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic Profile Info
    full_name varchar(255),
    avatar_url text,
    bio text,
    phone varchar(50),
    
    -- Role & Status
    role varchar(50) DEFAULT 'discoverer', -- discoverer, organizer, admin
    is_organizer boolean DEFAULT false,
    is_verified boolean DEFAULT false,
    
    -- Location
    city varchar(100),
    state varchar(100),
    country varchar(100),
    timezone varchar(100) DEFAULT 'UTC',
    
    -- Preferences
    email_notifications boolean DEFAULT true,
    push_notifications boolean DEFAULT true,
    marketing_emails boolean DEFAULT false,
    
    -- Timestamps
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    -- Constraints
    CONSTRAINT user_profiles_user_id_key UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
    ON user_profiles FOR DELETE
    USING (auth.uid() = user_id);

-- Allow public read access to basic profile info (for event listings)
CREATE POLICY "Public can view basic profile info"
    ON user_profiles FOR SELECT
    USING (true);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Create index on role for filtering
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO authenticated;
GRANT SELECT ON user_profiles TO anon;

COMMENT ON TABLE user_profiles IS 'Extended user profile information for event matching and recommendations';
