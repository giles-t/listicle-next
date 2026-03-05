import React from "react";
import { SkeletonText } from "@/ui/components/SkeletonText";

export default function Loading() {
  return (
    <div className="flex w-full flex-col items-start gap-6">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div
          key={idx}
          className="flex w-full overflow-hidden rounded-lg bg-default-background shadow-md items-stretch mobile:flex-col mobile:flex-nowrap mobile:gap-0"
        >
          <div className="flex w-80 flex-none bg-neutral-100 mobile:h-48 mobile:w-full mobile:flex-none" />
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4 px-6 py-6">
            <div className="flex w-full items-start justify-between">
              <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2">
                <SkeletonText size="subheader" className="max-w-[280px]" />
                <SkeletonText size="label" className="max-w-[180px]" />
              </div>
              <div className="h-8 w-8 rounded-md bg-neutral-100" />
            </div>
            <SkeletonText size="body" className="max-w-[400px]" />
            <div className="flex items-center gap-4 pt-2">
              <SkeletonText size="label" className="w-16" />
              <SkeletonText size="label" className="w-12" />
              <SkeletonText size="label" className="w-10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
