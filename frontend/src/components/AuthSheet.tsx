import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Users, Megaphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/utils';

interface AuthSheetProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'user' | 'organizer';
}

export const AuthSheet: React.FC<AuthSheetProps> = ({ isOpen, onClose, defaultRole = 'user' }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'user' | 'organizer'>(defaultRole);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setSelectedRole(defaultRole);
  }, [defaultRole]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role: selectedRole },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        toast({
          title: 'Account created!',
          description: 'Please check your email to verify your account.',
        });
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: 'Welcome back!', description: 'Signed in successfully.' });
        onClose();
      }
    } catch (error: unknown) {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black opacity-50 z-[1000]" onClick={onClose} />
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-[hsl(0,0%,10%)] z-[1001] shadow-2xl transition-transform duration-300 ${isOpen ? 'animate-slide-in-right' : ''}`}>
        <button onClick={onClose} className="absolute top-8 right-8 text-white hover:text-gray-300 transition-colors">
          <X size={24} />
        </button>

        <div className="flex flex-col h-full px-10 pt-24 pb-10 overflow-y-auto">
          <h2 className="text-white text-4xl font-medium mb-2">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>
          <p className="text-gray-400 text-sm mb-8">
            {isSignUp ? 'Join Event radius to discover or post events' : 'Welcome back!'}
          </p>

          {/* Role selection (signup only) */}
          {isSignUp && (
            <div className="mb-6">
              <label className="block text-white text-xs font-medium mb-3 uppercase tracking-wide">
                I want to...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('user')}
                  className={`flex flex-col items-center gap-2 py-4 px-3 border transition-colors ${
                    selectedRole === 'user'
                      ? 'border-[hsl(295,100%,73%)] bg-[hsl(295,100%,73%)]/10 text-[hsl(295,100%,73%)]'
                      : 'border-white/20 text-white/60 hover:border-white/40'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="text-xs font-medium uppercase">Discover Events</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('organizer')}
                  className={`flex flex-col items-center gap-2 py-4 px-3 border transition-colors ${
                    selectedRole === 'organizer'
                      ? 'border-[hsl(295,100%,73%)] bg-[hsl(295,100%,73%)]/10 text-[hsl(295,100%,73%)]'
                      : 'border-white/20 text-white/60 hover:border-white/40'
                  }`}
                >
                  <Megaphone className="w-5 h-5" />
                  <span className="text-xs font-medium uppercase">Post Events</span>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleAuth} className="flex flex-col gap-5">
            <div>
              <label className="block text-white text-xs font-medium mb-2 uppercase tracking-wide">Email</label>
              <input id="auth-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-white/10 border border-white/20 text-white px-4 py-3 focus:outline-none focus:border-[hsl(295,100%,73%)] transition-colors"
                placeholder="your@email.com" />
            </div>
            <div>
              <label className="block text-white text-xs font-medium mb-2 uppercase tracking-wide">Password</label>
              <input id="auth-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                className="w-full bg-white/10 border border-white/20 text-white px-4 py-3 focus:outline-none focus:border-[hsl(295,100%,73%)] transition-colors"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[hsl(295,100%,73%)] text-black font-medium py-3 px-6 uppercase text-sm hover:bg-[hsl(295,100%,78%)] transition-colors disabled:opacity-50">
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-gray-400 hover:text-white transition-colors text-sm">
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};
