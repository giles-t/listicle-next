"use client";

import React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "../utils";

interface IndicatorProps extends React.HTMLAttributes<HTMLDivElement> { className?: string; }
const Indicator = React.forwardRef<HTMLDivElement, IndicatorProps>(function Indicator({ className, ...otherProps }, ref) {
  return <ProgressPrimitive.Indicator className={cn("h-full rounded-full bg-brand-600 transition-all", className)} ref={ref} {...otherProps} />;
});

interface ProgressRootProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number; className?: string;
}

const ProgressRoot = React.forwardRef<HTMLDivElement, ProgressRootProps>(
  function ProgressRoot({ value = 0, className, ...otherProps }, ref) {
    return (
      <ProgressPrimitive.Root value={value}
        className={cn("flex h-2 w-full overflow-hidden rounded-full bg-neutral-100", className)} ref={ref} {...otherProps}
      >
        <Indicator style={{ width: `${value}%` }} />
      </ProgressPrimitive.Root>
    );
  }
);

export const Progress = Object.assign(ProgressRoot, { Indicator });
