import { SkeletonText } from "@/ui/components/SkeletonText";
import { SkeletonCircle } from "@/ui/components/SkeletonCircle";
import { ListItemSkeleton } from "./ListItemSkeleton";

export default function ViewListLoading() {
  return (
    <div className="flex h-full w-full flex-col items-start bg-default-background page-scalable text-lg">
      {/* Header Section Skeleton */}
      <div className="container max-w-none flex w-full flex-col items-start gap-8 bg-default-background py-12">
        <div className="flex w-full flex-col items-center gap-6 px-4">
          <div className="flex w-full max-w-[768px] flex-col items-start gap-4">
            <SkeletonText className="h-10 w-full" />
            <SkeletonText className="h-6 w-3/4" />
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-4 px-4">
          <div className="flex w-full max-w-[768px] flex-col items-start gap-4">
            <div className="flex w-full items-center gap-3">
              <SkeletonCircle />
              <div className="flex flex-col gap-2 flex-1">
                <SkeletonText className="h-5 w-32" />
                <SkeletonText className="h-4 w-48" />
              </div>
            </div>
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-4">
                <SkeletonText className="h-9 w-20" />
                <SkeletonText className="h-9 w-20" />
                <SkeletonText className="h-9 w-20" />
              </div>
              <div className="flex items-center gap-2">
                <SkeletonText className="h-9 w-9" />
                <SkeletonText className="h-9 w-9" />
                <SkeletonText className="h-9 w-9" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* List Items Skeleton */}
      <div className="container max-w-none flex w-full flex-col items-start gap-12 bg-default-background pb-12">
        <div className="flex w-full flex-col items-center gap-8 px-4">
          <div className="flex w-full max-w-[768px] flex-col items-start gap-12">
            {[1, 2, 3].map((i) => (
              <ListItemSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

