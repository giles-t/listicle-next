"use client";

import React from "react";
import { cn } from "../utils";

interface NavItemProps extends React.HTMLAttributes<HTMLDivElement> { selected?: boolean; className?: string; }
const NavItem = React.forwardRef<HTMLDivElement, NavItemProps>(function NavItem({ selected = false, className, ...otherProps }, ref) {
  return (
    <div className={cn("group cursor-pointer items-start gap-4 rounded-md px-2 py-1", className)} ref={ref} {...otherProps}>
      <span className={cn("text-body-bold font-body-bold text-subtext-color group-hover:text-default-font", { "text-default-font": selected })}>Label</span>
    </div>
  );
});

interface TopbarWithSearchRootProps extends React.HTMLAttributes<HTMLElement> { leftSlot?: React.ReactNode; rightSlot?: React.ReactNode; className?: string; }
const TopbarWithSearchRoot = React.forwardRef<HTMLElement, TopbarWithSearchRootProps>(
  function TopbarWithSearchRoot({ leftSlot, rightSlot, className, ...otherProps }, ref) {
    return (
      <nav className={cn("flex w-full items-center gap-4 bg-default-background px-6 py-4", className)} ref={ref} {...otherProps}>
        {leftSlot ? <div className="flex grow shrink-0 basis-0 items-center gap-6">{leftSlot}</div> : null}
        {rightSlot ? <div className="flex grow shrink-0 basis-0 items-center justify-end gap-4">{rightSlot}</div> : null}
      </nav>
    );
  }
);

export const TopbarWithSearch = Object.assign(TopbarWithSearchRoot, { NavItem });
