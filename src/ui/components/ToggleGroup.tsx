"use client";

import React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "../utils";

interface ItemProps extends React.HTMLAttributes<HTMLButtonElement> {
  value: string; children?: React.ReactNode; className?: string;
}
const Item = React.forwardRef<HTMLButtonElement, ItemProps>(
  function Item({ value, children, className, ...otherProps }, ref) {
    return (
      <ToggleGroupPrimitive.Item value={value}
        className={cn("flex h-8 cursor-pointer items-center justify-center gap-2 rounded-md px-3 text-body font-body text-subtext-color transition-colors hover:text-default-font data-[state=on]:bg-default-background data-[state=on]:text-default-font data-[state=on]:shadow-sm", className)}
        ref={ref} {...otherProps}
      >{children}</ToggleGroupPrimitive.Item>
    );
  }
);

interface ToggleGroupRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode; value?: string; onValueChange?: (value: string) => void; className?: string;
}
const ToggleGroupRoot = React.forwardRef<HTMLDivElement, ToggleGroupRootProps>(
  function ToggleGroupRoot({ children, value, onValueChange, className, ...otherProps }, ref) {
    return (
      <ToggleGroupPrimitive.Root type="single" value={value} onValueChange={onValueChange}
        className={cn("flex items-center gap-0.5 rounded-md bg-neutral-100 p-0.5", className)} ref={ref} {...otherProps}
      >{children}</ToggleGroupPrimitive.Root>
    );
  }
);

export const ToggleGroup = Object.assign(ToggleGroupRoot, { Item });
