import { Metadata } from 'next';
import { getUserByUsername, getUserStats } from '@/server/db/queries/profiles';
import { generateUserMetadata } from '@/shared/utils/metadata';

interface ProfileLayoutProps {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  try {
    const { username } = await params;
    const user = await getUserByUsername(username);
    
    if (!user) {
      return {
        title: 'Profile Not Found | Listicle',
        description: 'The profile you are looking for does not exist.',
        robots: 'noindex, nofollow',
      };
    }

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
      title: 'Profile | Listicle',
      description: 'View user profile on Listicle',
    };
  }
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return <>{children}</>;
} 