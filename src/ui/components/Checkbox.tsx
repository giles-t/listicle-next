"use client";

import React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "../utils";

interface CheckboxRootProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode; disabled?: boolean; checked?: boolean; onCheckedChange?: (checked: boolean) => void; className?: string;
}

const CheckboxRoot = React.forwardRef<HTMLDivElement, CheckboxRootProps>(
  function CheckboxRoot({ label, disabled = false, checked, onCheckedChange, className, ...otherProps }, ref) {
    return (
      <div className={cn("flex items-center gap-2", className)} ref={ref} {...otherProps}>
        <CheckboxPrimitive.Root
          checked={checked} onCheckedChange={onCheckedChange} disabled={disabled}
          className="flex h-4 w-4 items-center justify-center rounded-sm border border-solid border-neutral-300 bg-default-background data-[state=checked]:border-brand-600 data-[state=checked]:bg-brand-600 disabled:opacity-50"
        >
          <CheckboxPrimitive.Indicator><Check className="h-3 w-3 text-white" /></CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        {label ? <span className={cn("text-body font-body text-default-font", { "text-neutral-400": disabled })}>{label}</span> : null}
      </div>
    );
  }
);

export const Checkbox = CheckboxRoot;
