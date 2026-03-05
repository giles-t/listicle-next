"use client";

import React from "react";
import { cn } from "../utils";

interface ToastRootProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "brand" | "neutral" | "error" | "success";
  icon?: React.ReactNode; title?: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; className?: string;
}

const ToastRoot = React.forwardRef<HTMLDivElement, ToastRootProps>(
  function ToastRoot({ variant = "neutral", icon, title, description, actions, className, ...otherProps }, ref) {
    const colors = { brand: "border-brand-200", neutral: "border-neutral-200", error: "border-error-200", success: "border-success-200" }[variant];
    const iconColor = { brand: "text-brand-600", neutral: "text-neutral-600", error: "text-error-600", success: "text-success-600" }[variant];

    return (
      <div className={cn("flex w-80 items-start gap-3 rounded-md border border-solid bg-default-background px-4 py-3 shadow-lg", colors, className)} ref={ref} {...otherProps}>
        {icon ? <span className={cn("shrink-0 [&>svg]:h-[1em] [&>svg]:w-[1em] mt-0.5", iconColor)}>{icon}</span> : null}
        <div className="flex grow flex-col items-start gap-1">
          {title ? <span className="text-body-bold font-body-bold text-default-font">{title}</span> : null}
          {description ? <span className="text-body font-body text-subtext-color">{description}</span> : null}
          {actions ? <div className="flex items-center gap-2 pt-1">{actions}</div> : null}
        </div>
      </div>
    );
  }
);

export const Toast = ToastRoot;
