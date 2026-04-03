import React, { useState } from 'react';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';

interface AccountDetailsProps {
  className?: string;
}

export const AccountDetails: React.FC<AccountDetailsProps> = ({ className = '' }) => {
  const { user, userProfile, signOut } = useAuthWithBackend();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleSettings = () => {
    setIsOpen(false);
    navigate('/settings');
  };

  const handleSignOut = () => {
    setIsOpen(false);
    signOut();
  };

  if (!user) return null;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-background text-foreground h-[34px] px-3 border border-foreground hover:border-foreground/80 transition-colors"
      >
        <div className="w-5 h-5 rounded-full bg-[#ff6bff] flex items-center justify-center">
          <User className="w-3 h-3 text-black" />
        </div>
        <span className="text-[11px] font-medium uppercase hidden md:block">
          {userProfile?.full_name || user.email?.split('@')[0] || 'User'}
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[1999]" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-1 w-64 bg-background border border-foreground rounded-lg shadow-lg z-[2001] overflow-hidden">
            {/* User Info Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#ff6bff] flex items-center justify-center">
                  <User className="w-5 h-5 text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {userProfile?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={handleSettings}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              
              <div className="border-t border-border my-2"></div>
              
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
