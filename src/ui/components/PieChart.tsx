"use client";

import React from "react";
import { cn } from "../utils";

interface PieChartRootProps extends React.HTMLAttributes<HTMLDivElement> {
  stacked?: boolean;
  className?: string;
}

const PieChartRoot = React.forwardRef<HTMLDivElement, PieChartRootProps>(
  function PieChartRoot({ className, ...otherProps }, ref) {
    return (
      <div
        className={cn("flex h-80 w-full items-center justify-center rounded-md border border-dashed border-neutral-300 bg-neutral-50 text-subtext-color", className)}
        ref={ref}
        {...otherProps}
      >
        <span className="text-body font-body">PieChart placeholder</span>
      </div>
    );
  }
);

export const PieChart = PieChartRoot;
