import React from "react";
import { SkeletonText } from "@/ui/components/SkeletonText";
import { SkeletonCircle } from "@/ui/components/SkeletonCircle";

export default function NotificationsLoading() {
  return (
    <div className="container max-w-none flex h-full w-full flex-col items-start gap-8 bg-default-background py-12 overflow-auto">
      {/* Header skeleton */}
      <div className="flex w-full items-center justify-between mobile:flex-col mobile:flex-nowrap mobile:items-start mobile:justify-start mobile:gap-4">
        <div className="flex flex-col items-start gap-2">
          <SkeletonText size="header" className="w-48" />
          <SkeletonText size="default" className="w-72" />
        </div>
        <div className="h-10 w-36 rounded-md bg-neutral-200 animate-pulse" />
      </div>

      {/* Tabs skeleton */}
      <div className="flex items-start gap-1 border-b border-neutral-border w-full">
        <div className="h-10 w-12 rounded-t bg-neutral-200 animate-pulse" />
        <div className="h-10 w-20 rounded-t bg-neutral-200 animate-pulse" />
      </div>

      {/* Notification items skeleton */}
      <div className="flex w-full flex-col items-start">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="flex w-full items-center gap-4 border-b border-solid border-neutral-border bg-default-background px-4 py-4"
          >
            <SkeletonCircle size="default" />
            <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2">
              <SkeletonText size="default" className="w-3/4 max-w-md" />
              <SkeletonText size="label" className="w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
