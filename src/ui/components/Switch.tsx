"use client";

import React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "../utils";

interface SwitchRootProps extends React.HTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

const SwitchRoot = React.forwardRef<HTMLButtonElement, SwitchRootProps>(
  function SwitchRoot({ checked = false, onCheckedChange, className, ...otherProps }: SwitchRootProps, ref) {
    return (
      <SwitchPrimitive.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={cn(
          "flex h-5 w-8 cursor-pointer items-center rounded-full border border-solid border-neutral-200 bg-neutral-200 px-0.5 py-0.5 transition-colors data-[state=checked]:border-brand-600 data-[state=checked]:bg-brand-600",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <SwitchPrimitive.Thumb className="block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-3" />
      </SwitchPrimitive.Root>
    );
  }
);

export const Switch = SwitchRoot;
