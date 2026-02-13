import { SkeletonText } from "@/ui/components/SkeletonText";

export default function Loading() {
  return (
    <div className="container max-w-none flex h-full w-full flex-col items-start gap-8 bg-default-background py-12 overflow-auto">
        {/* Header skeleton */}
        <div className="flex w-full items-center justify-between mobile:flex-col mobile:flex-nowrap mobile:items-start mobile:justify-start mobile:gap-4">
          <div className="flex flex-col items-start gap-2">
            <SkeletonText className="w-48 h-8" />
            <SkeletonText className="w-80 h-4" />
          </div>
          <SkeletonText className="w-64 h-10" />
        </div>

        {/* Toolbar skeleton */}
        <div className="flex w-full flex-wrap items-center gap-2 border-b border-solid border-neutral-border py-2">
          <SkeletonText className="w-24 h-4" />
          <div className="flex-grow" />
          <SkeletonText className="w-32 h-8" />
          <SkeletonText className="w-20 h-8" />
        </div>

        {/* Category rows skeleton */}
        <div className="flex w-full flex-col items-start">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex w-full items-center gap-4 border-b border-solid border-neutral-border px-4 py-4"
            >
              <SkeletonText className="w-10 h-10 rounded-lg" />
              <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2">
                <SkeletonText className="w-32 h-5" />
                <SkeletonText className="w-64 h-4" />
              </div>
              <div className="flex items-center gap-6">
                <SkeletonText className="w-16 h-4" />
                <SkeletonText className="w-16 h-4" />
                <SkeletonText className="w-20 h-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
  );
}
