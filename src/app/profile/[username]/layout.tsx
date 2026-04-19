import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getUserByUsername, getUserStats } from '@/server/db/queries/profiles';
import { generateUserMetadata } from '@/shared/utils/metadata';

export const dynamic = 'force-dynamic';

interface ProfileLayoutProps {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const user = await getUserByUsername(username);

  // Call notFound() here (not just in the page) so the 404 status is set
  // before the layout commits. In Next.js 15.5, when a layout's
  // generateMetadata returns successful metadata and only the page throws
  // notFound(), the response status can be 200 despite rendering the
  // not-found.tsx UI — which crawlers treat as a soft-404, wasting crawl
  // budget and polluting Search Console with valid-but-empty URLs.
  if (!user) {
    notFound();
  }

  try {
    const stats = await getUserStats(user.id);

    return generateUserMetadata({
      username: user.username,
      name: user.name,
      bio: user.bio ? `${user.bio}${user.location ? ` • ${user.location}` : ''}` : user.location || undefined,
      avatar: user.avatar || undefined,
      website: user.website || undefined,
      listsCount: stats.listsCount,
      followersCount: stats.followersCount,
    });
  } catch (error) {
    console.error('Error generating profile metadata:', error);
    return {
      title: 'Profile',
      description: 'View user profile on Listicle',
    };
  }
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return <>{children}</>;
} 