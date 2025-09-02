import React from "react";

export default function ProfileLoading() {
  return (
    <div className="container max-w-none flex h-full w-full flex-col items-center gap-6 bg-default-background py-12 overflow-auto">
      <div className="flex w-full max-w-[768px] flex-col items-start gap-12">
        {/* Profile header skeleton */}
        <div className="flex w-full flex-col items-start gap-4 animate-pulse">
          <div className="flex w-full items-start justify-between">
            <div className="w-24 h-24 bg-gray-200 rounded-full" />
            <div className="w-20 h-10 bg-gray-200 rounded" />
          </div>
          <div className="flex w-full flex-col items-start gap-2">
            <div className="w-48 h-8 bg-gray-200 rounded" />
            <div className="w-32 h-4 bg-gray-200 rounded" />
            <div className="w-64 h-4 bg-gray-200 rounded" />
            <div className="w-full max-w-md h-16 bg-gray-200 rounded mt-2" />
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-10 h-10 bg-gray-200 rounded" />
            ))}
          </div>
        </div>

        {/* Lists section skeleton */}
        <div className="flex w-full flex-col items-start gap-4 animate-pulse">
          <div className="flex w-full items-center justify-between">
            <div className="w-32 h-6 bg-gray-200 rounded" />
            <div className="w-16 h-4 bg-gray-200 rounded" />
          </div>
          <div className="flex w-full flex-wrap items-start gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex-1 min-w-[300px] max-w-[350px]">
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-3" />
                <div className="w-3/4 h-5 bg-gray-200 rounded mb-2" />
                <div className="w-full h-4 bg-gray-200 rounded mb-2" />
                <div className="w-1/2 h-4 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 