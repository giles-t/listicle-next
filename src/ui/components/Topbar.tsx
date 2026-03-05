"use client";

import React from "react";
import { cn } from "../utils";

interface NavItemProps extends React.HTMLAttributes<HTMLDivElement> { selected?: boolean; icon?: React.ReactNode; children?: React.ReactNode; className?: string; }
const NavItem = React.forwardRef<HTMLDivElement, NavItemProps>(
  function NavItem({ selected = false, icon = null, children, className, ...otherProps }, ref) {
    return (
      <div className={cn("group cursor-pointer items-center justify-center gap-2 rounded-md px-2 py-1 flex", className)} ref={ref} {...otherProps}>
        {icon ? <span className={cn("text-body font-body text-subtext-color group-hover:text-default-font shrink-0 [&>svg]:h-[1em] [&>svg]:w-[1em]", { "text-default-font": selected })}>{icon}</span> : null}
        {children ? <span className={cn("text-body font-body text-subtext-color group-hover:text-default-font", { "text-body-bold font-body-bold text-default-font": selected })}>{children}</span> : null}
      </div>
    );
  }
);

interface TopbarRootProps extends React.HTMLAttributes<HTMLElement> { leftSlot?: React.ReactNode; centerSlot?: React.ReactNode; rightSlot?: React.ReactNode; className?: string; }
const TopbarRoot = React.forwardRef<HTMLElement, TopbarRootProps>(
  function TopbarRoot({ leftSlot, centerSlot, rightSlot, className, ...otherProps }, ref) {
    return (
      <nav className={cn("flex w-full items-center gap-4 border-b border-solid border-neutral-border bg-default-background px-4 py-4", className)} ref={ref} {...otherProps}>
        {leftSlot ? <div className="flex grow shrink-0 basis-0 items-center gap-2">{leftSlot}</div> : null}
        {centerSlot ? <div className="flex grow shrink-0 basis-0 items-center justify-center gap-1">{centerSlot}</div> : null}
        {rightSlot ? <div className="flex grow shrink-0 basis-0 items-center justify-end gap-2">{rightSlot}</div> : null}
      </nav>
    );
  }
);

export const Topbar = Object.assign(TopbarRoot, { NavItem });
