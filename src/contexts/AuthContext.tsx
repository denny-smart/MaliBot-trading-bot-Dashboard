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

type AuthRole = 'admin' | 'user' | null;

const parseBoolean = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1 ? true : value === 0 ? false : null;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes'].includes(normalized)) return true;
    if (['false', '0', 'no'].includes(normalized)) return false;
  }
  return null;
};

const parseRole = (value: unknown): AuthRole => {
  return value === 'admin' || value === 'user' ? value : null;
};

const extractApprovalState = (payload: unknown): { approved: boolean | null; role: AuthRole } => {
  if (!payload || typeof payload !== 'object') {
    return { approved: null, role: null };
  }

  const root = payload as Record<string, unknown>;
  const nestedUser =
    root.user && typeof root.user === 'object'
      ? (root.user as Record<string, unknown>)
      : null;

  return {
    approved: parseBoolean(
      nestedUser?.is_approved ??
      nestedUser?.approved ??
      root.is_approved ??
      root.approved
    ),
    role: parseRole(nestedUser?.role ?? root.role),
  };
};

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
      const { approved, role } = extractApprovalState(response.data);

      if (approved === null) {
        const approvalResponse = await api.auth.checkApproval();
        setIsApproved(Boolean(approvalResponse.data.approved));
      } else {
        setIsApproved(approved);
      }

      setRole(role);
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
      const { approved, role } = extractApprovalState(response.data);
      const resolvedApproval =
        approved ?? Boolean((await api.auth.checkApproval()).data.approved);

      setIsApproved(resolvedApproval);
      setRole(role);
      return resolvedApproval;
    } catch (error) {
      console.error('Error checking approval:', error);
      setIsApproved(false);
      setRole(null);
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
