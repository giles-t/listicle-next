"use client";

import React from "react";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { Button } from "@/ui/components/Button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container max-w-none flex h-full w-full flex-col items-center justify-center gap-6 py-24">
      <IconWithBackground variant="neutral" size="large" square={true} />
      <div className="text-center">
        <h2 className="text-heading-3 font-heading-3 text-default-font mb-2">List not found</h2>
        <p className="text-body font-body text-subtext-color">The list you are looking for does not exist or you do not have access.</p>
      </div>
      <Link href="/me/lists">
        <Button>Go to My Lists</Button>
      </Link>
    </div>
  );
}


