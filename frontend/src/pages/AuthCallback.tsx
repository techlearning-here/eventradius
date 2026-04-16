import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { handleSimpleOAuthCallback } from '@/lib/simple-auth';
import { apiClient } from '@/integrations/backend/api';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Starting simple OAuth callback handling...');
        console.log('Current URL:', window.location.href);

        // Use the simple OAuth handler that doesn't try to create profiles
        const result = await handleSimpleOAuthCallback();

        if (result.success) {
          console.log('OAuth successful!', result.user);
          console.log('User email:', result.user.email);
          console.log('User metadata:', result.user.user_metadata);
          console.log('App metadata:', result.user.app_metadata);

          // Clear any old cached user data to prevent stale user issues
          localStorage.removeItem('eventradius_user');
          localStorage.removeItem('eventradius_user_id');
          console.log('Cleared old cached user data');

          // Mark that we just completed OAuth - this helps useAuthWithBackend skip heavy init
          sessionStorage.setItem('just_completed_oauth', 'true');

          // Redirect to PostAuthRedirect component which will decide where to go
          console.log('OAuth successful, redirecting to decision component');
          navigate('/post-auth', { replace: true });
        } else {
          console.error('OAuth failed:', result.error);
          navigate('/auth?error=auth_failed');
        }

      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/auth?error=auth_failed');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
