"use client";

import React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "../utils";

interface RadioCardProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string; children?: React.ReactNode; className?: string;
}

const RadioCard = React.forwardRef<HTMLDivElement, RadioCardProps>(
  function RadioCard({ value, children, className, ...otherProps }, ref) {
    return (
      <RadioGroupPrimitive.Item value={value} asChild>
        <div
          className={cn(
            "flex w-full cursor-pointer items-center gap-3 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-3 transition-colors hover:bg-neutral-50 data-[state=checked]:border-brand-600 data-[state=checked]:bg-brand-50",
            className
          )}
          ref={ref} {...otherProps}
        >
          <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-solid border-neutral-300 data-[state=checked]:border-brand-600">
            <RadioGroupPrimitive.Indicator className="h-2 w-2 rounded-full bg-brand-600" />
          </div>
          {children ? <div className="flex grow shrink-0 basis-0 flex-col items-start">{children}</div> : null}
        </div>
      </RadioGroupPrimitive.Item>
    );
  }
);

interface RadioCardGroupRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode; value?: string; onValueChange?: (value: string) => void; className?: string;
}

const RadioCardGroupRoot = React.forwardRef<HTMLDivElement, RadioCardGroupRootProps>(
  function RadioCardGroupRoot({ children, value, onValueChange, className, ...otherProps }, ref) {
    return (
      <RadioGroupPrimitive.Root value={value} onValueChange={onValueChange} asChild>
        <div className={cn("flex w-full flex-col items-start gap-2", className)} ref={ref} {...otherProps}>{children}</div>
      </RadioGroupPrimitive.Root>
    );
  }
);

export const RadioCardGroup = Object.assign(RadioCardGroupRoot, { RadioCard });
