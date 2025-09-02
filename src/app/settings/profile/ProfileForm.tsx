"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@subframe/core";

import { Avatar } from "@/ui/components/Avatar";
import { Button } from "@/ui/components/Button";
import { FeatherUpload } from "@subframe/core";
import { TextField } from "@/ui/components/TextField";
import { TextArea } from "@/ui/components/TextArea";
import { FeatherGlobe } from "@subframe/core";
import { FeatherTwitter } from "@subframe/core";
import { FeatherLinkedin } from "@subframe/core";
import { FeatherInstagram } from "@subframe/core";
import { FeatherYoutube } from "@subframe/core";
import { FeatherGithub } from "@subframe/core";
import { profileFormSchema, ProfileFormData } from "@/shared/validation/user";
import { updateProfile, uploadAvatar } from "./actions";

// Utility functions to extract usernames from URLs
const extractTwitterUsername = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http')) {
    const match = url.match(/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/);
    return match ? match[1] : '';
  }
  return url;
};

const extractLinkedInUsername = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http')) {
    const match = url.match(/linkedin\.com\/in\/([a-zA-Z0-9-]+)/);
    return match ? match[1] : '';
  }
  return url;
};

const extractInstagramUsername = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http')) {
    const match = url.match(/instagram\.com\/([a-zA-Z0-9_.]+)/);
    return match ? match[1] : '';
  }
  return url;
};

const extractYouTubeUsername = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http')) {
    const match = url.match(/youtube\.com\/(?:channel\/|c\/|user\/|@)?([a-zA-Z0-9_-]+)/);
    return match ? match[1] : '';
  }
  return url;
};

const extractGitHubUsername = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http')) {
    const match = url.match(/github\.com\/([a-zA-Z0-9-]+)/);
    return match ? match[1] : '';
  }
  return url;
};

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

interface ProfileFormProps {
  profile: Profile | null;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const form = useForm({
    // resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: profile?.username || '',
      displayName: profile?.name || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      website: profile?.website || '',
      twitter: extractTwitterUsername(profile?.twitter || ''),
      linkedin: extractLinkedInUsername(profile?.linkedin || ''),
      instagram: extractInstagramUsername(profile?.instagram || ''),
      youtube: extractYouTubeUsername(profile?.youtube || ''),
      github: extractGitHubUsername(profile?.github || ''),
    },
  });

  const { register, handleSubmit, formState: { errors }, watch } = form;

  const onSubmit = async (data: any) => {
    setIsSaving(true);
    
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value) {
          formData.append(key, String(value));
        }
      });

      const result = await updateProfile(formData);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.message || 'Profile updated successfully!');
        router.refresh();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const result = await uploadAvatar(formData);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.message || 'Avatar updated successfully!');
        router.refresh();
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const displayName = watch('displayName');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full max-w-[576px] flex-col items-start gap-12">
      <div className="flex w-full flex-col items-start gap-1">
        <span className="w-full text-heading-2 font-heading-2 text-default-font">
          Profile
        </span>
        <span className="w-full text-body font-body text-subtext-color">
          Manage your personal information and preferences.
        </span>
      </div>
      <div className="flex w-full flex-col items-start gap-6">
        <span className="text-heading-3 font-heading-3 text-default-font">
          Profile Information
        </span>
        <div className="flex w-full flex-col items-start gap-4">
          <span className="text-body-bold font-body-bold text-default-font">
            Avatar
          </span>
          <div className="flex items-center gap-4">
            <Avatar
              size="x-large"
              image={profile?.avatar || undefined}
            >
              {displayName?.[0]?.toUpperCase() || profile?.name?.[0]?.toUpperCase() || "U"}
            </Avatar>
            <div className="flex flex-col items-start gap-2">
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <label htmlFor="avatar-upload" className="cursor-pointer">
                <Button
                  type="button"
                  variant="neutral-secondary"
                  icon={<FeatherUpload />}
                  disabled={isUploadingAvatar}
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                >
                  {isUploadingAvatar ? 'Uploading...' : 'Upload new image'}
                </Button>
              </label>
              <span className="text-caption font-caption text-subtext-color">
                Square image recommended. JPG or PNG. Max 2MB.
              </span>
            </div>
          </div>
        </div>
        <TextField
          className="h-auto w-full flex-none"
          label="Username"
          helpText={errors.username?.message || "This will be your unique identifier on the platform"}
          error={!!errors.username}
        >
          <TextField.Input
            placeholder="Choose a username"
            {...register('username')}
          />
        </TextField>

        <TextField
          className="h-auto w-full flex-none"
          label="Display name"
          helpText={errors.displayName?.message || "Enter your full name as you'd like it to appear on your published listicles"}
          error={!!errors.displayName}
        >
          <TextField.Input
            placeholder="Enter your full name"
            {...register('displayName')}
          />
        </TextField>
        <TextArea
          className="h-auto w-full flex-none"
          label="Bio"
          helpText={errors.bio?.message || "Tell readers a bit about yourself"}
          error={!!errors.bio}
        >
          <TextArea.Input
            className="h-auto min-h-[96px] w-full flex-none"
            placeholder="Write a bio"
            {...register('bio')}
          />
        </TextArea>
        <TextField
          className="h-auto w-full flex-none"
          label="Location"
          helpText={errors.location?.message || "Where are you based? (City, Country)"}
          error={!!errors.location}
        >
          <TextField.Input
            placeholder="New York, NY"
            {...register('location')}
          />
        </TextField>
      </div>
      <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
      <div className="flex w-full flex-col items-start gap-6">
        <span className="text-heading-3 font-heading-3 text-default-font">
          Social Links
        </span>
        <TextField
          className="h-auto w-full flex-none"
          label="Website"
          helpText={errors.website?.message || "Your personal or professional website"}
          icon={<FeatherGlobe />}
          error={!!errors.website}
        >
          <TextField.Input
            placeholder="https://www.example.com"
            {...register('website')}
          />
        </TextField>
        <TextField
          className="h-auto w-full flex-none"
          label="Twitter"
          helpText={errors.twitter?.message || "Your Twitter username (without @)"}
          icon={<FeatherTwitter />}
          error={!!errors.twitter}
        >
          <TextField.Input
            placeholder="username"
            {...register('twitter')}
          />
        </TextField>
        <TextField
          className="h-auto w-full flex-none"
          label="LinkedIn"
          helpText={errors.linkedin?.message || "Your LinkedIn username or custom URL"}
          icon={<FeatherLinkedin />}
          error={!!errors.linkedin}
        >
          <TextField.Input
            placeholder="username"
            {...register('linkedin')}
          />
        </TextField>
        <TextField
          className="h-auto w-full flex-none"
          label="Instagram"
          helpText={errors.instagram?.message || "Your Instagram username (without @)"}
          icon={<FeatherInstagram />}
          error={!!errors.instagram}
        >
          <TextField.Input
            placeholder="username"
            {...register('instagram')}
          />
        </TextField>
        <TextField
          className="h-auto w-full flex-none"
          label="YouTube"
          helpText={errors.youtube?.message || "Your YouTube channel name or custom URL"}
          icon={<FeatherYoutube />}
          error={!!errors.youtube}
        >
          <TextField.Input
            placeholder="channelname"
            {...register('youtube')}
          />
        </TextField>
        <TextField
          className="h-auto w-full flex-none"
          label="GitHub"
          helpText={errors.github?.message || "Your GitHub username"}
          icon={<FeatherGithub />}
          error={!!errors.github}
        >
          <TextField.Input
            placeholder="username"
            {...register('github')}
          />
        </TextField>
      </div>
      <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
      <div className="flex w-full items-center justify-end gap-2">
        <Button
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
} 