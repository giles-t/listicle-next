import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/server/supabase";
import { getUserById } from "@/server/db/queries/profiles";
import { ProfileForm } from "./ProfileForm";

interface Profile {
  id: string;
  username: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  avatar: string | null;
  website: string | null;
  twitter: string | null;
  linkedin: string | null;
  instagram: string | null;
  youtube: string | null;
  github: string | null;
}

async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  try {
    // Use direct database query instead of API fetch
    const profile = await getUserById(user.id);
    
    if (!profile) {
      // Profile doesn't exist, return null to indicate new profile
      return null;
    }

    return {
      id: profile.id,
      username: profile.username,
      name: profile.name,
      bio: profile.bio,
      location: profile.location,
      avatar: profile.avatar,
      website: profile.website,
      twitter: profile.twitter,
      linkedin: profile.linkedin,
      instagram: profile.instagram,
      youtube: profile.youtube,
      github: profile.github,
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    // Return null if profile doesn't exist or error occurs
    return null;
  }
}

export default async function ProfileSettingsPage() {
  const profile = await getProfile();

  return <ProfileForm profile={profile} />;
} 