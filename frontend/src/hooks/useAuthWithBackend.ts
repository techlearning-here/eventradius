import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { apiClient, type UserProfile } from '@/integrations/backend/api';

export type AppRole = 'admin' | 'user' | 'organizer';

const ACTIVE_ROLE_KEY = 'eventradius_active_role';
const USER_SETTINGS_KEY = 'eventradius_user_settings';

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

// Module-level cache to persist across React StrictMode remounts
const globalRequestPromises = new Map<string, Promise<unknown>>();
const globalRequestResults = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5000; // 5 second cache

// Helper to get initial user settings from localStorage
const getStoredUserSettings = () => {
  try {
    const stored = localStorage.getItem(USER_SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored) as {
        roles: AppRole[];
        onboardingCompleted: boolean | null;
        userProfile: UserProfile | null;
        timestamp: number;
      };
    }
  } catch {
    // Ignore parse errors
  }
  return null;
};

// Helper to save user settings to localStorage
const saveUserSettings = (settings: {
  roles: AppRole[];
  onboardingCompleted: boolean | null;
  userProfile: UserProfile | null;
}) => {
  localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify({
    ...settings,
    timestamp: Date.now()
  }));
};

export const useAuthWithBackend = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  
  // Initialize from localStorage to avoid flicker on refresh
  const storedSettings = getStoredUserSettings();
  const [roles, setRoles] = useState<AppRole[]>(storedSettings?.roles ?? []);
  const [activeRoleUi, setActiveRoleUi] = useState<'user' | 'organizer' | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(storedSettings?.onboardingCompleted ?? null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(storedSettings?.userProfile ?? null);
  
  // Flag to prevent race conditions during initialization
  const [isInitialized, setIsInitialized] = useState(false);
  const isInitializingRef = useRef(false);

  const fetchOnboardingStatus = useCallback(async (userId: string) => {
    const cacheKey = `userPreferences-${userId}`;
    
    const cached = globalRequestResults.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      const preferences = cached.data;
      const completed = (preferences?.onboarding_completed as boolean | null) ?? null;
      const isOrganizer = (preferences?.is_organizer as boolean | null) ?? null;
      setOnboardingCompleted(completed);
      if (isOrganizer === true && !roles.includes('organizer')) {
        await addOrganizerRole();
      } else if (isOrganizer === false && !roles.includes('user')) {
        await addUserRole();
      }
      return completed;
    }
    
    if (globalRequestPromises.has(cacheKey)) {
      const result = await globalRequestPromises.get(cacheKey)!;
      return result;
    }
    
    const promise = (async () => {
      try {
        const preferences = await apiClient.getUserPreferences();
        const completed = (preferences?.onboarding_completed as boolean | null) ?? null;
        const isOrganizer = (preferences?.is_organizer as boolean | null) ?? null;
        setOnboardingCompleted(completed);
        globalRequestResults.set(cacheKey, { data: preferences, timestamp: Date.now() });

        // If organizer preference is set, update roles accordingly
        if (isOrganizer === true && !roles.includes('organizer')) {
          await addOrganizerRole();
        } else if (isOrganizer === false && !roles.includes('user')) {
          await addUserRole();
        }
        return completed;
      } catch (error) {
        console.error('Error fetching onboarding status:', error);
        setOnboardingCompleted(null);
        return null;
      } finally {
        globalRequestPromises.delete(cacheKey);
      }
    })();
    
    globalRequestPromises.set(cacheKey, promise);
    return promise;
  }, [roles]);

  const fetchRoles = useCallback(async (userId: string): Promise<AppRole[]> => {
    const cacheKey = `fetchRoles-${userId}`;
    
    // Check if we have a recent cached result
    const cached = globalRequestResults.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setRoles(cached.data);
      return cached.data;
    }
    
    // If already in progress, return the existing promise
    if (globalRequestPromises.has(cacheKey)) {
      const result = await globalRequestPromises.get(cacheKey)!;
      return result;
    }
    
    // Create the promise
    const promise = (async () => {
      try {
        const response = await apiClient.getUserRoles();
        const roles = response.roles as AppRole[];
        setRoles(roles);
        globalRequestResults.set(cacheKey, { data: roles, timestamp: Date.now() });
        return roles;
      } catch (error) {
        console.error('Error fetching roles:', error);
        setRoles([]);
        return [];
      } finally {
        globalRequestPromises.delete(cacheKey);
      }
    })();
    
    globalRequestPromises.set(cacheKey, promise);
    return promise;
  }, []);

  // Combined user data fetch - reduces API calls from 3 to 1
  const fetchCombinedUserData = useCallback(async (userId: string) => {
    const cacheKey = `userCombined-${userId}`;
    
    const cached = globalRequestResults.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      const data = cached.data as { profile: UserProfile; roles: string[]; preferences: { onboarding_completed?: boolean; is_organizer?: boolean } };
      const cachedRoles = data.roles as AppRole[];
      const cachedOnboarding = (data.preferences?.onboarding_completed as boolean | null | undefined) ?? null;
      
      setUserProfile(data.profile);
      setRoles(cachedRoles);
      setOnboardingCompleted(cachedOnboarding);
      
      // Also update localStorage when using cached data
      saveUserSettings({
        roles: cachedRoles,
        onboardingCompleted: cachedOnboarding,
        userProfile: data.profile
      });
      
      return data;
    }
    
    if (globalRequestPromises.has(cacheKey)) {
      const result = await globalRequestPromises.get(cacheKey)!;
      return result;
    }
    
    const promise = (async () => {
      try {
        const data = await apiClient.getCurrentUserCombined();
        const fetchedRoles = data.roles as AppRole[];
        const fetchedOnboarding = (data.preferences?.onboarding_completed as boolean | null | undefined) ?? null;
        
        setUserProfile(data.profile);
        setRoles(fetchedRoles);
        setOnboardingCompleted(fetchedOnboarding);
        
        // Persist to localStorage for instant access on refresh
        saveUserSettings({
          roles: fetchedRoles,
          onboardingCompleted: fetchedOnboarding,
          userProfile: data.profile
        });
        
        globalRequestResults.set(cacheKey, { data, timestamp: Date.now() });
        return data;
      } catch (error) {
        console.error('Error fetching combined user data:', error);
        throw error;
      } finally {
        globalRequestPromises.delete(cacheKey);
      }
    })();
    
    globalRequestPromises.set(cacheKey, promise);
    return promise;
  }, []);

  const fetchUserProfile = useCallback(async (userId: string) => {
    const cacheKey = `fetchUserProfile-${userId}`;
    
    const cached = globalRequestResults.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setUserProfile(cached.data);
      return cached.data;
    }
    
    if (globalRequestPromises.has(cacheKey)) {
      const result = await globalRequestPromises.get(cacheKey)!;
      return result;
    }
    
    const promise = (async () => {
      try {
        const profile = await apiClient.getCurrentUserProfile();
        setUserProfile(profile);
        globalRequestResults.set(cacheKey, { data: profile, timestamp: Date.now() });
        return profile;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUserProfile(null);
        return null;
      } finally {
        globalRequestPromises.delete(cacheKey);
      }
    })();
    
    globalRequestPromises.set(cacheKey, promise);
    return promise;
  }, []);

  const ensureUserPreferencesRow = useCallback(async (userId: string) => {
    const cacheKey = `userPreferences-${userId}`;
    
    const cached = globalRequestResults.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    
    if (globalRequestPromises.has(cacheKey)) {
      return globalRequestPromises.get(cacheKey)!;
    }
    
    const promise = (async () => {
      try {
        const preferences = await apiClient.getUserPreferences();
        globalRequestResults.set(cacheKey, { data: preferences, timestamp: Date.now() });
        if (!preferences || Object.keys(preferences).length === 0) {
          await apiClient.updateUserPreferences({});
          setOnboardingCompleted(false);
        }
        return preferences;
      } catch (error) {
        console.error('Error ensuring user preferences row:', error);
      } finally {
        globalRequestPromises.delete(cacheKey);
      }
    })();
    
    globalRequestPromises.set(cacheKey, promise);
    return promise;
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
        return;
      }
      
      // Store user state to localStorage for persistence
      localStorage.setItem('supabase.auth.user', JSON.stringify(sessionUser));
      localStorage.setItem('supabase.auth.token', JSON.stringify(sessionUser));
      setUser(sessionUser);
      setIsInitialized(true);
      try {
        // Use combined endpoint to fetch all user data in one call
        let list: AppRole[];
        try {
          const combinedData = await fetchCombinedUserData(sessionUser.id);
          list = combinedData.roles as AppRole[];
          syncActiveUiFromRoles(list);
        } catch (combinedError) {
          // Fallback to individual calls if combined fails
          console.warn('Combined fetch failed, using individual calls:', combinedError);
          list = await fetchRoles(sessionUser.id);
          if (list.length === 0) {
            await seedFirstRole(sessionUser.id, sessionUser.user_metadata);
            list = await fetchRoles(sessionUser.id);
          }
          syncActiveUiFromRoles(list);
          
          try {
            await fetchUserProfile(sessionUser.id);
          } catch (profileError) {
            // Silently continue if profile fetch fails
          }
          
          if (list.includes('user') || list.includes('organizer')) {
            try {
              await ensureUserPreferencesRow(sessionUser.id);
              await fetchOnboardingStatus(sessionUser.id);
            } catch (prefError) {
              // Silently continue if preferences fetch fails
            }
          }
        }
      } catch (error) {
        console.error('Error loading session:', error);
        setRoles([]);
        setActiveRoleUi(null);
        setOnboardingCompleted(null);
        setUserProfile(null);
        navigate('/');
      }
    },
    [fetchRoles, seedFirstRole, syncActiveUiFromRoles, fetchUserProfile, ensureUserPreferencesRow, fetchOnboardingStatus, isInitialized, fetchCombinedUserData]
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
      return;
    }
    
    isInitializingRef.current = true;
    
    const init = async () => {
      // First try to restore from localStorage
      const storedUser = localStorage.getItem('supabase.auth.user');
      const storedToken = localStorage.getItem('supabase.auth.token');
      
      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
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
        localStorage.removeItem('supabase.auth.user');
        localStorage.removeItem('supabase.auth.token');
        setUser(null);
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
    try {
      // Call Supabase signOut
      await supabase.auth.signOut();
      
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
      localStorage.removeItem(USER_SETTINGS_KEY);
      
      // Redirect after a short delay to ensure state is cleared
      setTimeout(() => {
        navigate('/');
      }, 100);
      
    } catch (error) {
      console.error('Error during sign out:', error);
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
      localStorage.removeItem(USER_SETTINGS_KEY);
      
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
