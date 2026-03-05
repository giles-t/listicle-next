"use client";

import React from "react";
import { User } from "lucide-react";
import { cn } from "../utils";

interface ItemProps extends React.HTMLAttributes<HTMLDivElement> { selected?: boolean; icon?: React.ReactNode; label?: React.ReactNode; className?: string; }
const Item = React.forwardRef<HTMLDivElement, ItemProps>(
  function Item({ selected = false, icon = <User />, label, className, ...otherProps }, ref) {
    return (
      <div
        className={cn("group flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-3 py-1 hover:bg-default-background active:bg-brand-50", { "bg-brand-100 hover:bg-brand-100 active:bg-brand-50": selected }, className)}
        ref={ref} {...otherProps}
      >
        {icon ? <span className={cn("text-body font-body text-default-font shrink-0 [&>svg]:h-[1em] [&>svg]:w-[1em]", { "text-brand-700": selected })}>{icon}</span> : null}
        {label ? <span className={cn("line-clamp-1 grow shrink-0 basis-0 text-body font-body text-default-font", { "text-body-bold font-body-bold text-brand-700": selected })}>{label}</span> : null}
      </div>
    );
  }
);

interface SettingsMenuRootProps extends React.HTMLAttributes<HTMLDivElement> { children?: React.ReactNode; className?: string; }
const SettingsMenuRoot = React.forwardRef<HTMLDivElement, SettingsMenuRootProps>(
  function SettingsMenuRoot({ children, className, ...otherProps }, ref) {
    return children ? (
      <div className={cn("flex h-full w-60 flex-col items-start gap-8 border-r border-solid border-neutral-border bg-default-background px-6 py-6", className)} ref={ref} {...otherProps}>{children}</div>
    ) : null;
  }
);

export const SettingsMenu = Object.assign(SettingsMenuRoot, { Item });
