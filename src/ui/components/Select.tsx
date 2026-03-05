"use client";

import React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../utils";

interface ItemProps {
  value: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const Item = React.forwardRef<HTMLDivElement, ItemProps>(function Item(
  { value, children, className, ...otherProps }: ItemProps,
  ref
) {
  return (
    <SelectPrimitive.Item value={value as string} asChild {...otherProps}>
      <div
        className={cn(
          "group flex h-8 w-full cursor-pointer items-center gap-1 rounded-md px-3 outline-none hover:bg-neutral-100 active:bg-neutral-50 data-[highlighted]:bg-brand-50",
          className
        )}
        ref={ref}
      >
        <SelectPrimitive.ItemText asChild>
          <span className="h-auto grow shrink-0 basis-0 text-body font-body text-default-font">
            {children || value}
          </span>
        </SelectPrimitive.ItemText>
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4 text-brand-600" />
        </SelectPrimitive.ItemIndicator>
      </div>
    </SelectPrimitive.Item>
  );
});

interface TriggerValueProps {
  placeholder?: React.ReactNode;
  className?: string;
}

const TriggerValue = React.forwardRef<HTMLSpanElement, TriggerValueProps>(
  function TriggerValue({ placeholder, className, ...otherProps }: TriggerValueProps, ref) {
    return (
      <SelectPrimitive.Value
        className={cn("w-full whitespace-nowrap text-body font-body text-default-font", className)}
        ref={ref}
        placeholder={placeholder as string}
        {...otherProps}
      />
    );
  }
);

interface ContentProps {
  children?: React.ReactNode;
  className?: string;
}

const Content = React.forwardRef<HTMLDivElement, ContentProps>(function Content(
  { children, className, ...otherProps }: ContentProps,
  ref
) {
  return children ? (
    <SelectPrimitive.Content position="popper" sideOffset={4} asChild {...otherProps}>
      <div
        className={cn(
          "z-50 flex w-full flex-col items-start overflow-hidden rounded-md border border-solid border-neutral-border bg-white px-1 py-1 shadow-lg",
          className
        )}
        ref={ref}
      >
        <SelectPrimitive.Viewport className="w-full">
          {children}
        </SelectPrimitive.Viewport>
      </div>
    </SelectPrimitive.Content>
  ) : null;
});

interface TriggerProps {
  placeholder?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const Trigger = React.forwardRef<HTMLButtonElement, TriggerProps>(
  function Trigger({ placeholder, icon = null, className, ...otherProps }: TriggerProps, ref) {
    return (
      <SelectPrimitive.Trigger asChild {...otherProps}>
        <button className={cn("flex h-full w-full items-center gap-2 px-3 text-left outline-none", className)} ref={ref}>
          {icon ? <span className="text-body font-body text-neutral-400 shrink-0 [&>svg]:h-[1em] [&>svg]:w-[1em]">{icon}</span> : null}
          <TriggerValue placeholder={placeholder as string} />
          <ChevronDown className="h-4 w-4 text-subtext-color" />
        </button>
      </SelectPrimitive.Trigger>
    );
  }
);

interface ItemTextProps {
  children?: React.ReactNode;
  className?: string;
}

const ItemText = React.forwardRef<HTMLSpanElement, ItemTextProps>(
  function ItemText({ children, className, ...otherProps }: ItemTextProps, ref) {
    return children ? (
      <SelectPrimitive.ItemText {...otherProps}>
        <span className={cn("text-body font-body text-default-font", className)} ref={ref}>{children}</span>
      </SelectPrimitive.ItemText>
    ) : null;
  }
);

interface SelectRootProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
  error?: boolean;
  variant?: "outline" | "filled";
  label?: React.ReactNode;
  placeholder?: React.ReactNode;
  helpText?: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultValue?: string;
  dir?: "ltr" | "rtl";
  name?: string;
  autoComplete?: string;
  required?: boolean;
  form?: string;
  className?: string;
}

const SelectRoot = React.forwardRef<HTMLDivElement, SelectRootProps>(
  function SelectRoot(
    {
      disabled = false, error = false, variant = "outline", label, placeholder, helpText, icon = null, children, className,
      value, defaultValue, onValueChange, open, defaultOpen, onOpenChange, dir, name, autoComplete, required, form,
      ...otherProps
    }: SelectRootProps,
    ref
  ) {
    return (
      <SelectPrimitive.Root
        disabled={disabled} value={value} defaultValue={defaultValue} onValueChange={onValueChange}
        open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} dir={dir} name={name} required={required}
      >
        <div className={cn("group flex cursor-pointer flex-col items-start gap-1", className)} ref={ref} {...otherProps}>
          {label ? <span className="text-caption-bold font-caption-bold text-default-font">{label}</span> : null}
          <div
            className={cn(
              "flex h-8 w-full flex-none flex-col items-start rounded-md border border-solid border-neutral-border bg-default-background group-focus-within:border-brand-primary transition-colors",
              {
                "border-neutral-100 bg-neutral-100 group-hover:border-neutral-border": variant === "filled",
                "border-error-600": error,
                "bg-neutral-200": disabled,
              }
            )}
          >
            <Trigger placeholder={placeholder} icon={icon} />
          </div>
          {helpText ? (
            <span className={cn("text-caption font-caption text-subtext-color", { "text-error-700": error })}>{helpText}</span>
          ) : null}
          <Content>
            {children ? <div className="flex w-full grow shrink-0 basis-0 flex-col items-start">{children}</div> : null}
          </Content>
        </div>
      </SelectPrimitive.Root>
    );
  }
);

export const Select = Object.assign(SelectRoot, { Item, TriggerValue, Content, Trigger, ItemText });
