import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Check active session on mount
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        setUser(session?.user ?? null);
        setIsAuthenticated(!!session?.user);
      } catch (error) {
        console.error('Error checking auth session:', error);
        setAuthError({
          type: 'unknown',
          message: error.message || 'An unexpected error occurred'
        });
      } finally {
        setIsLoadingAuth(false);
      }
    };

    checkSession();

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session?.user);
        setIsLoadingAuth(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const logout = async (shouldRedirect = true) => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      
      if (shouldRedirect) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const signIn = async (email, password) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signUp = async (email, password) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + '/Register',
      },
    });
    if (error) throw error;
    return data;
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/Register',
      },
    });
    if (error) throw error;
    return data;
  };

  const requestPasswordReset = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/Register?recovery=1',
    });
    if (error) throw error;
    return data;
  };

  const updatePassword = async (password) => {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return data;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      authError,
      logout,
      signIn,
      signUp,
      signInWithGoogle,
      requestPasswordReset,
      updatePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
