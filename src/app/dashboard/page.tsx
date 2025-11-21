import { redirect } from 'next/navigation';
import { createClient } from '../../server/supabase';
import { DashboardClient } from './DashboardClient';

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Onboarding check is handled by middleware
  // If user reaches here, they've completed onboarding

  return <DashboardClient user={user} />;
} 