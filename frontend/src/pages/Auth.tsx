import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/SEOHead';
import { getErrorMessage } from '@/lib/utils';
import { Chrome } from 'lucide-react';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/discover');
      }
    });
  }, [navigate]);

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Signed in with Google successfully!',
      });

      // Redirect to discover page after successful sign in
      navigate('/discover');
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <SEOHead
        title="Sign In with Google"
        description="Sign in to manage your events and registrations"
      />
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="text-4xl font-normal text-[#1A1A1A] tracking-[-0.02em]">
            Sign In with Google
          </h2>
          <p className="mt-2 text-sm text-[#1A1A1A] opacity-50">
            Sign in to manage your events and registrations
          </p>
        </div>

        <Button
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full bg-[#1A1A1A] text-white hover:bg-opacity-90 flex items-center justify-center gap-2 py-3"
        >
          <Chrome className="w-5 h-5" />
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </Button>
      </div>
    </div>
  );
};

export default Auth;
