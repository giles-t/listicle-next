"use client";

import React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "../utils";

interface OptionProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string; label?: React.ReactNode; disabled?: boolean; className?: string;
}

const Option = React.forwardRef<HTMLDivElement, OptionProps>(
  function Option({ value, label, disabled = false, className, ...otherProps }, ref) {
    return (
      <div className={cn("flex items-center gap-2", className)} ref={ref} {...otherProps}>
        <RadioGroupPrimitive.Item value={value} disabled={disabled}
          className="flex h-4 w-4 items-center justify-center rounded-full border border-solid border-neutral-300 bg-default-background data-[state=checked]:border-brand-600 disabled:opacity-50"
        >
          <RadioGroupPrimitive.Indicator className="h-2 w-2 rounded-full bg-brand-600" />
        </RadioGroupPrimitive.Item>
        {label ? <span className={cn("text-body font-body text-default-font", { "text-neutral-400": disabled })}>{label}</span> : null}
      </div>
    );
  }
);

interface RadioGroupRootProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode; helpText?: React.ReactNode; error?: boolean; horizontal?: boolean;
  children?: React.ReactNode; value?: string; onValueChange?: (value: string) => void; className?: string;
}

const RadioGroupRoot = React.forwardRef<HTMLDivElement, RadioGroupRootProps>(
  function RadioGroupRoot({ label, helpText, error = false, horizontal = false, children, value, onValueChange, className, ...otherProps }, ref) {
    return (
      <div className={cn("flex flex-col items-start gap-2", className)} ref={ref} {...otherProps}>
        {label ? <span className="text-caption-bold font-caption-bold text-default-font">{label}</span> : null}
        <RadioGroupPrimitive.Root value={value} onValueChange={onValueChange}
          className={cn("flex flex-col items-start gap-2", { "flex-row flex-wrap gap-4": horizontal })}
        >
          {children}
        </RadioGroupPrimitive.Root>
        {helpText ? <span className={cn("text-caption font-caption text-subtext-color", { "text-error-700": error })}>{helpText}</span> : null}
      </div>
    );
  }
);

export const RadioGroup = Object.assign(RadioGroupRoot, { Option });
