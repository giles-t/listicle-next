"use client";

import React from "react";
import { Plus } from "lucide-react";
import { cn } from "../utils";

interface IconButtonRootProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  disabled?: boolean;
  variant?:
    | "brand-primary"
    | "brand-secondary"
    | "brand-tertiary"
    | "neutral-primary"
    | "neutral-secondary"
    | "neutral-tertiary"
    | "destructive-primary"
    | "destructive-secondary"
    | "destructive-tertiary"
    | "inverse";
  size?: "large" | "medium" | "small";
  icon?: React.ReactNode;
  loading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

const IconButtonRoot = React.forwardRef<HTMLButtonElement, IconButtonRootProps>(
  function IconButtonRoot(
    {
      disabled = false,
      variant = "neutral-tertiary",
      size = "medium",
      icon = <Plus />,
      loading = false,
      className,
      type = "button",
      ...otherProps
    }: IconButtonRootProps,
    ref
  ) {
    const iconColor = {
      "brand-primary": "text-white",
      "brand-secondary": "text-brand-700",
      "brand-tertiary": "text-brand-700",
      "neutral-primary": "text-neutral-700",
      "neutral-secondary": "text-neutral-700",
      "neutral-tertiary": "text-neutral-700",
      "destructive-primary": "text-white",
      "destructive-secondary": "text-error-700",
      "destructive-tertiary": "text-error-700",
      inverse: "text-white",
    }[variant];

    return (
      <button
        className={cn(
          "group flex h-8 w-8 cursor-pointer items-center justify-center gap-2 rounded-md border-none bg-transparent text-left transition-colors hover:bg-neutral-100 active:bg-neutral-50 disabled:cursor-default disabled:bg-neutral-100",
          {
            "h-6 w-6": size === "small",
            "h-10 w-10": size === "large",
            "hover:bg-[#ffffff29] active:bg-[#ffffff3d]": variant === "inverse",
            "hover:bg-error-50 active:bg-error-100": variant === "destructive-tertiary",
            "bg-error-50 hover:bg-error-100 active:bg-error-50": variant === "destructive-secondary",
            "bg-error-600 hover:bg-error-500 active:bg-error-600": variant === "destructive-primary",
            "border border-solid border-neutral-border bg-white hover:bg-neutral-100 active:bg-white": variant === "neutral-secondary",
            "bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-100": variant === "neutral-primary",
            "hover:bg-brand-50 active:bg-brand-100": variant === "brand-tertiary",
            "bg-brand-50 hover:bg-brand-100 active:bg-brand-50": variant === "brand-secondary",
            "bg-brand-600 hover:bg-brand-500 active:bg-brand-600": variant === "brand-primary",
          },
          className
        )}
        ref={ref}
        type={type}
        disabled={disabled}
        {...otherProps}
      >
        {loading ? (
          <span className={cn("h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent", { "h-3 w-3": size === "small" }, iconColor)} />
        ) : icon ? (
          <span className={cn("shrink-0 [&>svg]:h-[1em] [&>svg]:w-[1em] group-disabled:text-neutral-400", { "text-body font-body": size === "small", "text-heading-3 font-heading-3": size === "large" }, iconColor)}>
            {icon}
          </span>
        ) : null}
      </button>
    );
  }
);

export const IconButton = IconButtonRoot;
