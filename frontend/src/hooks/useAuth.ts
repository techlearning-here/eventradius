import { useState, useEffect, useCallback, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'user' | 'organizer';

const ACTIVE_ROLE_KEY = 'eventradius_active_role';

function pickEffectiveRole(
  list: AppRole[],
  activeUi: 'user' | 'organizer' | null
): AppRole | null {
  if (list.includes('admin')) return 'admin';
  const uo = list.filter((r): r is 'user' | 'organizer' => r === 'user' || r === 'organizer');
  if (uo.length === 0) return null;
  if (uo.length === 1) return uo[0];
  if (activeUi && uo.includes(activeUi)) return activeUi;
  const stored = localStorage.getItem(ACTIVE_ROLE_KEY) as 'user' | 'organizer' | null;
  if (stored && uo.includes(stored)) return stored;
  return 'user';
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [activeRoleUi, setActiveRoleUi] = useState<'user' | 'organizer' | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  const fetchOnboardingStatus = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('user_preferences')
      .select('onboarding_completed')
      .eq('user_id', userId)
      .maybeSingle();

    setOnboardingCompleted(data?.onboarding_completed ?? null);
    return data?.onboarding_completed ?? null;
  }, []);

  const fetchRoles = useCallback(async (userId: string): Promise<AppRole[]> => {
    const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', userId);
    if (error || !data) {
      setRoles([]);
      return [];
    }
    const list = data.map((r) => r.role as AppRole);
    setRoles(list);
    return list;
  }, []);

  const ensureUserPreferencesRow = useCallback(async (userId: string) => {
    const { data: existing } = await supabase
      .from('user_preferences')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
    if (!existing) {
      await supabase.from('user_preferences').insert({ user_id: userId });
      setOnboardingCompleted(false);
    }
  }, []);

  const syncActiveUiFromRoles = useCallback((list: AppRole[]) => {
    if (list.includes('admin')) {
      setActiveRoleUi(null);
      return;
    }
    const uo = list.filter((r): r is 'user' | 'organizer' => r === 'user' || r === 'organizer');
    if (uo.length === 0) {
      setActiveRoleUi(null);
      return;
    }
    if (uo.length === 1) {
      setActiveRoleUi(uo[0]);
      return;
    }
    const stored = localStorage.getItem(ACTIVE_ROLE_KEY) as 'user' | 'organizer' | null;
    setActiveRoleUi(stored && uo.includes(stored) ? stored : 'user');
  }, []);

  const seedFirstRole = useCallback(
    async (userId: string, metadata: User['user_metadata']) => {
      const desiredRole = (metadata?.role as AppRole) || 'user';
      const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: desiredRole });
      if (error) {
        if (error.code !== '23505') return;
        await fetchRoles(userId);
        return;
      }
      setRoles([desiredRole]);
      if (desiredRole === 'user' || desiredRole === 'organizer') setActiveRoleUi(desiredRole);
      if (desiredRole === 'user') {
        await supabase.from('user_preferences').insert({ user_id: userId });
        setOnboardingCompleted(false);
      }
    },
    [fetchRoles]
  );

  const loadSession = useCallback(
    async (sessionUser: User) => {
      setUser(sessionUser);
      let list = await fetchRoles(sessionUser.id);
      if (list.length === 0) {
        await seedFirstRole(sessionUser, sessionUser.user_metadata);
        list = await fetchRoles(sessionUser.id);
      }
      syncActiveUiFromRoles(list);
      if (list.includes('user')) await fetchOnboardingStatus(sessionUser.id);
    },
    [fetchRoles, seedFirstRole, syncActiveUiFromRoles, fetchOnboardingStatus]
  );

  const setActiveRole = useCallback(
    async (r: 'user' | 'organizer') => {
      if (!roles.includes(r)) return;
      localStorage.setItem(ACTIVE_ROLE_KEY, r);
      setActiveRoleUi(r);
      if (r === 'user' && user) {
        await ensureUserPreferencesRow(user.id);
        await fetchOnboardingStatus(user.id);
      }
    },
    [roles, user, ensureUserPreferencesRow, fetchOnboardingStatus]
  );

  const addOrganizerRole = useCallback(async () => {
    if (!user || roles.includes('organizer')) return { error: null as Error | null };
    const { error } = await supabase.from('user_roles').insert({ user_id: user.id, role: 'organizer' });
    if (error) return { error };
    const next = await fetchRoles(user.id);
    syncActiveUiFromRoles(next);
    localStorage.setItem(ACTIVE_ROLE_KEY, 'organizer');
    setActiveRoleUi('organizer');
    return { error: null };
  }, [user, roles, fetchRoles, syncActiveUiFromRoles]);

  const addUserRole = useCallback(async () => {
    if (!user || roles.includes('user')) return { error: null as Error | null };
    const { error } = await supabase.from('user_roles').insert({ user_id: user.id, role: 'user' });
    if (error) return { error };
    await ensureUserPreferencesRow(user.id);
    const next = await fetchRoles(user.id);
    syncActiveUiFromRoles(next);
    localStorage.setItem(ACTIVE_ROLE_KEY, 'user');
    setActiveRoleUi('user');
    await fetchOnboardingStatus(user.id);
    return { error: null };
  }, [user, roles, fetchRoles, syncActiveUiFromRoles, ensureUserPreferencesRow, fetchOnboardingStatus]);

  const role = useMemo(
    () => pickEffectiveRole(roles, activeRoleUi),
    [roles, activeRoleUi]
  );

  const canSwitchRole = useMemo(
    () => roles.includes('user') && roles.includes('organizer') && !roles.includes('admin'),
    [roles]
  );

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) await loadSession(session.user);
      setLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadSession(session.user);
      } else {
        setUser(null);
        setRoles([]);
        setActiveRoleUi(null);
        setOnboardingCompleted(null);
      }
    });

    init();
    return () => subscription.unsubscribe();
  }, [loadSession]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    role,
    roles,
    loading,
    onboardingCompleted,
    signOut,
    fetchOnboardingStatus,
    setActiveRole,
    canSwitchRole,
    addOrganizerRole,
    addUserRole,
    hasOrganizerRole: roles.includes('organizer'),
    hasUserRole: roles.includes('user'),
  };
};
