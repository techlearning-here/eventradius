import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Chrome } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/utils';
import { signInWithGoogle } from '@/lib/auth';

interface AuthSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthSheet: React.FC<AuthSheetProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      // The redirect will handle the rest, so we don't need to close the sheet here
    } catch (error: unknown) {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000]" onClick={onClose} />
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-background z-[1001] shadow-2xl border-l border-border transition-transform duration-300 ${isOpen ? 'animate-slide-in-right' : ''}`}>
        <button onClick={onClose} className="absolute top-8 right-8 text-foreground hover:text-muted-foreground transition-colors p-2 rounded-lg hover:bg-accent">
          <X size={24} />
        </button>

        <div className="flex flex-col h-full px-10 pt-24 pb-10 overflow-y-auto">
          <h2 className="text-foreground text-4xl font-medium mb-2">
            Sign In with Google
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            Join Events Radius to discover or post events
          </p>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white text-gray-900 font-medium py-3 px-6 uppercase text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 rounded-lg border border-gray-200 shadow-sm"
          >
            <Chrome className="w-5 h-5 text-blue-500" />
            {loading ? 'Please wait...' : 'Continue with Google'}
          </button>
        </div>
      </div>
    </>,
    document.body
  );
};
