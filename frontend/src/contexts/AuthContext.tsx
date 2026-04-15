import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';

type AuthContextType = ReturnType<typeof useAuthWithBackend>;

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuthWithBackend();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
