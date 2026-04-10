"use client";

import { Button } from "@/ui/components/Button";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { FeatherAlertTriangle } from "@subframe/core";
import Link from "next/link";

export default function Error({
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
        icon={<FeatherAlertTriangle />}
        square={false}
      />
      <div className="flex flex-col items-center gap-2">
        <span className="text-heading-2 font-heading-2 text-default-font">
          Something went wrong
        </span>
        <span className="text-body font-body text-subtext-color text-center max-w-md">
          {error.message || "An unexpected error occurred. Please try again."}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={reset} variant="brand-primary">
          Try again
        </Button>
        <Link href="/">
          <Button variant="neutral-secondary">Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
