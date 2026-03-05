"use client";

import React from "react";
import { cn } from "../utils";

interface AvatarRootProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "brand" | "neutral" | "error" | "success" | "warning";
  size?: "x-large" | "large" | "medium" | "small" | "x-small";
  children?: React.ReactNode;
  image?: string;
  square?: boolean;
  className?: string;
}

const AvatarRoot = React.forwardRef<HTMLDivElement, AvatarRootProps>(
  function AvatarRoot(
    { variant = "brand", size = "medium", children, image, square = false, className, ...otherProps }: AvatarRootProps,
    ref
  ) {
    return (
      <div
        className={cn(
          "flex h-8 w-8 flex-col items-center justify-center gap-2 overflow-hidden rounded-full bg-brand-100 relative",
          {
            "rounded-md": square,
            "h-5 w-5": size === "x-small",
            "h-6 w-6": size === "small",
            "h-12 w-12": size === "large",
            "h-16 w-16": size === "x-large",
            "bg-warning-100": variant === "warning",
            "bg-success-100": variant === "success",
            "bg-error-100": variant === "error",
            "bg-neutral-100": variant === "neutral",
          },
          className
        )}
        ref={ref}
        {...otherProps}
      >
        {children ? (
          <span
            className={cn(
              "line-clamp-1 w-full text-[14px] font-[500] leading-[14px] text-brand-800 text-center absolute",
              {
                "text-[10px] leading-[10px]": size === "x-small" || size === "small",
                "text-[18px] leading-[18px]": size === "large",
                "text-[24px] leading-[24px]": size === "x-large",
                "text-warning-800": variant === "warning",
                "text-success-800": variant === "success",
                "text-error-800": variant === "error",
                "text-neutral-800": variant === "neutral",
              }
            )}
          >
            {children}
          </span>
        ) : null}
        {image ? (
          <img
            className={cn(
              "h-8 w-8 flex-none object-cover absolute",
              {
                "h-5 w-5": size === "x-small",
                "h-6 w-6": size === "small",
                "h-12 w-12": size === "large",
                "h-16 w-16": size === "x-large",
              }
            )}
            src={image}
          />
        ) : null}
      </div>
    );
  }
);

export const Avatar = AvatarRoot;
