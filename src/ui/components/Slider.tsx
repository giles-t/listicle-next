"use client";

import React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "../utils";

interface SliderRootProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number[]; onValueChange?: (value: number[]) => void; onValueCommit?: (value: number[]) => void; className?: string;
  min?: number; max?: number; step?: number;
}

const SliderRoot = React.forwardRef<HTMLDivElement, SliderRootProps>(
  function SliderRoot({ value, onValueChange, onValueCommit, className, min, max, step, ...otherProps }, ref) {
    return (
      <SliderPrimitive.Root value={value} onValueChange={onValueChange} onValueCommit={onValueCommit} min={min} max={max} step={step}
        className={cn("relative flex w-full touch-none items-center select-none", className)} ref={ref} {...otherProps}
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-neutral-200">
          <SliderPrimitive.Range className="absolute h-full bg-brand-600" />
        </SliderPrimitive.Track>
        {(value || [0]).map((_, i) => (
          <SliderPrimitive.Thumb key={i} className="block h-4 w-4 rounded-full bg-white border border-neutral-200 shadow-sm transition-colors hover:border-brand-600 focus-visible:outline-none" />
        ))}
      </SliderPrimitive.Root>
    );
  }
);

export const Slider = SliderRoot;
