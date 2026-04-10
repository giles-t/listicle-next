import { SkeletonText } from "@/ui/components/SkeletonText";
import { SkeletonCircle } from "@/ui/components/SkeletonCircle";

export default function Loading() {
  return (
    <div className="flex h-full w-full flex-col items-start bg-default-background">
      {/* Top bar */}
      <div className="flex w-full items-center justify-between border-b border-solid border-neutral-border px-6 py-4">
        <div className="h-10 w-20 rounded-md bg-neutral-200 animate-pulse" />
        <div className="h-10 w-24 rounded-md bg-neutral-200 animate-pulse" />
      </div>

      <div className="flex w-full grow shrink-0 basis-0 items-start mobile:flex-col mobile:flex-nowrap mobile:gap-0">
        {/* Left column - Form */}
        <div className="flex max-w-[576px] flex-col items-start gap-8 px-12 py-12 mobile:max-w-none">
          <div className="flex w-full flex-col items-start gap-2">
            <SkeletonText size="header" className="w-56" />
            <SkeletonText size="default" className="w-80 max-w-full" />
          </div>
          <div className="flex w-full flex-col items-start gap-6">
            {/* Title field skeleton */}
            <div className="flex w-full flex-col items-start gap-2">
              <SkeletonText size="label" className="w-10" />
              <div className="h-10 w-full rounded-md bg-neutral-200 animate-pulse" />
              <SkeletonText size="label" className="w-72 max-w-full" />
            </div>
            {/* Subtitle field skeleton */}
            <div className="flex w-full flex-col items-start gap-2">
              <SkeletonText size="label" className="w-28" />
              <div className="h-24 w-full rounded-md bg-neutral-200 animate-pulse" />
              <SkeletonText size="label" className="w-64 max-w-full" />
            </div>
            {/* List type skeleton */}
            <div className="flex w-full flex-col items-start gap-4">
              <SkeletonText size="default" className="w-16" />
              <div className="flex w-full flex-col items-start gap-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex w-full items-center gap-4 rounded-md border border-solid border-neutral-border p-4"
                  >
                    <SkeletonCircle size="default" />
                    <div className="flex flex-col gap-1">
                      <SkeletonText size="default" className="w-24" />
                      <SkeletonText size="label" className="w-44" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Vertical divider */}
        <div className="flex w-px self-stretch flex-col items-center gap-2 bg-neutral-border mobile:hidden" />

        {/* Right column - Tips */}
        <div className="flex grow shrink-0 basis-0 flex-col items-start gap-8 bg-neutral-50 px-12 py-12">
          <div className="flex w-full flex-col items-start gap-2">
            <SkeletonText size="header" className="w-52" />
            <SkeletonText size="default" className="w-72 max-w-full" />
          </div>
          <div className="flex w-full flex-col items-start gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="flex w-full items-start gap-4">
                <SkeletonCircle size="default" />
                <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                  <SkeletonText size="default" className="w-40" />
                  <SkeletonText size="label" className="w-full max-w-xs" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
