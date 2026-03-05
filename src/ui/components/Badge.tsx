"use client";

import React from "react";
import { cn } from "../utils";

interface BadgeRootProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "brand" | "neutral" | "error" | "warning" | "success";
  icon?: React.ReactNode;
  children?: React.ReactNode;
  iconRight?: React.ReactNode;
  className?: string;
}

const BadgeRoot = React.forwardRef<HTMLDivElement, BadgeRootProps>(
  function BadgeRoot(
    { variant = "brand", icon = null, children, iconRight = null, className, ...otherProps }: BadgeRootProps,
    ref
  ) {
    const colorMap = {
      brand: "border-brand-100 bg-brand-100 text-brand-800",
      neutral: "border-neutral-100 bg-neutral-100 text-neutral-700",
      error: "border-error-100 bg-error-100 text-error-800",
      warning: "border-warning-100 bg-warning-100 text-warning-800",
      success: "border-success-100 bg-success-100 text-success-800",
    };
    const iconColorMap = {
      brand: "text-brand-700",
      neutral: "text-neutral-700",
      error: "text-error-700",
      warning: "text-warning-800",
      success: "text-success-800",
    };
    return (
      <div
        className={cn(
          "flex h-6 items-center gap-1 rounded-md border border-solid px-2",
          colorMap[variant],
          className
        )}
        ref={ref}
        {...otherProps}
      >
        {icon ? <span className={cn("text-caption font-caption shrink-0 [&>svg]:h-[1em] [&>svg]:w-[1em]", iconColorMap[variant])}>{icon}</span> : null}
        {children ? <span className="whitespace-nowrap text-caption font-caption">{children}</span> : null}
        {iconRight ? <span className={cn("text-caption font-caption shrink-0 [&>svg]:h-[1em] [&>svg]:w-[1em]", iconColorMap[variant])}>{iconRight}</span> : null}
      </div>
    );
  }
);

export const Badge = BadgeRoot;
