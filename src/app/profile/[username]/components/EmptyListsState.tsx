"use client";

import React from "react";
import { Button } from "@/ui/components/Button";
import { useAuth } from "@/client/hooks/use-auth";

interface EmptyListsStateProps {
  profileName: string;
  username: string;
}

export function EmptyListsState({ profileName, username }: EmptyListsStateProps) {
  const { user: currentUser } = useAuth();
  
  // Check if this is the current user's own profile
  const isOwnProfile = currentUser?.user_metadata?.username === username || 
                       currentUser?.email?.split('@')[0] === username;

  return (
    <div className="flex w-full flex-col items-center gap-4 py-12">
      <span className="text-body font-body text-subtext-color">
        {isOwnProfile ? "You haven't published any lists yet." : `${profileName} hasn't published any lists yet.`}
      </span>
      {isOwnProfile && (
        <Button
          variant="brand-primary"
          onClick={() => {
            // TODO: Navigate to create list page
            window.location.href = '/create';
          }}
        >
          Create your first list
        </Button>
      )}
    </div>
  );
} 