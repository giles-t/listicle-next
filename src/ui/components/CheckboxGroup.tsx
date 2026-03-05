"use client";

import React from "react";
import { cn } from "../utils";

interface CheckboxGroupRootProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode; helpText?: React.ReactNode; error?: boolean; horizontal?: boolean; children?: React.ReactNode; className?: string;
}

const CheckboxGroupRoot = React.forwardRef<HTMLDivElement, CheckboxGroupRootProps>(
  function CheckboxGroupRoot({ label, helpText, error = false, horizontal = false, children, className, ...otherProps }, ref) {
    return (
      <div className={cn("flex flex-col items-start gap-2", className)} ref={ref} {...otherProps}>
        {label ? <span className="text-caption-bold font-caption-bold text-default-font">{label}</span> : null}
        <div className={cn("flex flex-col items-start gap-2", { "flex-row flex-wrap gap-4": horizontal })}>{children}</div>
        {helpText ? <span className={cn("text-caption font-caption text-subtext-color", { "text-error-700": error })}>{helpText}</span> : null}
      </div>
    );
  }
);

export const CheckboxGroup = CheckboxGroupRoot;
