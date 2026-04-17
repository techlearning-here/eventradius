import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';
import { SEOHead } from '@/components/SEOHead';
import { Loader2, Calendar, Users, PlusCircle } from 'lucide-react';

const RoleBasedLanding = () => {
  const { user, onboardingCompleted, hasOrganizerRole, hasUserRole } = useAuthWithBackend();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is not logged in, redirect to auth
    if (!user) {
      navigate('/auth');
      return;
    }

    // If onboarding is not completed, redirect to onboarding
    // Skip if we just completed onboarding (prevents redirect loop)
    if (sessionStorage.getItem('onboarding_completed') !== 'true' && 
        (onboardingCompleted === false || onboardingCompleted === null)) {
      navigate('/onboarding');
      return;
    }

    // If onboarding is completed, redirect based on role
    if (onboardingCompleted === true) {
      if (hasOrganizerRole) {
        navigate('/organizer');
      } else if (hasUserRole) {
        navigate('/discover');
      } else {
        // Default to discover if no specific role
        navigate('/discover');
      }
    }
  }, [user, onboardingCompleted, hasOrganizerRole, hasUserRole, navigate]);

  // Show loading state while checking
  if (!user || onboardingCompleted === null) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        <SEOHead title="Loading" description="Setting up your experience..." />
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <p className="text-lg font-medium">Setting up your experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title="Welcome" description="Your personalized event experience" />

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left side - Welcome message */}
        <div className="flex-1 lg:flex-1 bg-gradient-to-br from-[hsl(295,100%,73%)]/5 to-[hsl(295,100%,78%)]/10 p-8 lg:p-12 flex items-center justify-center">
          <div className="max-w-md text-center lg:text-left">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-white">
              Welcome back{user?.email?.split('@')[0] || ''}!
            </h1>
            <p className="text-lg lg:text-xl text-white/90 mb-8">
              {hasOrganizerRole ? (
                <>
                  Ready to create amazing events? <span className="font-semibold">Let's get started!</span>
                </>
              ) : hasUserRole ? (
                <>
                  Discover events happening <span className="font-semibold">near you</span>
                </>
              ) : (
                <>
                  Choose your adventure path
                </>
              )}
            </p>

            <div className="flex flex-col lg:flex-row gap-4">
              {hasOrganizerRole && (
                <button
                  onClick={() => navigate('/create-event')}
                  className="flex-1 bg-white text-[hsl(295,100%,73%)] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-5 h-5" />
                  Create Event
                </button>
              )}

              {hasUserRole && (
                <button
                  onClick={() => navigate('/discover')}
                  className="flex-1 bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Discover Events
                </button>
              )}

              {!hasOrganizerRole && !hasUserRole && (
                <button
                  onClick={() => navigate('/discover')}
                  className="flex-1 bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  Browse Events
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Features */}
        <div className="flex-1 lg:flex-1 bg-white p-8 lg:p-12">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              {hasOrganizerRole ? (
                <>Event Organizer Dashboard</>
              ) : hasUserRole ? (
                <>Event Discovery</>
              ) : (
                <>Get Started</>
              )}
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {hasOrganizerRole && (
                <>
                  <div className="p-6 border border-foreground/10 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <PlusCircle className="w-5 h-5 text-[hsl(295,100%,73%)]" />
                      Create Events
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Design and manage your events with powerful tools and analytics.
                    </p>
                    <button
                      onClick={() => navigate('/organizer')}
                      className="w-full bg-[hsl(295,100%,73%)] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[hsl(295,100%,78%)] transition-colors"
                    >
                      Go to Creator
                    </button>
                  </div>

                  <div className="p-6 border border-foreground/10 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[hsl(295,100%,73%)]" />
                      Manage Events
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      View and manage all your created events in one place.
                    </p>
                    <button
                      onClick={() => navigate('/organizer')}
                      className="w-full bg-foreground text-foreground-foreground px-4 py-3 rounded-lg font-semibold hover:bg-foreground/80 transition-colors"
                    >
                      View My Events
                    </button>
                  </div>
                </>
              )}

              {hasUserRole && (
                <>
                  <div className="p-6 border border-foreground/10 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[hsl(295,100%,73%)]" />
                      Discover Events
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Find events that match your interests and location.
                    </p>
                    <button
                      onClick={() => navigate('/discover')}
                      className="w-full bg-foreground text-foreground-foreground px-4 py-3 rounded-lg font-semibold hover:bg-foreground/80 transition-colors"
                    >
                      Start Discovering
                    </button>
                  </div>

                  <div className="p-6 border border-foreground/10 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5 text-[hsl(295,100%,73%)]" />
                      Your Profile
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Update your preferences and manage your account.
                    </p>
                    <button
                      onClick={() => navigate('/settings')}
                      className="w-full bg-foreground text-foreground-foreground px-4 py-3 rounded-lg font-semibold hover:bg-foreground/80 transition-colors"
                    >
                      Manage Settings
                    </button>
                  </div>
                </>
              )}

              {!hasOrganizerRole && !hasUserRole && (
                <div className="p-6 border border-foreground/10 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-[hsl(295,100%,73%)]" />
                    Get Started
                  </h3>
                    <p className="text-muted-foreground mb-4">
                      Choose how you'd like to use EventsRadius.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => navigate('/organizer')}
                        className="bg-[hsl(295,100%,73%)] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[hsl(295,100%,78%)] transition-colors"
                      >
                        Become Organizer
                      </button>
                      <button
                        onClick={() => navigate('/discover')}
                        className="bg-foreground text-foreground px-4 py-3 rounded-lg font-semibold hover:bg-foreground/80 transition-colors"
                      >
                        Browse Events
                      </button>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleBasedLanding;
