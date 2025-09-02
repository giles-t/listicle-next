import React from "react";
import { Button } from "@/ui/components/Button";
import Link from "next/link";

export default function SettingsNotFound() {
  return (
    <div className="container max-w-none flex h-full w-full flex-col items-center justify-center gap-6 bg-default-background py-12">
      <div className="flex w-full max-w-[480px] flex-col items-center gap-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-heading-1 font-heading-1 text-default-font">
            Settings Page Not Found
          </h1>
          <p className="text-body font-body text-subtext-color">
            The settings page you're looking for doesn't exist.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link href="/settings">
            <Button variant="brand-primary">
              Go to Settings
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="neutral-secondary">
              My Dashboard
            </Button>
          </Link>
        </div>
        
        <p className="text-caption font-caption text-subtext-color">
          Check the URL or try navigating from the settings menu.
        </p>
      </div>
    </div>
  );
} 