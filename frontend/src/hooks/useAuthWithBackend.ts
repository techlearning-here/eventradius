import { useState, useEffect, useCallback, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { apiClient, type UserProfile } from '@/integrations/backend/api';

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

export const useAuthWithBackend = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [activeRoleUi, setActiveRoleUi] = useState<'user' | 'organizer' | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const fetchOnboardingStatus = useCallback(async (userId: string) => {
    try {
      console.log('🔍 Fetching onboarding status for user:', userId);
      const preferences = await apiClient.getUserPreferences();
      console.log('🔍 Raw preferences from API:', preferences);
      console.log('🔍 Available keys in preferences:', Object.keys(preferences || {}));
      
      const completed = (preferences?.onboarding_completed as boolean | null) ?? null;
      const isOrganizer = (preferences?.is_organizer as boolean | null) ?? null;
      
      console.log('🔍 onboarding_completed value:', completed);
      console.log('🔍 is_organizer value:', isOrganizer);
      
      setOnboardingCompleted(completed);

      // If organizer preference is set, update roles accordingly
      if (isOrganizer === true && !roles.includes('organizer')) {
        console.log('🔍 Adding organizer role based on preference');
        await addOrganizerRole();
      } else if (isOrganizer === false && !roles.includes('user')) {
        console.log('🔍 Adding user role based on preference');
        await addUserRole();
      }

      return completed;
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
      setOnboardingCompleted(null);
      return null;
    }
  }, []);

  const fetchRoles = useCallback(async (userId: string): Promise<AppRole[]> => {
    try {
      const response = await apiClient.getUserRoles();
      const roles = response.roles as AppRole[];
      setRoles(roles);
      return roles;
    } catch (error) {
      console.error('Error fetching roles:', error);
      setRoles([]);
      return [];
    }
  }, []);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const profile = await apiClient.getCurrentUserProfile();
      setUserProfile(profile);
      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
      return null;
    }
  }, []);

  const ensureUserPreferencesRow = useCallback(async (userId: string) => {
    try {
      const preferences = await apiClient.getUserPreferences();
      if (!preferences || Object.keys(preferences).length === 0) {
        await apiClient.updateUserPreferences({});
        setOnboardingCompleted(false);
      }
    } catch (error) {
      console.error('Error ensuring user preferences row:', error);
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
      try {
        const desiredRole = (metadata?.role as AppRole) || 'user';
        await apiClient.addUserRole(desiredRole);
        setRoles([desiredRole]);
        if (desiredRole === 'user' || desiredRole === 'organizer') setActiveRoleUi(desiredRole);
        if (desiredRole === 'user') {
          await apiClient.updateUserPreferences({});
          setOnboardingCompleted(false);
        }
      } catch (error) {
        console.error('Error seeding first role:', error);
        // If role already exists, fetch roles
        await fetchRoles(userId);
      }
    },
    [fetchRoles]
  );

  const loadSession = useCallback(
    async (sessionUser: User) => {
      setUser(sessionUser);
      try {
        let list = await fetchRoles(sessionUser.id);
        if (list.length === 0) {
          await seedFirstRole(sessionUser.id, sessionUser.user_metadata);
          list = await fetchRoles(sessionUser.id);
        }
        syncActiveUiFromRoles(list);
        await fetchUserProfile(sessionUser.id);
        if (list.includes('user') || list.includes('organizer')) {
          await ensureUserPreferencesRow(sessionUser.id);
          await fetchOnboardingStatus(sessionUser.id);
        }
      } catch (error) {
        console.error('Error loading session:', error);
        // Don't crash the app, just set default values
        setRoles([]);
        setActiveRoleUi(null);
        setUserProfile(null);
        setOnboardingCompleted(null);
      }
    },
    [fetchRoles, seedFirstRole, syncActiveUiFromRoles, fetchUserProfile, ensureUserPreferencesRow, fetchOnboardingStatus]
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
    try {
      await apiClient.addUserRole('organizer');
      const next = await fetchRoles(user.id);
      syncActiveUiFromRoles(next);
      localStorage.setItem(ACTIVE_ROLE_KEY, 'organizer');
      setActiveRoleUi('organizer');
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }, [user, roles, fetchRoles, syncActiveUiFromRoles]);

  const addUserRole = useCallback(async () => {
    if (!user || roles.includes('user')) return { error: null as Error | null };
    try {
      await apiClient.addUserRole('user');
      await ensureUserPreferencesRow(user.id);
      const next = await fetchRoles(user.id);
      syncActiveUiFromRoles(next);
      localStorage.setItem(ACTIVE_ROLE_KEY, 'user');
      setActiveRoleUi('user');
      await fetchOnboardingStatus(user.id);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }, [user, roles, fetchRoles, syncActiveUiFromRoles, ensureUserPreferencesRow, fetchOnboardingStatus]);

  const updateUserProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    if (!user) return { error: new Error('User not authenticated') };
    try {
      const updatedProfile = await apiClient.updateUserProfile(profileData);
      setUserProfile(updatedProfile);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }, [user]);

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
        // User signed out or session expired - redirect to landing page
        setUser(null);
        setRoles([]);
        setActiveRoleUi(null);
        setOnboardingCompleted(null);
        setUserProfile(null);
        navigate('/');
      }
    });

    init();
    return () => subscription.unsubscribe();
  }, [loadSession, navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    // The onAuthStateChange listener will handle the redirect
  };

  return {
    user,
    role,
    roles,
    loading,
    onboardingCompleted,
    userProfile,
    signOut,
    fetchOnboardingStatus,
    setActiveRole,
    canSwitchRole,
    addOrganizerRole,
    addUserRole,
    updateUserProfile,
    hasOrganizerRole: roles.includes('organizer'),
    hasUserRole: roles.includes('user'),
  };
};
