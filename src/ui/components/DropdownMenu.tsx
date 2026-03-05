"use client";

import React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "../utils";

interface DropdownItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  onSelect?: () => void;
}

const DropdownItem = React.forwardRef<HTMLDivElement, DropdownItemProps>(
  function DropdownItem({ children, icon = null, className, onSelect, ...otherProps }: DropdownItemProps, ref) {
    return (
      <DropdownMenuPrimitive.Item asChild onSelect={onSelect}>
        <div
          className={cn(
            "flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-3 outline-none hover:bg-neutral-100 active:bg-neutral-50 data-[highlighted]:bg-neutral-100",
            className
          )}
          ref={ref}
          {...otherProps}
        >
          {icon ? (
            <span className="text-body font-body text-default-font shrink-0 [&>svg]:h-[1em] [&>svg]:w-[1em]">{icon}</span>
          ) : null}
          {children ? (
            <span className="line-clamp-1 grow shrink-0 basis-0 text-body font-body text-default-font">{children}</span>
          ) : null}
        </div>
      </DropdownMenuPrimitive.Item>
    );
  }
);

interface DropdownDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const DropdownDivider = React.forwardRef<HTMLDivElement, DropdownDividerProps>(
  function DropdownDivider({ className, ...otherProps }: DropdownDividerProps, ref) {
    return (
      <div className={cn("flex w-full items-start gap-2 px-1 py-1", className)} ref={ref} {...otherProps}>
        <div className="flex h-px grow shrink-0 basis-0 flex-col items-center gap-2 bg-neutral-200" />
      </div>
    );
  }
);

interface DropdownMenuRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const DropdownMenuRoot = React.forwardRef<HTMLDivElement, DropdownMenuRootProps>(
  function DropdownMenuRoot({ children, className, ...otherProps }: DropdownMenuRootProps, ref) {
    return children ? (
      <div
        className={cn(
          "flex min-w-[192px] flex-col items-start rounded-md border border-solid border-neutral-border bg-default-background px-1 py-1 shadow-lg",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        {children}
      </div>
    ) : null;
  }
);

export const DropdownMenu = Object.assign(DropdownMenuRoot, {
  DropdownItem,
  DropdownDivider,
});
