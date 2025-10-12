import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';
import type { User, AuthContextType } from '../types';
import { sendWaiverEmail } from '../utils/emailFunctions';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      }
      setLoading(false);
    }).catch(err => {
      console.error('Error getting initial session:', err);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          // Fire-and-forget; don't block UI on profile fetch
          fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (error) throw error;

      const profile = profileData ?? null;

      const userProfile: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        username: profile?.full_name || undefined,
        avatar_url: profile?.avatar_url || 'avatar.png',
        created_at: supabaseUser.created_at,
        updated_at: profile?.updated_at || supabaseUser.created_at,
      };

      setUser(userProfile);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Fallback: set minimal user data so app remains usable
      const userProfile: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        username: undefined,
        avatar_url: 'avatar.png',
        created_at: supabaseUser.created_at,
        updated_at: supabaseUser.created_at,
      };
      setUser(userProfile);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: username,
        },
      },
    });
    if (error) throw error;

    // Send waiver email to new user
    try {
      await sendWaiverEmail(email, username, 'Thank you for agreeing to our waiver terms. Please review the complete waiver terms below.');
    } catch (emailError) {
      console.error('Failed to send waiver email:', emailError);
      // Don't throw error here as user registration was successful
    }

    return data.user;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) throw new Error('No user logged in');

    const { data: updated, error } = await supabase
      .from('profiles')
      .update({
        email: user.email,
        full_name: data.username,
        avatar_url: data.avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select('*');

    if (error) throw error;
    let applied = updated;
    if (!applied || applied.length === 0) {
      // Attempt to create the profile row if it doesn't exist
      const insertRes = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: data.username,
          avatar_url: data.avatar_url ?? 'avatar.png',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('*');

      if (insertRes.error) throw insertRes.error;
      applied = insertRes.data as any[];
      if (!applied || applied.length === 0) {
        throw new Error('Failed to create profile row.');
      }
    }

    // Update local user state
    setUser(prev => prev ? { ...prev, ...data, email: user.email } : null);
  };

  const requestPasswordReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?type=recovery`,
    });
    if (error) throw error;
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    requestPasswordReset,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
