import { useNavigate } from 'react-router-dom';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';

/**
 * Shown when the account has both user and organizer roles.
 * Switches UI mode; preference stored in localStorage.
 */
export const RoleSwitcher = () => {
  const { canSwitchRole, role, setActiveRole } = useAuthWithBackend();
  const navigate = useNavigate();

  if (!canSwitchRole) return null;

  return (
    <div className="flex items-center border border-l-0 border-foreground h-[34px]">
      <button
        type="button"
        onClick={async () => {
          await setActiveRole('user');
          navigate('/discover');
        }}
        className={`h-full px-2.5 text-[10px] font-medium uppercase leading-none transition-colors ${
          role === 'user' ? 'bg-foreground text-background' : 'bg-background text-foreground hover:bg-muted'
        }`}
      >
        Discover
      </button>
      <button
        type="button"
        onClick={async () => {
          await setActiveRole('organizer');
          navigate('/organizer');
        }}
        className={`h-full px-2.5 text-[10px] font-medium uppercase leading-none border-l border-foreground transition-colors ${
          role === 'organizer' ? 'bg-foreground text-background' : 'bg-background text-foreground hover:bg-muted'
        }`}
      >
        Organize
      </button>
    </div>
  );
};
