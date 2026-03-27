import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'admin' | 'user' | 'organizer';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  const fetchRole = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    if (data) {
      setRole(data.role as AppRole);
    }
    return data?.role as AppRole | null;
  };

  const fetchOnboardingStatus = async (userId: string) => {
    const { data } = await supabase
      .from('user_preferences')
      .select('onboarding_completed')
      .eq('user_id', userId)
      .single();
    
    setOnboardingCompleted(data?.onboarding_completed ?? null);
    return data?.onboarding_completed ?? null;
  };

  const ensureRole = async (userId: string, metadata: Record<string, any>) => {
    const existingRole = await fetchRole(userId);
    if (existingRole) return existingRole;
    
    // Fallback: insert role from metadata
    const desiredRole = (metadata?.role as AppRole) || 'user';
    await supabase.from('user_roles').insert({ user_id: userId, role: desiredRole });
    setRole(desiredRole);
    
    if (desiredRole === 'user') {
      await supabase.from('user_preferences').insert({ user_id: userId });
      setOnboardingCompleted(false);
    }
    
    return desiredRole;
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const r = await ensureRole(session.user.id, session.user.user_metadata);
        if (r === 'user') {
          await fetchOnboardingStatus(session.user.id);
        }
      }
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const r = await ensureRole(session.user.id, session.user.user_metadata);
        if (r === 'user') {
          await fetchOnboardingStatus(session.user.id);
        }
      } else {
        setUser(null);
        setRole(null);
        setOnboardingCompleted(null);
      }
    });

    init();
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, role, loading, onboardingCompleted, signOut, fetchOnboardingStatus };
};
