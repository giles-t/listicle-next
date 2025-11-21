'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/src/client/supabase';
import { toast } from "@subframe/core";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = createClient();
        // For magic links, the authentication is handled automatically by Supabase
        // We just need to check if the user is now authenticated
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        let authenticatedUser = session?.user;

        if (!authenticatedUser) {
          // If no session, try to exchange the code/tokens from URL params
          const url = new URL(window.location.href);
          const code = url.searchParams.get('code');
          
          if (code) {
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            
            if (exchangeError) {
              throw exchangeError;
            }

            if (data.session?.user) {
              authenticatedUser = data.session.user;
            } else {
              throw new Error('Failed to create session');
            }
          } else {
            throw new Error('No authentication code found');
          }
        }

        // User profile is automatically created by database trigger
        // No manual sync needed

        toast.success('Successfully signed in!');
        router.push('/dashboard');
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Authentication failed. Please try again.');
        router.push('/');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Signing you in...</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
} 