"use client";

import React from "react";
import { cn } from "../utils";

interface AreaChartRootProps extends React.HTMLAttributes<HTMLDivElement> {
  stacked?: boolean;
  className?: string;
}

const AreaChartRoot = React.forwardRef<HTMLDivElement, AreaChartRootProps>(
  function AreaChartRoot({ className, ...otherProps }, ref) {
    return (
      <div
        className={cn("flex h-80 w-full items-center justify-center rounded-md border border-dashed border-neutral-300 bg-neutral-50 text-subtext-color", className)}
        ref={ref}
        {...otherProps}
      >
        <span className="text-body font-body">AreaChart placeholder</span>
      </div>
    );
  }
);

export const AreaChart = AreaChartRoot;
