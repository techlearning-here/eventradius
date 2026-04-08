import React, { useState, useEffect } from 'react';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';

interface AccountDetailsProps {
  className?: string;
}

export const AccountDetails: React.FC<AccountDetailsProps> = ({ className = '' }) => {
  // Call all hooks at the top level to ensure consistent order
  const authResult = useAuthWithBackend();
  const { user, userProfile, signOut, loading } = authResult;
  const navigate = useNavigate();
  
  const [isOpen, setIsOpen] = useState(() => {
    const savedState = localStorage.getItem('accountDetailsOpen');
    return savedState === 'true';
  });

  // Sync with localStorage on mount and when it changes
  useEffect(() => {
    const savedState = localStorage.getItem('accountDetailsOpen');
    if (savedState === 'true' && !isOpen) {
      setIsOpen(true);
    } else if (savedState === 'false' && isOpen) {
      setIsOpen(false);
    }
  }, []);

  // Update localStorage when isOpen changes
  useEffect(() => {
    localStorage.setItem('accountDetailsOpen', isOpen.toString());
  }, [isOpen]);

  const handleSettings = () => {
    setIsOpen(false);
    navigate('/settings');
  };

  const handleSignOut = () => {
    setIsOpen(false);
    signOut();
  };

  // Don't render anything while auth is loading
  if (loading) {
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 group"
      >
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
          <User className="w-4 h-4 text-white" />
        </div>
        <span className="hidden md:block max-w-[100px] truncate">
          {userProfile?.full_name || user.email?.split('@')[0] || 'User'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[1999]"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-2 w-72 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl z-[2001] overflow-hidden">
            {/* User Info Header */}
            <div className="p-5 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border-b border-border/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-md">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-foreground truncate">
                    {userProfile?.full_name || 'User'}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-3 space-y-1">
              <button
                onClick={handleSettings}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground rounded-xl hover:bg-muted/80 transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-background transition-colors">
                  <Settings className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                </div>
                Settings
              </button>

              <div className="h-px bg-border/50 my-2" />

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/30 flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-900/40 transition-colors">
                  <LogOut className="w-4 h-4 text-red-500" />
                </div>
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
