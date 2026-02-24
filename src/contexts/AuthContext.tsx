import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { api } from '@/services/api';
import { wsService } from '@/services/websocket';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isApproved: boolean | null;
  role: 'admin' | 'user' | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  checkApproval: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [role, setRole] = useState<'admin' | 'user' | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Reset approval status on logout
        if (!session) {
          wsService.disconnect();
          setIsApproved(null);
          setRole(null);
          setIsLoading(false); // Immediately set loading to false on logout
        } else {
          // Defer approval check with setTimeout to avoid deadlock
          setTimeout(() => {
            checkApprovalStatus();
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        checkApprovalStatus();
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkApprovalStatus = async () => {
    try {
      const response = await api.auth.me();
      const approved = !!response.data.is_approved;
      setIsApproved(approved);
      setRole(response.data.role);
    } catch (error) {
      console.error('Error checking approval status:', error);
      setIsApproved(false);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  const checkApproval = async (): Promise<boolean> => {
    try {
      const response = await api.auth.me();
      const approved = !!response.data.is_approved;
      setIsApproved(approved);
      setRole(response.data.role);
      return approved;
    } catch (error) {
      console.error('Error checking approval:', error);
      return false;
    }
  };

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/dashboard`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Stop websocket reconnect loop immediately before auth state transitions.
      wsService.disconnect();
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setSession(null);
      setIsApproved(null);
      setRole(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isLoading,
        isApproved,
        role,
        signInWithGoogle,
        logout,
        checkApproval,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
