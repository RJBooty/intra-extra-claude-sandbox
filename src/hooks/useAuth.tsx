import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { auth, getUserRole, getUserProfile } from '../lib/supabase';
import { UserTier } from '../types/permissions';

export interface AuthUser extends User {
  role_level?: UserTier;
  profile?: any;
}

export interface UseAuthResult {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  userRole: UserTier | null;
  userProfile: any;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, metadata?: any) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserTier | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchUserRoleAndProfile = useCallback(async (userId: string) => {
    try {
      // Fetch user role from platform_user_roles table
      const role = await getUserRole(userId);
      setUserRole(role as UserTier);

      // Fetch user profile with additional data
      const profile = await getUserProfile(userId);
      setUserProfile(profile);

      return { role, profile };
    } catch (error) {
      console.error('Error fetching user role and profile:', error);
      return { role: null, profile: null };
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = await auth.getCurrentUser();
      
      if (currentUser) {
        const { role, profile } = await fetchUserRoleAndProfile(currentUser.id);
        
        const enhancedUser: AuthUser = {
          ...currentUser,
          role_level: role as UserTier,
          profile
        };
        
        setUser(enhancedUser);
      } else {
        setUser(null);
        setUserRole(null);
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setError('Failed to refresh user data');
    } finally {
      setLoading(false);
    }
  }, [fetchUserRoleAndProfile]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: authError } = await auth.signIn(email, password);
      
      if (authError) {
        setError(authError.message);
        return { success: false, error: authError.message };
      }

      if (data.user) {
        const { role, profile } = await fetchUserRoleAndProfile(data.user.id);
        
        const enhancedUser: AuthUser = {
          ...data.user,
          role_level: role as UserTier,
          profile
        };
        
        setUser(enhancedUser);
      }

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchUserRoleAndProfile]);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await auth.signOut();
      
      setUser(null);
      setUserRole(null);
      setUserProfile(null);
      setError(null);
    } catch (error: any) {
      console.error('Logout error:', error);
      setError(error.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, metadata?: any) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: authError } = await auth.signUp(email, password, metadata);
      
      if (authError) {
        setError(authError.message);
        return { success: false, error: authError.message };
      }

      if (data.user) {
        // For new signups, role might not be assigned yet
        const { role, profile } = await fetchUserRoleAndProfile(data.user.id);
        
        const enhancedUser: AuthUser = {
          ...data.user,
          role_level: role as UserTier,
          profile
        };
        
        setUser(enhancedUser);
      }

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Signup failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchUserRoleAndProfile]);

  // Initialize auth state and listen for changes
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const currentUser = await auth.getCurrentUser();
        
        if (mounted) {
          if (currentUser) {
            const { role, profile } = await fetchUserRoleAndProfile(currentUser.id);
            
            const enhancedUser: AuthUser = {
              ...currentUser,
              role_level: role as UserTier,
              profile
            };
            
            setUser(enhancedUser);
          } else {
            setUser(null);
            setUserRole(null);
            setUserProfile(null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setError('Failed to initialize authentication');
          setUser(null);
          setUserRole(null);
          setUserProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = auth.onAuthStateChange(async (authUser) => {
      if (!mounted) return;

      try {
        setLoading(true);
        
        if (authUser) {
          const { role, profile } = await fetchUserRoleAndProfile(authUser.id);
          
          const enhancedUser: AuthUser = {
            ...authUser,
            role_level: role as UserTier,
            profile
          };
          
          setUser(enhancedUser);
        } else {
          setUser(null);
          setUserRole(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setError('Failed to update authentication state');
      } finally {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchUserRoleAndProfile]);

  // Update derived state when user changes
  useEffect(() => {
    if (user) {
      setUserRole(user.role_level || null);
      setUserProfile(user.profile || null);
    } else {
      setUserRole(null);
      setUserProfile(null);
    }
  }, [user]);

  const isAuthenticated = !!user;

  return {
    user,
    loading,
    error,
    isAuthenticated,
    userRole,
    userProfile,
    login,
    logout,
    signup,
    refreshUser,
    clearError
  };
}

// Optional: Create an auth context provider for global state management

const AuthContext = createContext<UseAuthResult | null>(null);

export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): UseAuthResult {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}