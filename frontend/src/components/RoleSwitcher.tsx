import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';
import { Loader2 } from 'lucide-react';

/**
 * Role switcher for toggling between Event Discoverer and Event Publisher modes
 * Event Discoverer: Browse and discover events
 * Event Publisher: Create, edit, delete, and manage events
 */
export const RoleSwitcher = () => {
  const { canSwitchRole, role, setActiveRole, loading } = useAuthWithBackend();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);

  if (!canSwitchRole) return null;

  const handleRoleSwitch = async (newRole: 'user' | 'organizer', targetPath: string) => {
    if (switching || role === newRole) return;

    setSwitching(true);
    try {
      await setActiveRole(newRole);
      navigate(targetPath);
    } catch (error) {
      console.error('Role switch failed:', error);
    } finally {
      setSwitching(false);
    }
  };

  return (
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
  );
};
