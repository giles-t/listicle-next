"use client";

import React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "../utils";

interface CheckboxCardRootProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean; checked?: boolean; hideCheckbox?: boolean; children?: React.ReactNode; onCheckedChange?: (checked: boolean) => void; className?: string;
}

const CheckboxCardRoot = React.forwardRef<HTMLDivElement, CheckboxCardRootProps>(
  function CheckboxCardRoot({ disabled = false, checked, hideCheckbox = false, children, onCheckedChange, className, ...otherProps }, ref) {
    return (
      <CheckboxPrimitive.Root checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} asChild>
        <div
          className={cn(
            "flex w-full cursor-pointer items-center gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-3 transition-colors hover:bg-neutral-50 data-[state=checked]:border-brand-600 data-[state=checked]:bg-brand-50",
            { "opacity-50 cursor-default": disabled }, className
          )}
          ref={ref} {...otherProps}
        >
          {!hideCheckbox ? (
            <div className="flex h-4 w-4 items-center justify-center rounded-sm border border-solid border-neutral-300 data-[state=checked]:border-brand-600 data-[state=checked]:bg-brand-600">
              <CheckboxPrimitive.Indicator><Check className="h-3 w-3 text-white" /></CheckboxPrimitive.Indicator>
            </div>
          ) : null}
          {children ? <div className="flex grow shrink-0 basis-0 flex-col items-start">{children}</div> : null}
        </div>
      </CheckboxPrimitive.Root>
    );
  }
);

export const CheckboxCard = CheckboxCardRoot;
