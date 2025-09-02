import { useState, useEffect } from 'react';
import { toast } from '@subframe/core';

export interface ProfileData {
  profile: {
    id: string;
    username: string;
    name: string;
    avatar: string | null;
    bio: string | null;
    location: string | null;
    website: string | null;
    twitter: string | null;
    linkedin: string | null;
    instagram: string | null;
    youtube: string | null;
    github: string | null;
    created_at: string;
  };
  stats: {
    listsCount: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    followersCount: number;
    followingCount: number;
  };
  recentLists: Array<{
    id: string;
    title: string;
    description: string | null;
    slug: string;
    cover_image: string | null;
    is_published: boolean;
    created_at: string;
    published_at: string | null;
    viewsCount: number;
    likesCount: number;
    commentsCount: number;
  }>;
}

export function useProfile(username: string) {
  const [data, setData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      console.log('useProfile - Fetching profile');
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/profile/${username}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch profile');
        }

        const profileData = await response.json();
        setData(profileData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  return { data, isLoading, error, refetch: () => window.location.reload() };
}

export function useFollowUser(username: string) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const followUser = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/profile/${username}/follow`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to follow user');
      }

      const result = await response.json();
      setIsFollowing(result.isFollowing);
      toast.success(result.message || 'User followed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const unfollowUser = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/profile/${username}/follow`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to unfollow user');
      }

      const result = await response.json();
      setIsFollowing(result.isFollowing);
      toast.success(result.message || 'User unfollowed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isFollowing,
    isLoading,
    followUser,
    unfollowUser,
  };
} 