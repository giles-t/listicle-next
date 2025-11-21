import { redirect } from 'next/navigation';
import { createClient } from '@/server/supabase';
import OnboardingProfileSetup from './OnboardingProfileSetup';

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // If user already has username set, redirect them away
  if (user.user_metadata?.username) {
    const params = await searchParams;
    const redirectPath = params.redirect || '/dashboard';
    redirect(redirectPath);
  }

  const params = await searchParams;
  const redirectPath = params.redirect || '/dashboard';

  return <OnboardingProfileSetup redirectPath={redirectPath} />;
}

