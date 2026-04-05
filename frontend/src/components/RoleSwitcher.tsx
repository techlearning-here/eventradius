import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';
import { apiClient } from '@/integrations/backend/api';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Role switcher for toggling between Event Discoverer and Event Publisher modes
 * Event Discoverer: Browse and discover events
 * Event Publisher: Create, edit, delete, and manage events
 */
export const RoleSwitcher = () => {
  const { canSwitchRole, role, setActiveRole, loading } = useAuthWithBackend();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!canSwitchRole) return null;

  const handleRoleSwitch = async (newRole: 'user' | 'organizer', targetPath: string) => {
    if (switching || role === newRole) return;

    // If switching to organizer role, show confirmation dialog first
    if (newRole === 'organizer') {
      setShowConfirmation(true);
      return;
    }

    setSwitching(true);
    try {
      await setActiveRole(newRole);
      navigate(targetPath);
    } catch (error) {
      console.error('Role switch failed:', error);
      toast.error('Failed to switch roles');
    } finally {
      setSwitching(false);
    }
  };

  const confirmOrganizerSwitch = async () => {
    setSwitching(true);
    setShowConfirmation(false);
    
    try {
      // Check if organizer onboarding is needed
      try {
        const preferences = await apiClient.getUserPreferences();
        
        // If user hasn't completed organizer onboarding, redirect to onboarding
        if (!preferences.organizer_onboarding_completed) {
          console.log('Organizer onboarding required, redirecting to onboarding');
          navigate('/organizer-onboarding');
          return;
        }
      } catch (error) {
        console.log('Error checking organizer preferences, proceeding to onboarding:', error);
        // If we can't check preferences, assume onboarding is needed
        navigate('/organizer-onboarding');
        return;
      }

      await setActiveRole('organizer');
      navigate('/organizer');
    } catch (error) {
      console.error('Role switch failed:', error);
      toast.error('Failed to switch roles');
    } finally {
      setSwitching(false);
    }
  };

  return (
    <>
      <div className="flex items-center border border-l-0 border-foreground h-[34px]">
        <button
          type="button"
          onClick={() => handleRoleSwitch('user', '/discover')}
          disabled={switching}
          className={`h-full px-2.5 text-[10px] font-medium uppercase leading-none transition-all duration-200 flex items-center gap-1 ${
            role === 'user'
              ? 'bg-foreground text-background'
              : 'bg-background text-foreground hover:bg-muted'
          } ${switching ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {switching && role !== 'user' && <Loader2 className="w-2 h-2 animate-spin" />}
          Event Discoverer
        </button>
        <button
          type="button"
          onClick={() => handleRoleSwitch('organizer', '/organizer')}
          disabled={switching}
          className={`h-full px-2.5 text-[10px] font-medium uppercase leading-none border-l border-foreground transition-all duration-200 flex items-center gap-1 ${
            role === 'organizer'
              ? 'bg-foreground text-background'
              : 'bg-background text-foreground hover:bg-muted'
          } ${switching ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {switching && role !== 'organizer' && <Loader2 className="w-2 h-2 animate-spin" />}
          Event Publisher
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowConfirmation(false)} />
          <div className="relative bg-background border border-border rounded-lg shadow-lg p-6 max-w-md mx-4">
            <button
              onClick={() => setShowConfirmation(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-[hsl(295,100%,73%)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📅</span>
              </div>
              
              <h3 className="text-lg font-semibold mb-2">Become an Event Publisher</h3>
              <p className="text-muted-foreground mb-6">
                Ready to create and manage your own events? As an Event Publisher, you'll be able to:
              </p>
              
              <ul className="text-left text-sm text-muted-foreground space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[hsl(295,100%,73%)] rounded-full"></span>
                  Create and publish events
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[hsl(295,100%,73%)] rounded-full"></span>
                  Manage event registrations
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[hsl(295,100%,73%)] rounded-full"></span>
                  Communicate with attendees
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[hsl(295,100%,73%)] rounded-full"></span>
                  Track event analytics
                </li>
              </ul>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> You'll need to provide some additional information to verify your organizer account.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium border border-border rounded-md hover:border-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmOrganizerSwitch}
                  disabled={switching}
                  className="flex-1 px-4 py-2 bg-[hsl(295,100%,73%)] text-foreground font-medium rounded-md hover:bg-[hsl(295,100%,78%)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {switching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
