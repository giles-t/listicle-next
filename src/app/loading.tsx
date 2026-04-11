import { SkeletonText } from "@/ui/components/SkeletonText";
import { SkeletonCircle } from "@/ui/components/SkeletonCircle";

export default function Loading() {
  return (
    <div className="container max-w-none flex h-full w-full items-start gap-8 bg-default-background py-12 mobile:flex-col mobile:flex-nowrap mobile:gap-8">
      {/* Desktop Filter Sidebar skeleton */}
      <div className="flex w-64 shrink-0 flex-col items-start gap-6 mobile:hidden">
        <SkeletonText size="subheader" className="w-24" />
        <div className="flex w-full flex-col gap-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonText key={idx} size="default" className={idx % 2 === 0 ? "w-full" : "w-3/4"} />
          ))}
        </div>
        <div className="h-px w-full bg-neutral-border" />
        <SkeletonText size="subheader" className="w-20" />
        <div className="flex w-full flex-col gap-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <SkeletonText key={idx} size="default" className={idx % 2 === 0 ? "w-3/4" : "w-full"} />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex grow shrink-0 basis-0 flex-col items-start gap-8">
        {/* Header */}
        <div className="flex w-full flex-col items-start justify-center gap-2">
          <SkeletonText size="header" className="w-48" />
          <SkeletonText size="default" className="w-80 max-w-full" />
        </div>

        {/* List card skeletons */}
        <div className="flex w-full flex-col items-start gap-8">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="flex w-full items-start gap-6 rounded-md border border-solid border-neutral-border bg-default-background p-4"
            >
              {/* Image placeholder */}
              <div className="h-32 w-48 shrink-0 rounded-md bg-neutral-200 animate-pulse mobile:hidden" />
              {/* Content */}
              <div className="flex grow shrink-0 basis-0 flex-col items-start gap-3">
                <SkeletonText size="label" className="w-24" />
                <SkeletonText size="subheader" className="w-3/4" />
                <SkeletonText size="default" className="w-full" />
                <SkeletonText size="default" className="w-2/3" />
                <div className="flex w-full items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <SkeletonCircle size="small" />
                    <SkeletonText size="label" className="w-24" />
                  </div>
                  <div className="flex items-center gap-3">
                    <SkeletonText size="label" className="w-8" />
                    <SkeletonText size="label" className="w-8" />
                    <SkeletonText size="label" className="w-8" />
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
