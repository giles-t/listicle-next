"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/ui/components/Avatar";
import { Button } from "@/ui/components/Button";
import { TextField } from "@/ui/components/TextField";
import { FeatherUpload } from "@subframe/core";
import { toast } from "@subframe/core";
import { completeOnboarding } from "./actions";
import { checkUsernameAvailability } from "./check-username";

interface OnboardingProfileSetupProps {
  redirectPath?: string;
}

export default function OnboardingProfileSetup({ redirectPath = '/dashboard' }: OnboardingProfileSetupProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  // Debounced username availability check
  useEffect(() => {
    if (!username || username.trim().length < 3) {
      setUsernameError(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsCheckingUsername(true);
      const result = await checkUsernameAvailability(username);
      setIsCheckingUsername(false);
      
      if (!result.available) {
        setUsernameError(result.error || 'Username is not available');
      } else {
        setUsernameError(null);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 2MB.');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setAvatar(previewUrl);

    // TODO: Upload to Supabase storage and get public URL
    // For now, we'll handle this in the completeOnboarding action
  };

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (!username.trim()) {
      toast.error('Username is required');
      return;
    }

    if (username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    if (!displayName.trim()) {
      toast.error('Display name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('username', username.trim());
      formData.append('displayName', displayName.trim());
      if (avatar) {
        // If avatar is a blob URL, we need to convert it
        // For now, we'll handle avatar upload separately
      }

      const result = await completeOnboarding(formData);

      if (result.error) {
        // Handle field-level errors
        if (result.fieldErrors) {
          if (result.fieldErrors.username) {
            setUsernameError(result.fieldErrors.username[0]);
          }
          if (result.fieldErrors.displayName) {
            setDisplayNameError(result.fieldErrors.displayName[0]);
          }
        } else {
          toast.error(result.error);
        }
        setIsSubmitting(false);
        return;
      }

      toast.success('Profile setup complete!');
      
      // Redirect to the intended destination
      router.push(redirectPath);
      router.refresh(); // Refresh to update middleware checks
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to complete setup. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 bg-default-background px-6 h-screen">
      <div className="flex w-full max-w-[576px] flex-col items-center gap-12">
        <div className="flex w-full flex-col items-center gap-2">
          <span className="text-heading-1 font-heading-1 text-default-font text-center">
            Welcome to Listicle
          </span>
          <span className="text-body font-body text-subtext-color text-center">
            Let&#39;s set up your profile to get started
          </span>
        </div>
        <div className="flex w-full flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-4">
            <Avatar size="x-large" image={avatar || ""}>
              {displayName?.[0]?.toUpperCase() || username?.[0]?.toUpperCase() || "U"}
            </Avatar>
            <div className="flex flex-col items-center gap-2">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
              />
              <Button
                variant="neutral-secondary"
                icon={<FeatherUpload />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                  event.preventDefault();
                  document.getElementById('avatar-upload')?.click();
                }}
              >
                Upload profile picture
              </Button>
              <span className="text-caption font-caption text-subtext-color text-center">
                Optional. Square image recommended. JPG or PNG. Max 2MB.
              </span>
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-4">
            <TextField
              className="h-auto w-full flex-none"
              label="Username"
              helpText={isCheckingUsername ? "Checking availability..." : usernameError || "This will be your unique identifier on Listicle AI"}
              error={!!usernameError}
            >
              <TextField.Input
                placeholder="Choose a username"
                value={username}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setUsername(event.target.value);
                  setUsernameError(null); // Clear error on change
                }}
                disabled={isSubmitting}
              />
            </TextField>
            <TextField
              className="h-auto w-full flex-none"
              label="Display name"
              helpText={displayNameError || "This is how your name will appear on your published listicles"}
              error={!!displayNameError}
            >
              <TextField.Input
                placeholder="Enter display name"
                value={displayName}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setDisplayName(event.target.value);
                  setDisplayNameError(null); // Clear error on change
                }}
                disabled={isSubmitting}
              />
            </TextField>
          </div>
          <Button
            className="h-10 w-full flex-none"
            size="large"
            onClick={handleSubmit}
            disabled={isSubmitting || !username.trim() || !displayName.trim() || !!usernameError || isCheckingUsername}
          >
            {isSubmitting ? 'Completing setup...' : 'Complete setup'}
          </Button>
        </div>
      </div>
    </div>
  );
}

