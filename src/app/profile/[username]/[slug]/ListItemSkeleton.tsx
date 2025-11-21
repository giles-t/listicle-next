import { SkeletonText } from "@/ui/components/SkeletonText";

export function ListItemSkeleton() {
  return (
    <div className="flex w-full flex-col items-start gap-4">
      <SkeletonText className="h-8 w-2/3" />
      <div className="flex w-full flex-col gap-2">
        <SkeletonText className="h-4 w-full" />
        <SkeletonText className="h-4 w-full" />
        <SkeletonText className="h-4 w-5/6" />
      </div>
      <div className="flex w-full items-start justify-between border border-solid border-neutral-border px-1 py-1">
        <div className="flex items-center gap-2">
          <SkeletonText className="h-8 w-8" />
          <SkeletonText className="h-8 w-8" />
          <SkeletonText className="h-8 w-8" />
          <SkeletonText className="h-8 w-8" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonText className="h-8 w-8" />
          <SkeletonText className="h-8 w-8" />
          <SkeletonText className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

