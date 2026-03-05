"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "../utils";

interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "completed" | "active"; stepNumber?: React.ReactNode; label?: React.ReactNode;
  firstStep?: boolean; lastStep?: boolean; children?: React.ReactNode; className?: string;
}
const Step = React.forwardRef<HTMLDivElement, StepProps>(
  function Step({ variant = "default", stepNumber, label, firstStep, lastStep, children, className, ...otherProps }, ref) {
    return (
      <div className={cn("flex gap-3", className)} ref={ref} {...otherProps}>
        <div className="flex flex-col items-center gap-1">
          <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-neutral-200 text-caption-bold font-caption-bold text-neutral-400", {
            "border-brand-600 bg-brand-600 text-white": variant === "completed",
            "border-brand-600 text-brand-600": variant === "active",
          })}>
            {variant === "completed" ? <Check className="h-4 w-4" /> : stepNumber}
          </div>
          {!lastStep ? <div className={cn("w-px grow bg-neutral-200", { "bg-brand-600": variant === "completed" })} /> : null}
        </div>
        <div className="flex flex-col gap-1 pb-6">
          {label ? <span className={cn("text-body font-body text-subtext-color", { "text-default-font font-medium": variant === "active" || variant === "completed" })}>{label}</span> : null}
          {children}
        </div>
      </div>
    );
  }
);

interface VerticalStepperRootProps extends React.HTMLAttributes<HTMLDivElement> { children?: React.ReactNode; className?: string; }
const VerticalStepperRoot = React.forwardRef<HTMLDivElement, VerticalStepperRootProps>(
  function VerticalStepperRoot({ children, className, ...otherProps }, ref) {
    return <div className={cn("flex flex-col", className)} ref={ref} {...otherProps}>{children}</div>;
  }
);

export const VerticalStepper = Object.assign(VerticalStepperRoot, { Step });
