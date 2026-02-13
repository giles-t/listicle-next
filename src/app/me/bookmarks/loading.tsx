import React from "react";
import { SkeletonText } from "@/ui/components/SkeletonText";

export default function Loading() {
  return (
    <div className="flex w-full flex-col items-start gap-6 px-6 py-6 mobile:px-4 mobile:py-4">
      {/* Header skeleton */}
      <div className="flex w-full items-end justify-between">
        <div className="flex flex-col items-start gap-2">
          <div className="h-8 w-40 rounded bg-neutral-200" />
          <div className="h-5 w-80 rounded bg-neutral-200" />
        </div>
      </div>

      {/* Filters skeleton */}
      <div className="flex w-full flex-col items-start gap-4">
        <div className="flex w-full items-center justify-between border-b border-solid border-neutral-border pb-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-64 rounded-md bg-neutral-200" />
            <div className="h-10 w-32 rounded-md bg-neutral-200" />
            <div className="h-10 w-32 rounded-md bg-neutral-200" />
          </div>
          <div className="flex items-center gap-2 mobile:hidden">
            <div className="h-10 w-20 rounded-md bg-neutral-200" />
          </div>
        </div>

        {/* Card grid skeleton */}
        <div className="w-full items-start gap-6 grid grid-cols-3 mobile:grid-cols-1 tablet:grid-cols-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col items-start overflow-hidden rounded-md border border-solid border-neutral-border bg-default-background"
            >
              <div className="w-full h-48 bg-neutral-200" />
              <div className="flex w-full flex-col items-start gap-3 px-4 py-4">
                <div className="h-6 w-20 rounded bg-neutral-200" />
                <div className="flex w-full flex-col items-start gap-1">
                  <SkeletonText size="subheader" className="max-w-[200px]" />
                  <SkeletonText size="label" className="max-w-full" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-4 w-12 rounded bg-neutral-200" />
                  <div className="h-4 w-12 rounded bg-neutral-200" />
                  <div className="h-4 w-12 rounded bg-neutral-200" />
                </div>
                <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-neutral-200" />
                    <div className="h-4 w-24 rounded bg-neutral-200" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-16 rounded bg-neutral-200" />
                    <div className="h-6 w-6 rounded bg-neutral-200" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
