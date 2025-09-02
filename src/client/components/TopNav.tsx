"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { TextField } from "../../ui/components/TextField";
import { FeatherSearch } from "@subframe/core";
import { Button } from "../../ui/components/Button";
import { FeatherPlusCircle } from "@subframe/core";
import { IconButton } from "../../ui/components/IconButton";
import { FeatherBell } from "@subframe/core";
import { DropdownMenu } from "../../ui/components/DropdownMenu";
import { FeatherUser } from "@subframe/core";
import { FeatherSettings } from "@subframe/core";
import { FeatherLogOut } from "@subframe/core";
import { FeatherList } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { Avatar } from "../../ui/components/Avatar";
import { TopbarWithSearch } from "../../ui/components/TopbarWithSearch";
import LoginModal from "./auth/LoginModal";
import SignupModal from "./auth/SignupModal";
import { useAuth } from "../hooks/use-auth";
import Link from "next/link";
import { SkeletonText } from "../../ui/components/SkeletonText";

interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
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
  updated_at: string;
}

export function TopNav() {
  const pathname = usePathname();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const { user, signOut } = useAuth();
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Hide TopNav on specific routes
  const shouldHide = pathname === '/create' || pathname.startsWith('/me/list/');

  // Debounced profile fetching
  useEffect(() => {
    // Clear any existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set up debounced fetch
    debounceTimeout.current = setTimeout(async () => {
      if (!user) {
        setProfile(null);
        return;
      }

      setProfileLoading(true);
      try {
        const response = await fetch('/api/profile', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const profileData = await response.json();
          setProfile(profileData);
        } else if (response.status === 404) {
          // Profile doesn't exist yet
          setProfile(null);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        setProfile(null);
      } finally {
        setProfileLoading(false);
      }
    }, 300); // 300ms debounce delay

    // Cleanup timeout on unmount
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [user]);

  const handleNewClick = () => {
    if (!user) {
      setIsLoginModalOpen(true);
    }
  };

  const handleMyListsClick = () => {
    if (!user) {
      setIsLoginModalOpen(true);
    } else {
      window.location.href = '/me/lists';
    }
  };

  const handleNotificationClick = () => {
    if (!user) {
      setIsLoginModalOpen(true);
    } else {
      // TODO: Implement notifications
      console.log("Show notifications");
    }
  };

  const handleLogoutClick = async () => {
    await signOut();
  };

  const handleLoginToSignup = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(true);
  };

  const handleSignupToLogin = () => {
    setIsSignupModalOpen(false);
    setIsLoginModalOpen(true);
  };

  // Get the appropriate profile link
  const getProfileLink = () => {
    if (profile?.username) {
      return `/@${profile.username}`;
    } else {
      return "/settings/profile";
    }
  };

  if (shouldHide) {
    return null;
  }

  return (
    <>
      <TopbarWithSearch
        leftSlot={
          <>
            <Link href="/">
              <img
                className="h-6 flex-none object-cover"
                src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png"
              />
            </Link>
            <TextField
              variant="filled"
              label=""
              helpText=""
              icon={<FeatherSearch />}
            >
              <TextField.Input placeholder="Search" />
            </TextField>
          </>
        }
        rightSlot={
          <>
            <div className="flex items-center justify-end gap-2">
              {user ? (
                <>
                  <Link href="/create">
                    <Button 
                      variant="neutral-tertiary" 
                      icon={<FeatherPlusCircle />}
                    >
                      New
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button 
                    variant="neutral-tertiary" 
                    icon={<FeatherPlusCircle />}
                    onClick={handleNewClick}
                  >
                    New
                  </Button>
                </>
              )}
              {user && (
                <IconButton 
                  icon={<FeatherBell />}
                  onClick={handleNotificationClick}
                />
              )}
            </div>
            {user ? (
              <SubframeCore.DropdownMenu.Root>
                <SubframeCore.DropdownMenu.Trigger asChild={true}>
                  <Avatar 
                    image={profile?.avatar || undefined}
                    className={profileLoading && !profile ? "animate-pulse" : ""}
                  >
                    {profileLoading && !profile ? (
                      <div className="w-full h-full bg-gray-200 animate-pulse rounded-full" />
                    ) : (
                      profile?.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"
                    )}
                  </Avatar>
                </SubframeCore.DropdownMenu.Trigger>
                <SubframeCore.DropdownMenu.Portal>
                  <SubframeCore.DropdownMenu.Content
                    side="bottom"
                    align="end"
                    sideOffset={4}
                    asChild={true}
                  >
                    <DropdownMenu>
                      {profileLoading ? (
                        <>
                          <SubframeCore.DropdownMenu.Item asChild disabled>
                            <div className="w-full px-3 pt-1">
                              <SkeletonText size="subheader" />
                            </div>
                          </SubframeCore.DropdownMenu.Item>
                          <SubframeCore.DropdownMenu.Item asChild disabled>
                            <div className="w-full px-3 pt-1">
                              <SkeletonText size="subheader" />
                            </div>
                          </SubframeCore.DropdownMenu.Item>
                          <SubframeCore.DropdownMenu.Item asChild disabled>
                            <div className="w-full px-3 pt-1">
                              <SkeletonText size="subheader" />
                            </div>
                          </SubframeCore.DropdownMenu.Item>
                          <SubframeCore.DropdownMenu.Item asChild disabled>
                            <div className="w-full px-3 pt-1">
                              <SkeletonText size="subheader" />
                            </div>
                          </SubframeCore.DropdownMenu.Item>
                          <SubframeCore.DropdownMenu.Item asChild disabled>
                            <div className="w-full px-3 py-1">
                              <SkeletonText size="subheader" />
                            </div>
                          </SubframeCore.DropdownMenu.Item>
                        </>
                      ) : (
                        <>
                          <Link className="w-full" href={getProfileLink()}>
                            <DropdownMenu.DropdownItem 
                              icon={<FeatherUser />}
                            >
                              Profile
                            </DropdownMenu.DropdownItem>
                          </Link>
                          <Link className="w-full" href="/me/lists">
                            <DropdownMenu.DropdownItem 
                              icon={<FeatherList />}
                            >
                              My Lists
                            </DropdownMenu.DropdownItem>
                          </Link>
                          <Link className="w-full" href="/settings">
                            <DropdownMenu.DropdownItem 
                              icon={<FeatherSettings />}
                            >
                              Settings
                            </DropdownMenu.DropdownItem>
                          </Link>
                          <DropdownMenu.DropdownItem 
                            icon={<FeatherLogOut />}
                            onClick={handleLogoutClick}
                          >
                            Log out
                          </DropdownMenu.DropdownItem>
                        </>
                      )}
                    </DropdownMenu>
                  </SubframeCore.DropdownMenu.Content>
                </SubframeCore.DropdownMenu.Portal>
              </SubframeCore.DropdownMenu.Root>
            ) : (
              <Button 
                variant="brand-primary"
                onClick={() => setIsLoginModalOpen(true)}
              >
                Sign In
              </Button>
            )}
          </>
        }
      />
      
      <LoginModal 
        open={isLoginModalOpen}
        onOpenChange={setIsLoginModalOpen}
        onSignUpClick={handleLoginToSignup}
      />
      <SignupModal 
        open={isSignupModalOpen}
        onOpenChange={setIsSignupModalOpen}
        onSignInClick={handleSignupToLogin}
      />
    </>
  );
} 