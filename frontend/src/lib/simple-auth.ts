import { supabase } from '@/integrations/supabase/client';

export const signInWithGoogleSimple = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      skipBrowserRedirect: false,
    },
  });
  
  if (error) throw error;
  return data;
};

export const handleSimpleOAuthCallback = async (): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    // Wait for session to establish
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    if (!data.session?.user) {
      return { success: false, error: 'No session found' };
    }
    
    return { success: true, user: data.session.user };
    
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};
