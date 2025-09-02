import React from "react";
import { SkeletonText } from "@/ui/components/SkeletonText";
import { SkeletonCircle } from "@/ui/components/SkeletonCircle";

export default function Loading() {
  return (
    <div className="flex w-full flex-col items-start gap-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="flex w-full items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4">
          <div className="h-20 w-20 flex-none rounded-sm bg-neutral-200" />
          <div className="flex flex-col items-start justify-center gap-2 self-stretch grow">
            <SkeletonText size="subheader" className="max-w-[240px]" />
            <SkeletonText size="label" className="max-w-[160px]" />
            <SkeletonText size="label" className="max-w-[320px]" />
          </div>
          <div className="flex grow shrink-0 basis-0 items-center justify-end gap-2 self-stretch">
            <div className="h-6 w-16 rounded-md bg-neutral-200" />
            <div className="h-8 w-8 rounded-md bg-neutral-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
