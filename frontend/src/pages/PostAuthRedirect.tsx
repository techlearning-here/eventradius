import { useEffect, useState, useRef } from 'react';
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
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Timeout failsafe - if auth takes too long, force redirect to onboarding
    timeoutRef.current = setTimeout(() => {
      if (checking) {
        console.warn('[PostAuthRedirect] Auth loading timeout - forcing redirect to onboarding');
        navigate('/onboarding', { replace: true });
      }
    }, 5000); // 5 second timeout

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [checking, navigate]);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      // Wait for auth to finish loading (with timeout protection above)
      if (authLoading) {
        return;
      }

      if (!user) {
        console.log('[PostAuthRedirect] No user found, redirecting to signin');
        navigate('/signin');
        return;
      }

      try {
        console.log('[PostAuthRedirect] Checking onboarding status...');
        // Fetch user preferences to check onboarding status
        const prefs = await apiClient.getUserPreferences();
        const isOnboarded = prefs?.onboarding_completed === true;
        
        console.log('[PostAuthRedirect] Onboarding completed:', isOnboarded);
        
        if (isOnboarded) {
          navigate('/discover', { replace: true });
        } else {
          navigate('/onboarding', { replace: true });
        }
      } catch (err) {
        console.error('[PostAuthRedirect] Error checking onboarding:', err);
        setError('Failed to check onboarding status');
        // Default to onboarding if we can't check
        navigate('/onboarding', { replace: true });
      } finally {
        setChecking(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    };

    checkOnboardingStatus();
  }, [user, authLoading, navigate]);

  // Show debugging info in development
  const showDebug = import.meta.env.DEV;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting...</p>
        {showDebug && (
          <div className="mt-4 text-xs text-muted-foreground max-w-md mx-auto">
            <p>Auth loading: {authLoading ? 'true' : 'false'}</p>
            <p>User: {user ? 'authenticated' : 'none'}</p>
            <p>Checking: {checking ? 'true' : 'false'}</p>
            {error && <p className="text-red-500">Error: {error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
