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

    if (user) {
      // Role-based navigation (excluding signout and settings)
      if (role === 'user' || !role) {
        links.push({ label: 'Discover Events', to: '/discover' });
      }

      if (roles.includes('admin')) {
        links.push({ label: 'Admin', to: '/admin-dashboard' });
      }
    } else {
      links.push({ label: 'Discover Events', to: '/discover' });
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
      {/* Modern Glassmorphism Navbar */}
      <div className="fixed top-0 left-0 right-0 z-[2000] px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center justify-between bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl px-6 py-3 shadow-lg shadow-black/5">
            {/* Site Name / Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                EventRadius
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {user && canSwitchRole && <RoleSwitcher />}
              
              <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
                {links.map((link) => (
                  link.to ? (
                    <Link
                      key={link.label}
                      to={link.to}
                      onClick={() => {
                        if (!canSwitchRole) return;
                        if (link.to === '/discover') void setActiveRole('user');
                        if (link.to === '/organizer') void setActiveRole('organizer');
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background transition-all duration-200"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <button 
                      key={link.label} 
                      onClick={link.onClick}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background transition-all duration-200"
                    >
                      {link.label}
                    </button>
                  )
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {shouldShowDiscoverEventsButton() && (
                  <button
                    onClick={() => navigate('/discover')}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                  >
                    Discover Events
                  </button>
                )}
                {shouldShowCreateEventButton() && (
                  <button
                    onClick={handleCreateEvent}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200"
                  >
                    Create Event
                  </button>
                )}
              </div>

              <div className="h-6 w-px bg-border mx-2" />
              
              <ThemeToggle />
              
              {user && <AccountDetails />}

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </nav>
        </div>
      </div>

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
