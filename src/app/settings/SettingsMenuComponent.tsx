"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SettingsMenu } from "@/ui/components/SettingsMenu";
import { Bell, Lock, User } from "lucide-react";

export function SettingsMenuComponent() {
  const pathname = usePathname();

  return (
    <SettingsMenu className="mobile:w-full mobile:grow mobile:shrink-0 mobile:basis-0">
      <span className="w-full text-heading-3 font-heading-3 text-default-font">
        Settings
      </span>
      <div className="flex w-full flex-col items-start gap-2">
        <span className="w-full text-body-bold font-body-bold text-default-font">
          Account
        </span>
        <div className="flex w-full flex-col items-start gap-1">
          <Link className="w-full" href="/settings/profile">
            <SettingsMenu.Item 
              selected={pathname === "/settings/profile"} 
              icon={<User />} 
              label="Profile" 
            />
          </Link>
          <Link className="w-full" href="/settings/security">
            <SettingsMenu.Item 
              selected={pathname === "/settings/security"} 
              icon={<Lock />} 
              label="Security" 
            />
          </Link>
          <Link className="w-full" href="/settings/notifications">
            <SettingsMenu.Item 
              selected={pathname === "/settings/notifications"} 
              icon={<Bell />} 
              label="Notifications" 
            />
          </Link>
        </div>
      </div>
    </SettingsMenu>
  );
} 