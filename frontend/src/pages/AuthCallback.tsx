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

          // Check if user has completed onboarding using backend API
          try {
            const preferences = await apiClient.getUserPreferences();
            console.log('Onboarding status from callback:', preferences.onboarding_completed);

            // Redirect based on onboarding status
            if (preferences.onboarding_completed === true) {
              navigate('/discover');
            } else {
              navigate('/onboarding');
            }
          } catch (error) {
            console.log('No preferences found, going to onboarding');
            navigate('/onboarding');
          }
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
