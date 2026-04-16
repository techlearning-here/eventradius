import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/integrations/backend/api';

/**
 * PostAuthRedirect - Centralized decision component for routing after authentication
 * 
 * Flow:
 * 1. AuthCallback redirects here after successful OAuth
 * 2. This component checks user.onboarding_completed flag
 * 3. Redirects to /onboarding if not completed, /discover if completed
 * 
 * This is the ONLY place that makes the onboarding routing decision.
 * Discover page has no knowledge of onboarding.
 */
export function PostAuthRedirect() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      console.log('PostAuthRedirect: checking user state', { 
        userId: user?.id, 
        authLoading 
      });

      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }

      if (!user) {
        console.log('PostAuthRedirect: no user, redirecting to signin');
        navigate('/signin');
        return;
      }

      try {
        // Fetch user preferences to check onboarding status
        const prefs = await apiClient.getUserPreferences();
        const isOnboarded = prefs?.onboarding_completed === true;
        
        console.log('PostAuthRedirect: onboarding status =', isOnboarded);
        
        if (isOnboarded) {
          console.log('PostAuthRedirect: user onboarded, going to /discover');
          navigate('/discover', { replace: true });
        } else {
          console.log('PostAuthRedirect: user not onboarded, going to /onboarding');
          navigate('/onboarding', { replace: true });
        }
      } catch (err) {
        console.error('PostAuthRedirect: error checking onboarding status', err);
        // Default to onboarding if we can't check
        navigate('/onboarding', { replace: true });
      } finally {
        setChecking(false);
      }
    };

    checkOnboardingStatus();
  }, [user, authLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
