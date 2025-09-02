"use client";

import React from "react";
import { SkeletonText } from "@/ui/components/SkeletonText";
import { SkeletonCircle } from "@/ui/components/SkeletonCircle";

export default function Loading() {
  return (
    <div className="flex h-full w-full flex-col items-start bg-default-background">
      <div className="flex w-full items-center gap-2 border-b border-solid border-neutral-border px-4 py-3">
        <div className="flex grow shrink-0 basis-0 items-center gap-2">
          <SkeletonCircle />
          <SkeletonText className="w-20" size="label" />
        </div>
        <div className="flex grow shrink-0 basis-0 items-center justify-end gap-2">
          <SkeletonCircle />
          <SkeletonText className="w-20" size="label" />
        </div>
      </div>
      <div className="container max-w-none flex w-full flex-col items-start gap-12 bg-default-background py-12">
        <div className="flex w-full flex-col items-center gap-8 px-4">
          <div className="flex w-full max-w-[768px] flex-col items-start gap-4">
            <SkeletonText size="header" />
            <SkeletonText size="subheader" className="max-w-[75%]" />
          </div>
        </div>
        <div className="flex w-full flex-col items-center gap-8 px-4">
          <div className="flex w-full max-w-[768px] flex-col items-start gap-4">
            <SkeletonText size="section-header" className="max-w-[90%]" />
            <SkeletonText size="subheader" className="max-w-[80%]" />
          </div>
          <div className="flex w-full max-w-[768px] flex-col items-start gap-4">
            <SkeletonText size="section-header" className="max-w-[85%]" />
            <SkeletonText size="subheader" className="max-w-[70%]" />
          </div>
          <div className="flex w-full max-w-[768px] flex-col items-start gap-4">
            <SkeletonText size="section-header" className="max-w-[60%]" />
            <SkeletonText size="subheader" className="max-w-[65%]" />
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-center gap-2 px-1 py-1">
          <SkeletonText className="h-12 max-w-[140px] rounded-full" />
        </div>
      </div>
    </div>
  );
}
