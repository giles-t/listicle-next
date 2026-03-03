import { redirect } from 'next/navigation';
import { createClient } from '../../server/supabase';
import { DashboardClient } from './DashboardClient';
import { getUserStats, getUserRecentLists, getUserById } from '@/server/db/queries/profiles';
import { getUnreadCount } from '@/server/db/queries/notifications';

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const [profile, stats, recentLists, unreadNotifications] = await Promise.all([
    getUserById(user.id),
    getUserStats(user.id),
    getUserRecentLists(user.id, 6),
    getUnreadCount(user.id),
  ]);

  const serializedLists = recentLists.map((list) => ({
    ...list,
    created_at: list.created_at.toISOString(),
    published_at: list.published_at ? list.published_at.toISOString() : null,
  }));

  return (
    <DashboardClient
      user={user}
      profile={profile}
      stats={stats}
      recentLists={serializedLists}
      unreadNotifications={unreadNotifications}
    />
  );
} 