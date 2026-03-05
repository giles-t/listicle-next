"use client";

import React from "react";
import { cn } from "../utils";

interface FilterChipRootProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean; icon?: React.ReactNode; image?: string; children?: React.ReactNode; className?: string;
}

const FilterChipRoot = React.forwardRef<HTMLDivElement, FilterChipRootProps>(
  function FilterChipRoot({ selected = false, icon, image, children, className, ...otherProps }, ref) {
    return (
      <div
        className={cn(
          "flex h-8 cursor-pointer items-center gap-2 rounded-full border border-solid border-neutral-border bg-default-background px-3 transition-colors hover:bg-neutral-50",
          { "border-brand-600 bg-brand-50 hover:bg-brand-100": selected },
          className
        )}
        ref={ref} {...otherProps}
      >
        {icon ? <span className={cn("shrink-0 [&>svg]:h-[1em] [&>svg]:w-[1em] text-subtext-color", { "text-brand-600": selected })}>{icon}</span> : null}
        {image ? <img className="h-5 w-5 rounded-full object-cover" src={image} /> : null}
        {children ? <span className={cn("text-body font-body text-default-font whitespace-nowrap", { "text-brand-700": selected })}>{children}</span> : null}
      </div>
    );
  }
);

export const FilterChip = FilterChipRoot;
