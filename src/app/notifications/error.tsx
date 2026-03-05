"use client";

import React from "react";
import { Button } from "@/ui/components/Button";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { AlertTriangle } from "lucide-react";

export default function NotificationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container max-w-none flex h-full w-full flex-col items-center justify-center gap-6 bg-default-background py-24">
      <IconWithBackground
        variant="error"
        size="x-large"
        icon={<AlertTriangle />}
        square={false}
      />
      <div className="flex flex-col items-center gap-2">
        <span className="text-heading-2 font-heading-2 text-default-font">
          Something went wrong
        </span>
        <span className="text-body font-body text-subtext-color text-center max-w-md">
          We couldn&apos;t load your notifications. Please try again.
        </span>
      </div>
      <Button onClick={reset} variant="brand-primary">
        Try again
      </Button>
    </div>
  );
}
