import { SkeletonText } from "@/ui/components/SkeletonText";
import { SkeletonCircle } from "@/ui/components/SkeletonCircle";

export default function Loading() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <SkeletonText size="header" className="w-72" />
          <SkeletonText size="default" className="w-96 max-w-full" />
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <div className="h-10 w-32 rounded-md bg-neutral-200 animate-pulse" />
          <div className="h-10 w-28 rounded-md bg-neutral-200 animate-pulse" />
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="flex flex-1 min-w-[140px] items-center gap-3 rounded-lg border border-solid border-neutral-border p-4"
          >
            <SkeletonCircle size="default" />
            <div className="flex flex-col gap-1">
              <SkeletonText size="subheader" className="w-12" />
              <SkeletonText size="label" className="w-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="h-8 w-24 rounded-md bg-neutral-200 animate-pulse"
          />
        ))}
      </div>

      {/* Recent Lists */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <SkeletonText size="subheader" className="w-32" />
          <SkeletonText size="label" className="w-16" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-3 rounded-lg border border-solid border-neutral-border p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <SkeletonText size="default" className="w-3/4" />
                <div className="h-8 w-8 rounded bg-neutral-200 animate-pulse" />
              </div>
              <SkeletonText size="label" className="w-full" />
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-solid border-neutral-100">
                <div className="flex items-center gap-3">
                  <SkeletonText size="label" className="w-8" />
                  <SkeletonText size="label" className="w-8" />
                  <SkeletonText size="label" className="w-8" />
                </div>
                <SkeletonText size="label" className="w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
