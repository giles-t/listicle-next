import React from "react";

export default function SettingsLoading() {
  return (
    <div className="flex w-full max-w-[576px] flex-col items-start gap-12 animate-pulse">
      <div className="flex w-full flex-col items-start gap-1">
        <div className="w-48 h-8 bg-gray-200 rounded" />
        <div className="w-full max-w-md h-4 bg-gray-200 rounded" />
      </div>
      <div className="flex w-full flex-col items-start gap-6">
        <div className="w-32 h-6 bg-gray-200 rounded" />
        <div className="flex w-full flex-col items-start gap-4">
          <div className="w-16 h-4 bg-gray-200 rounded" />
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full" />
            <div className="flex flex-col items-start gap-2">
              <div className="w-32 h-10 bg-gray-200 rounded" />
              <div className="w-48 h-3 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
        <div className="w-full h-14 bg-gray-200 rounded" />
        <div className="w-full h-14 bg-gray-200 rounded" />
        <div className="w-full h-24 bg-gray-200 rounded" />
        <div className="w-full h-14 bg-gray-200 rounded" />
      </div>
      <div className="flex w-full flex-col items-start gap-6">
        <div className="w-24 h-6 bg-gray-200 rounded" />
        <div className="w-full h-14 bg-gray-200 rounded" />
        <div className="w-full h-14 bg-gray-200 rounded" />
        <div className="w-full h-14 bg-gray-200 rounded" />
        <div className="w-full h-14 bg-gray-200 rounded" />
        <div className="w-full h-14 bg-gray-200 rounded" />
        <div className="w-full h-14 bg-gray-200 rounded" />
      </div>
      <div className="flex w-full items-center justify-end gap-2">
        <div className="w-24 h-10 bg-gray-200 rounded" />
      </div>
    </div>
  );
} 