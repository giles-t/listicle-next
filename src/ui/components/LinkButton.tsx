"use client";

import React from "react";
import { cn } from "../utils";

interface LinkButtonRootProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  disabled?: boolean;
  variant?: "brand" | "neutral" | "inverse";
  size?: "large" | "medium" | "small";
  icon?: React.ReactNode;
  children?: React.ReactNode;
  iconRight?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

const LinkButtonRoot = React.forwardRef<HTMLButtonElement, LinkButtonRootProps>(
  function LinkButtonRoot(
    { disabled = false, variant = "neutral", size = "medium", icon = null, children, iconRight = null, className, type = "button", ...otherProps }: LinkButtonRootProps,
    ref
  ) {
    const colorClass = {
      brand: "text-brand-700 hover:text-brand-700",
      neutral: "text-neutral-700 hover:text-brand-700",
      inverse: "text-white hover:text-white",
    }[variant];

    return (
      <button
        className={cn("group flex cursor-pointer items-center gap-1 border-none bg-transparent text-left disabled:text-neutral-400", className)}
        ref={ref} type={type} disabled={disabled} {...otherProps}
      >
        {icon ? (
          <span className={cn("shrink-0 [&>svg]:h-[1em] [&>svg]:w-[1em] group-disabled:text-neutral-400", { "text-caption font-caption": size === "small", "text-heading-3 font-heading-3": size === "large" }, colorClass)}>{icon}</span>
        ) : null}
        {children ? (
          <span className={cn("group-hover:underline group-disabled:text-neutral-400 group-disabled:no-underline", { "text-caption font-caption": size === "small", "text-body font-body": size === "medium", "text-heading-3 font-heading-3": size === "large" }, colorClass)}>{children}</span>
        ) : null}
        {iconRight ? (
          <span className={cn("shrink-0 [&>svg]:h-[1em] [&>svg]:w-[1em] group-disabled:text-neutral-400", { "text-caption font-caption": size === "small", "text-heading-3 font-heading-3": size === "large" }, colorClass)}>{iconRight}</span>
        ) : null}
      </button>
    );
  }
);

export const LinkButton = LinkButtonRoot;
