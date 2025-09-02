import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../supabase';
import { toast } from "@subframe/core";
import { captureException } from '../../shared/sentry';
import { Session, User as SupabaseUser, AuthError } from '@supabase/supabase-js';
import { authManager } from '../auth/auth-manager';

export function useAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(authManager.getUser());
  const [session, setSession] = useState<Session | null>(authManager.getSession());
  const [loading, setLoading] = useState(authManager.isLoading());
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = authManager.subscribe((newUser, newSession, newLoading) => {
      setUser(newUser);
      setSession(newSession);
      setLoading(newLoading);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success('Check your email for a confirmation link!');
      return true;
    } catch (error) {
      if (error instanceof AuthError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to sign up. Please try again.');
        captureException(error, { context: 'useAuth.signUp' });
      }
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success('Signed in successfully!');
      router.push('/dashboard');
      return true;
    } catch (error) {
      if (error instanceof AuthError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to sign in. Please try again.');
        captureException(error, { context: 'useAuth.signIn' });
      }
      return false;
    }
  };

  const signInWithMagicLink = async (email: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      toast.success('Check your email for a magic link!');
      return true;
    } catch (error) {
      if (error instanceof AuthError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to send magic link. Please try again.');
        captureException(error, { context: 'useAuth.signInWithMagicLink' });
      }
      return false;
    }
  };

  const signOut = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      router.push('/');
      toast.success('Signed out successfully');
      return true;
    } catch (error) {
      toast.error('Failed to sign out. Please try again.');
      captureException(error, { context: 'useAuth.signOut' });
      return false;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Check your email for password reset instructions');
      return true;
    } catch (error) {
      if (error instanceof AuthError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to send reset instructions. Please try again.');
        captureException(error, { context: 'useAuth.resetPassword' });
      }
      return false;
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Password updated successfully');
      router.push('/dashboard');
      return true;
    } catch (error) {
      if (error instanceof AuthError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update password. Please try again.');
        captureException(error, { context: 'useAuth.updatePassword' });
      }
      return false;
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithMagicLink,
    signOut,
    resetPassword,
    updatePassword,
  };
} 