import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';
import { AuthSheet } from './AuthSheet';
import { RoleSwitcher } from './RoleSwitcher';
import { AccountDetails } from './AccountDetails';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { toast } from 'sonner';

export const Navbar: React.FC = () => {
  const { user, roles, signOut, setActiveRole, canSwitchRole, role } = useAuthWithBackend();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = () => {
    const links: { label: string; to?: string; onClick?: () => void }[] = [];
    const isOnDiscoverPage = location.pathname === '/discover';

    if (user) {
      // Role-based navigation (excluding signout and settings)
      if ((role === 'user' || !role) && !isOnDiscoverPage) {
        links.push({ label: 'Discover Events', to: '/discover' });
      }

      if (roles.includes('admin')) {
        links.push({ label: 'Admin', to: '/admin-dashboard' });
      }
    } else {
      if (!isOnDiscoverPage) {
        links.push({ label: 'Discover Events', to: '/discover' });
      }
      links.push({ label: 'Sign In', onClick: () => setIsAuthOpen(true) });
    }
    return links;
  };

  const handleCreateEvent = async () => {
    try {
      // Set organizer role first, then navigate to organizer page
      await setActiveRole('organizer');
      navigate('/organizer');
    } catch (error) {
      console.error('Failed to switch to organizer role:', error);
      toast.error('Failed to access organizer dashboard');
    }
  };

  const shouldShowCreateEventButton = () => {
    const isOnOrganizerDashboard = location.pathname === '/organizer';
    const isOnDiscoverPage = location.pathname === '/discover';
    
    // Show Create Event on Discover page for organizers/admins
    if (isOnDiscoverPage && user && (role === 'organizer' || roles.includes('organizer') || roles.includes('admin'))) {
      return true;
    }
    
    // Show Discover Events on Organizer dashboard
    if (isOnOrganizerDashboard && user) {
      return false; // Will show Discover Events button instead
    }
    
    return false;
  };

  const shouldShowDiscoverEventsButton = () => {
    const isOnOrganizerDashboard = location.pathname === '/organizer';
    
    // Show Discover Events on Organizer dashboard
    return isOnOrganizerDashboard && user;
  };

  const links = navLinks();

  return createPortal(
    <>
      {/* Site Name - with safe area for iPhone notch */}
      <div className="fixed top-[max(1rem,env(safe-area-inset-top))] left-4 md:left-8 z-[2000]">
        <Link to="/" className="text-2xl font-bold text-foreground hover:shadow-lg transition-all">
          EventsRadius
        </Link>
      </div>

      <nav className="fixed top-[max(3rem,env(safe-area-inset-top)+2rem)] right-[max(1rem,env(safe-area-inset-right))] md:right-8 z-[2000] flex items-center gap-1">
        {/* Logo */}
        <Link to="/" className="bg-foreground text-primary-foreground h-[34px] w-[34px] border border-foreground flex items-center justify-center">
          <Zap className="w-4 h-4" />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center">
          {user && canSwitchRole && <RoleSwitcher />}
          {/* Account Details - Show early in nav */}
          {user && <AccountDetails />}
          <ThemeToggle />
          {links.map((link, i) => (
            link.to ? (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => {
                  if (!canSwitchRole) return;
                  if (link.to === '/discover') void setActiveRole('user');
                  if (link.to === '/organizer') void setActiveRole('organizer');
                }}
                className="relative overflow-hidden bg-background text-foreground h-[34px] px-3 flex items-center text-[11px] font-medium uppercase border border-l-0 border-foreground leading-none group"
              >
                <span className="relative z-10">{link.label}</span>
                <span className="absolute inset-0 bg-[hsl(295,100%,73%)] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </Link>
            ) : (
              <button key={link.label} onClick={link.onClick}
                className="relative overflow-hidden bg-background text-foreground h-[34px] px-3 flex items-center text-[11px] font-medium uppercase border border-l-0 border-foreground leading-none group">
                <span className="relative z-10">{link.label}</span>
                <span className="absolute inset-0 bg-[hsl(295,100%,73%)] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </button>
            )
          ))}
          {/* Discover Events Button - Show on Organizer Dashboard */}
          {shouldShowDiscoverEventsButton() && (
            <button
              onClick={() => navigate('/discover')}
              className="relative overflow-hidden bg-blue-500 text-white h-[34px] px-3 flex items-center text-[11px] font-medium uppercase border border-l-0 border-blue-500 leading-none group"
            >
              <span className="relative z-10">Discover Events</span>
              <span className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </button>
          )}
          {/* Create Event Button - Show on Discover Page */}
          {shouldShowCreateEventButton() && (
            <button
              onClick={handleCreateEvent}
              className="relative overflow-hidden bg-green-500 text-white h-[34px] px-3 flex items-center text-[11px] font-medium uppercase border border-l-0 border-green-500 leading-none group"
            >
              <span className="relative z-10">Create Event</span>
              <span className="absolute inset-0 bg-green-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden relative overflow-hidden bg-background text-foreground h-[34px] px-3 border border-l-0 border-foreground flex items-center text-[11px] font-medium uppercase leading-none group">
          <span className="relative z-10">MENU</span>
          <span className="absolute inset-0 bg-[hsl(295,100%,73%)] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        </button>
      </nav>

      {/* Mobile Full Screen Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[3000] flex flex-col animate-in slide-in-from-top duration-300">
          <div className="bg-gray-900 flex items-center justify-center py-16">
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-white text-[11px] font-medium uppercase tracking-wider hover:text-red-400 transition-colors">
              CLOSE
            </button>
          </div>
          <div className="flex-1 flex flex-col bg-background">
            <div className="flex justify-center py-6 border-b border-border">
              <ThemeToggle />
            </div>
            {user && canSwitchRole && (
              <div className="flex justify-center py-6 border-b border-border">
                <RoleSwitcher />
              </div>
            )}
            {links.map(link => (
              link.to ? (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (canSwitchRole && link.to === '/discover') void setActiveRole('user');
                    if (canSwitchRole && link.to === '/organizer') void setActiveRole('organizer');
                  }}
                  className="flex-1 flex items-center justify-center text-[17px] font-medium uppercase border-b border-border tracking-[-0.34px]"
                >
                  {link.label}
                </Link>
              ) : (
                <button key={link.label} onClick={() => { 
                  link.onClick?.(); 
                  setIsMobileMenuOpen(false);
                }}
                  className="flex-1 flex items-center justify-center text-foreground text-[17px] font-medium uppercase border-b border-border tracking-[-0.34px]"
                >
                  {link.label}
                </button>
              )
            ))}
            {/* Logout button for mobile menu */}
            {user && (
              <button
                onClick={() => {
                  signOut();
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 flex items-center justify-center text-red-500 text-[17px] font-medium uppercase border-b border-border tracking-[-0.34px]"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}

      <AuthSheet isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>,
    document.body
  );
};
