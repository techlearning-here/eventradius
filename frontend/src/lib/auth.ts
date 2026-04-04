import { supabase } from '@/integrations/supabase/client';

export interface OAuthProfile {
  provider: string;
  provider_id: string;
  full_name?: string;
  avatar_url?: string;
}

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) throw error;
  return data;
};

export const signInWithGitHub = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
};

export const createOrUpdateOAuthProfile = async (profile: OAuthProfile): Promise<void> => {
  const session = await getCurrentSession();
  if (!session?.access_token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch('/api/auth/oauth/profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to create OAuth profile');
  }
};

export const getOAuthProfile = async () => {
  const session = await getCurrentSession();
  if (!session?.access_token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch('/api/auth/oauth/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to fetch OAuth profile');
  }

  return response.json();
};

export const linkOAuthAccount = async (profile: OAuthProfile): Promise<void> => {
  const session = await getCurrentSession();
  if (!session?.access_token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch('/api/auth/oauth/link', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to link OAuth account');
  }
};

export const unlinkOAuthAccount = async (): Promise<void> => {
  const session = await getCurrentSession();
  if (!session?.access_token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch('/api/auth/oauth/unlink', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to unlink OAuth account');
  }
};

// Handle OAuth callback
export const handleOAuthCallback = async (): Promise<void> => {
  // Wait a bit for the session to be established
  await new Promise(resolve => setTimeout(resolve, 1000));

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error('Auth callback error: ' + error.message);
  }

  if (!data.session?.user) {
    throw new Error('No session found after OAuth callback');
  }

  const user = data.session.user;
  console.log('OAuth user authenticated:', user);

  // For now, just log the user data without trying to create profile
  // This will help us isolate if the issue is with OAuth or profile creation

  // Check if this is an OAuth user
  if (user.app_metadata?.provider && user.app_metadata.provider !== 'email') {
    console.log('OAuth provider detected:', user.app_metadata.provider);
    console.log('User metadata:', user.user_metadata);

    // Skip profile creation for now to test OAuth flow
    try {
      await createOrUpdateOAuthProfile({
        provider: user.app_metadata.provider,
        provider_id: user.id,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name,
        avatar_url: user.user_metadata?.avatar_url,
      });
      console.log('Profile created successfully');
    } catch (profileError) {
      console.error('Profile creation error (but OAuth worked):', profileError);
      // Don't throw here, as user is already authenticated
      // We'll handle profile creation separately
    }
  }
};
