import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthSheet } from './AuthSheet';

export const Navbar: React.FC = () => {
  const { user, role, signOut } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = () => {
    const links: { label: string; to?: string; onClick?: () => void }[] = [
      { label: 'Discover', to: '/discover' },
    ];

    if (user) {
      if (role === 'organizer') {
        links.push({ label: 'Dashboard', to: '/organizer' });
      }
      if (role === 'user') {
        links.push({ label: 'Settings', to: '/settings' });
      }
      if (role === 'admin') {
        links.push({ label: 'Admin', to: '/admin-dashboard' });
      }
      links.push({ label: 'Sign Out', onClick: signOut });
    } else {
      links.push({ label: 'Sign In', onClick: () => setIsAuthOpen(true) });
    }
    return links;
  };

  const links = navLinks();

  return createPortal(
    <>
      <nav className="fixed top-8 left-4 md:left-8 z-[2000] flex items-center gap-0">
        {/* Logo */}
        <Link to="/" className="bg-foreground text-primary-foreground h-[34px] w-[34px] border border-foreground flex items-center justify-center">
          <Zap className="w-4 h-4" />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center">
          {links.map((link, i) => (
            link.to ? (
              <Link key={link.label} to={link.to}
                className="relative overflow-hidden bg-background text-foreground h-[34px] px-3 flex items-center text-[11px] font-medium uppercase border border-l-0 border-foreground leading-none group">
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
          <div className="bg-foreground flex items-center justify-center py-16">
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-primary-foreground text-[11px] font-medium uppercase tracking-wider">
              CLOSE
            </button>
          </div>
          <div className="flex-1 flex flex-col bg-background">
            {links.map(link => (
              link.to ? (
                <Link key={link.label} to={link.to} onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center text-foreground text-[17px] font-medium uppercase border-b border-border tracking-[-0.34px]">
                  {link.label}
                </Link>
              ) : (
                <button key={link.label} onClick={() => { link.onClick?.(); setIsMobileMenuOpen(false); }}
                  className="flex-1 flex items-center justify-center text-foreground text-[17px] font-medium uppercase border-b border-border tracking-[-0.34px]">
                  {link.label}
                </button>
              )
            ))}
          </div>
        </div>
      )}

      <AuthSheet isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>,
    document.body
  );
};
