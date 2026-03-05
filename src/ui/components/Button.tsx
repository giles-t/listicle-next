"use client";

import React from "react";
import { cn } from "../utils";

interface ButtonRootProps
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
  children?: React.ReactNode;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

const ButtonRoot = React.forwardRef<HTMLButtonElement, ButtonRootProps>(
  function ButtonRoot(
    {
      disabled = false,
      variant = "brand-primary",
      size = "medium",
      children,
      icon = null,
      iconRight = null,
      loading = false,
      className,
      type = "button",
      ...otherProps
    }: ButtonRootProps,
    ref
  ) {
    const iconColorClass = {
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
          "group flex h-8 cursor-pointer items-center justify-center gap-2 rounded-md border-none bg-brand-600 px-3 text-left transition-colors hover:bg-brand-500 active:bg-brand-600 disabled:cursor-default disabled:bg-neutral-200 hover:disabled:bg-neutral-200",
          {
            "h-6 w-auto gap-1 px-2 py-0": size === "small",
            "h-10 w-auto px-4 py-0": size === "large",
            "bg-transparent hover:bg-[#ffffff29] active:bg-[#ffffff3d]": variant === "inverse",
            "bg-transparent hover:bg-error-50 active:bg-error-100": variant === "destructive-tertiary",
            "bg-error-50 hover:bg-error-100 active:bg-error-50": variant === "destructive-secondary",
            "bg-error-600 hover:bg-error-500 active:bg-error-600": variant === "destructive-primary",
            "bg-transparent hover:bg-neutral-100 active:bg-neutral-200": variant === "neutral-tertiary",
            "border border-solid border-neutral-border bg-default-background hover:bg-neutral-50 active:bg-default-background": variant === "neutral-secondary",
            "bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-100": variant === "neutral-primary",
            "bg-transparent hover:bg-brand-50 active:bg-brand-100": variant === "brand-tertiary",
            "bg-brand-50 hover:bg-brand-100 active:bg-brand-50": variant === "brand-secondary",
          },
          className
        )}
        ref={ref}
        type={type}
        disabled={disabled}
        {...otherProps}
      >
        {icon ? (
          <span className={cn("shrink-0 [&>svg]:h-[1em] [&>svg]:w-[1em]", { hidden: loading, "text-body font-body": size === "small", "text-heading-3 font-heading-3": size === "large" }, iconColorClass)}>
            {icon}
          </span>
        ) : null}
        {loading ? (
          <span className={cn("h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent", { "h-3 w-3": size === "small" }, iconColorClass)} />
        ) : null}
        {children ? (
          <span className={cn("whitespace-nowrap text-body-bold font-body-bold group-disabled:text-neutral-400", { hidden: loading, "text-caption-bold font-caption-bold": size === "small", "text-body-bold font-body-bold": size === "large" }, iconColorClass)}>
            {children}
          </span>
        ) : null}
        {iconRight ? (
          <span className={cn("shrink-0 [&>svg]:h-[1em] [&>svg]:w-[1em]", { "text-body font-body": size === "small", "text-heading-3 font-heading-3": size === "large" }, iconColorClass)}>
            {iconRight}
          </span>
        ) : null}
      </button>
    );
  }
);

export const Button = ButtonRoot;
