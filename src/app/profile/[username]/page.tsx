import React from "react";
import { notFound } from "next/navigation";
import { getUserByUsername, getUserStats, getUserLists } from "@/server/db/queries/profiles";
import { createClient } from "@/server/supabase";
import { ProfileContent } from "./components/ProfileContent";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  // Fetch all data server-side for SEO
  const user = await getUserByUsername(username);
  
  if (!user) {
    notFound();
  }

  // Get current user for follow functionality
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const [stats, listsResult] = await Promise.all([
    getUserStats(user.id),
    getUserLists(user.id, { page: 1, perPage: 10, sort: 'recent' }),
  ]);

  const profile = {
    id: user.id,
    username: user.username,
    name: user.name,
    avatar: user.avatar,
    bio: user.bio,
    location: user.location,
    website: user.website,
    twitter: user.twitter,
    linkedin: user.linkedin,
    instagram: user.instagram,
    youtube: user.youtube,
    github: user.github,
    created_at: user.created_at.toISOString(),
  };

  // Convert dates to ISO strings for serialization
  const initialLists = listsResult.lists.map(list => ({
    ...list,
    created_at: list.created_at.toISOString(),
    published_at: list.published_at?.toISOString() || null,
  }));

  return (
    <div className="container max-w-none flex h-full w-full flex-col items-center gap-6 bg-default-background py-12 overflow-auto">
      <ProfileContent
        profile={profile}
        stats={stats}
        initialLists={initialLists}
        initialTotal={listsResult.total}
        currentUserId={currentUser?.id}
      />
    </div>
  );
}
