"use client";

import React from "react";
import { cn } from "../utils";

interface IconWithBackgroundRootProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "brand" | "neutral" | "error" | "success" | "warning";
  size?: "x-large" | "large" | "medium" | "small" | "x-small";
  icon?: React.ReactNode; square?: boolean; className?: string;
}

const IconWithBackgroundRoot = React.forwardRef<HTMLDivElement, IconWithBackgroundRootProps>(
  function IconWithBackgroundRoot({ variant = "brand", size = "medium", icon, square = false, className, ...otherProps }, ref) {
    const bgColor = { brand: "bg-brand-100", neutral: "bg-neutral-100", error: "bg-error-100", success: "bg-success-100", warning: "bg-warning-100" }[variant];
    const iconColor = { brand: "text-brand-800", neutral: "text-neutral-800", error: "text-error-800", success: "text-success-800", warning: "text-warning-800" }[variant];
    const sizeClass = { "x-large": "h-16 w-16", large: "h-12 w-12", medium: "h-8 w-8", small: "h-6 w-6", "x-small": "h-5 w-5" }[size];

    return (
      <div className={cn("flex items-center justify-center overflow-hidden", sizeClass, bgColor, square ? "rounded-md" : "rounded-full", className)} ref={ref} {...otherProps}>
        {icon ? <span className={cn("shrink-0 [&>svg]:h-[1em] [&>svg]:w-[1em]", iconColor)}>{icon}</span> : null}
      </div>
    );
  }
);

export const IconWithBackground = IconWithBackgroundRoot;
