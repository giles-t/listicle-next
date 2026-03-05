"use client";

import React from "react";
import { cn } from "../utils";

interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "completed" | "active"; firstStep?: boolean; lastStep?: boolean; stepNumber?: React.ReactNode; label?: React.ReactNode; className?: string;
}
const Step = React.forwardRef<HTMLDivElement, StepProps>(
  function Step({ variant = "default", firstStep, lastStep, stepNumber, label, className, ...otherProps }, ref) {
    return (
      <div className={cn("flex items-center gap-2", className)} ref={ref} {...otherProps}>
        {!firstStep ? <div className={cn("h-px w-8 bg-neutral-200", { "bg-brand-600": variant === "completed" })} /> : null}
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-neutral-200 text-caption-bold font-caption-bold text-neutral-400", {
          "border-brand-600 bg-brand-600 text-white": variant === "completed",
          "border-brand-600 text-brand-600": variant === "active",
        })}>{stepNumber}</div>
        {label ? <span className={cn("text-body font-body text-subtext-color whitespace-nowrap", { "text-default-font font-medium": variant === "active" || variant === "completed" })}>{label}</span> : null}
        {!lastStep ? <div className={cn("h-px w-8 bg-neutral-200", { "bg-brand-600": variant === "completed" })} /> : null}
      </div>
    );
  }
);

interface StepperRootProps extends React.HTMLAttributes<HTMLDivElement> { children?: React.ReactNode; className?: string; }
const StepperRoot = React.forwardRef<HTMLDivElement, StepperRootProps>(
  function StepperRoot({ children, className, ...otherProps }, ref) {
    return <div className={cn("flex items-center", className)} ref={ref} {...otherProps}>{children}</div>;
  }
);

export const Stepper = Object.assign(StepperRoot, { Step });
