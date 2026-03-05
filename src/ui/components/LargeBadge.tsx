"use client";

import React from "react";
import { cn } from "../utils";

interface LargeBadgeRootProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode; children?: React.ReactNode; className?: string;
}

const LargeBadgeRoot = React.forwardRef<HTMLDivElement, LargeBadgeRootProps>(
  function LargeBadgeRoot({ icon, children, className, ...otherProps }, ref) {
    return (
      <div className={cn("flex items-center gap-2 rounded-full border border-solid border-neutral-border px-3 py-1", className)} ref={ref} {...otherProps}>
        {icon ? <span className="shrink-0 [&>svg]:h-[1em] [&>svg]:w-[1em] text-default-font">{icon}</span> : null}
        {children ? <span className="text-body font-body text-default-font">{children}</span> : null}
      </div>
    );
  }
);

export const LargeBadge = LargeBadgeRoot;
