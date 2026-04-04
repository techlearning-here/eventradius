import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  
  // Flag to prevent race conditions during initialization
  const [isInitialized, setIsInitialized] = useState(false);
  const isInitializingRef = useRef(false);

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
      console.log('🔍 Setting onboardingCompleted to:', completed);

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
      console.log('🔍 Setting onboardingCompleted to null due to error');
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
      // Prevent race conditions during initialization
      if (isInitialized) {
        console.log('🔍 Skipping loadSession - already initializing');
        return;
      }
      
      // Store user state to localStorage for persistence
      localStorage.setItem('supabase.auth.user', JSON.stringify(sessionUser));
      localStorage.setItem('supabase.auth.token', JSON.stringify(sessionUser));
      
      console.log('🔍 Setting user state:', sessionUser?.email || 'null');
      setUser(sessionUser);
      setIsInitialized(true);
      try {
        let list = await fetchRoles(sessionUser.id);
        if (list.length === 0) {
          await seedFirstRole(sessionUser.id, sessionUser.user_metadata);
          list = await fetchRoles(sessionUser.id);
        }
        syncActiveUiFromRoles(list);
        
        // Don't let profile fetch failure break the session
        try {
          await fetchUserProfile(sessionUser.id);
        } catch (profileError) {
          console.error('Error fetching profile (continuing):', profileError);
        }
        
        if (list.includes('user') || list.includes('organizer')) {
          try {
            await ensureUserPreferencesRow(sessionUser.id);
            await fetchOnboardingStatus(sessionUser.id);
          } catch (prefError) {
            console.error('Error fetching preferences (continuing):', prefError);
          }
        }
      } catch (error) {
        console.error('Error loading session:', error);
        console.log('🔍 Session load error, keeping user state:', sessionUser?.email || 'null');
        console.log('🔍 Error details:', error);
        // Don't reset user state on session load error, just log it
        setRoles([]);
        setActiveRoleUi(null);
        console.log('🔍 Setting onboardingCompleted to null - session load error');
        setOnboardingCompleted(null);
        setUserProfile(null);
        navigate('/');
      }
    },
    [fetchRoles, seedFirstRole, syncActiveUiFromRoles, fetchUserProfile, ensureUserPreferencesRow, fetchOnboardingStatus, isInitialized]
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

  const hasOrganizerRole = useMemo(
    () => roles.includes('organizer'),
    [roles]
  );

  // Debug: Log user state changes
  useEffect(() => {
    console.log('🔍 Current user state:', user?.email || 'null', 'Loading:', loading);
  }, [user, loading]);

  const hasUserRole = useMemo(
    () => roles.includes('user'),
    [roles]
  );

  const canSwitchRole = useMemo(
    () => roles.includes('user') && roles.includes('organizer') && !roles.includes('admin'),
    [roles]
  );

  useEffect(() => {
    // Prevent multiple useEffect runs
    if (isInitializingRef.current) {
      console.log('🔍 Skipping useEffect - already initializing');
      return;
    }
    
    isInitializingRef.current = true;
    
    const init = async () => {
      // First try to restore from localStorage
      const storedUser = localStorage.getItem('supabase.auth.user');
      const storedToken = localStorage.getItem('supabase.auth.token');
      
      if (storedUser && storedToken) {
        console.log('🔍 Restoring user from localStorage');
        const parsedUser = JSON.parse(storedUser);
        console.log('🔍 Parsed user from localStorage:', parsedUser?.email || 'null');
        await loadSession(parsedUser);
      } else {
        // Fallback to Supabase session
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) await loadSession(session.user);
      }
      
      // Set initialization flag after session is loaded
      setIsInitialized(true);
      setLoading(false);
      isInitializingRef.current = false;
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadSession(session.user);
      } else {
        // User signed out or session expired - clear localStorage and redirect to landing page
        console.log('🔍 Clearing user state - signing out');
        localStorage.removeItem('supabase.auth.user');
        localStorage.removeItem('supabase.auth.token');
        setUser(null);
        console.log('🔍 Setting onboardingCompleted to null - sign out');
        setOnboardingCompleted(null);
        setRoles([]);
        setActiveRoleUi(null);
        setUserProfile(null);
        navigate('/');
      }
    });

    init();
    return () => subscription.unsubscribe();
  }, []); // Empty dependency array - run only once

  const signOut = async () => {
    console.log('🔍 Initiating sign out process');
    
    try {
      // Call Supabase signOut
      await supabase.auth.signOut();
      console.log('🔍 Supabase signOut completed');
      
      // Manually clear all auth state immediately
      setUser(null);
      setRoles([]);
      setActiveRoleUi(null);
      setOnboardingCompleted(null);
      setUserProfile(null);
      setIsInitialized(false);
      isInitializingRef.current = false;
      
      // Clear localStorage
      localStorage.removeItem('supabase.auth.user');
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem(ACTIVE_ROLE_KEY);
      
      console.log('🔍 Manual state clearing completed');
      
      // Redirect after a short delay to ensure state is cleared
      setTimeout(() => {
        navigate('/');
      }, 100);
      
    } catch (error) {
      console.error('🔍 Error during sign out:', error);
      // Even if Supabase signOut fails, still clear local state
      setUser(null);
      setRoles([]);
      setActiveRoleUi(null);
      setOnboardingCompleted(null);
      setUserProfile(null);
      setIsInitialized(false);
      isInitializingRef.current = false;
      
      // Clear localStorage
      localStorage.removeItem('supabase.auth.user');
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem(ACTIVE_ROLE_KEY);
      
      console.log('🔍 Manual state clearing completed (error fallback)');
      
      setTimeout(() => {
        navigate('/');
      }, 100);
    }
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
