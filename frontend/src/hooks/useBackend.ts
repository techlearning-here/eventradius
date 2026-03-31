/**
 * React hook for using the backend API client.
 */
import { useState, useCallback } from 'react';
import { backendClient, ApiResponse, Event, UserProfile } from '@/integrations/backend/client';

export function useBackend() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = useCallback(async <T>(
    requestFn: () => Promise<ApiResponse<T>>
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await requestFn();
      
      if (response.error) {
        setError(response.error);
        return null;
      }
      
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Events
  const getEvents = useCallback(async (params?: {
    limit?: number;
    offset?: number;
    category?: string;
    is_public?: boolean;
  }) => {
    return handleRequest(() => backendClient.getEvents(params));
  }, [handleRequest]);

  const getEvent = useCallback(async (id: string) => {
    return handleRequest(() => backendClient.getEvent(id));
  }, [handleRequest]);

  const createEvent = useCallback(async (event: Omit<Event, 'id' | 'organizer_id' | 'created_at' | 'updated_at'>) => {
    return handleRequest(() => backendClient.createEvent(event));
  }, [handleRequest]);

  const updateEvent = useCallback(async (id: string, event: Partial<Event>) => {
    return handleRequest(() => backendClient.updateEvent(id, event));
  }, [handleRequest]);

  const deleteEvent = useCallback(async (id: string) => {
    return handleRequest(() => backendClient.deleteEvent(id));
  }, [handleRequest]);

  const participateEvent = useCallback(async (id: string) => {
    return handleRequest(() => backendClient.participateEvent(id));
  }, [handleRequest]);

  const leaveEvent = useCallback(async (id: string) => {
    return handleRequest(() => backendClient.leaveEvent(id));
  }, [handleRequest]);

  // Users
  const getCurrentUser = useCallback(async () => {
    return handleRequest(() => backendClient.getCurrentUser());
  }, [handleRequest]);

  const updateCurrentUser = useCallback(async (profile: Partial<UserProfile>) => {
    return handleRequest(() => backendClient.updateCurrentUser(profile));
  }, [handleRequest]);

  const getUserProfile = useCallback(async (id: string) => {
    return handleRequest(() => backendClient.getUserProfile(id));
  }, [handleRequest]);

  const getUserEvents = useCallback(async () => {
    return handleRequest(() => backendClient.getUserEvents());
  }, [handleRequest]);

  // Auth
  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await backendClient.signIn(email, password);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await backendClient.signUp(email, password);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await backendClient.signOut();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await backendClient.resetPassword(email);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    loading,
    error,
    
    // Events
    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    participateEvent,
    leaveEvent,
    
    // Users
    getCurrentUser,
    updateCurrentUser,
    getUserProfile,
    getUserEvents,
    
    // Auth
    signIn,
    signUp,
    signOut,
    resetPassword,
    
    // Utilities
    clearError,
  };
}