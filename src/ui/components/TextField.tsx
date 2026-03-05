"use client";

import React from "react";
import { cn } from "../utils";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "placeholder"> {
  placeholder?: React.ReactNode;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { placeholder, className, ...otherProps }: InputProps,
  ref
) {
  return (
    <input
      className={cn(
        "h-full w-full border-none bg-transparent px-0 py-0 text-body font-body text-default-font outline-none placeholder:text-neutral-400",
        className
      )}
      placeholder={placeholder as string}
      ref={ref}
      {...otherProps}
    />
  );
});

interface TextFieldRootProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  disabled?: boolean;
  error?: boolean;
  variant?: "outline" | "filled";
  label?: React.ReactNode;
  helpText?: React.ReactNode;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const TextFieldRoot = React.forwardRef<HTMLLabelElement, TextFieldRootProps>(
  function TextFieldRoot(
    {
      disabled = false,
      error = false,
      variant = "outline",
      label,
      helpText,
      icon = null,
      iconRight = null,
      children,
      className,
      ...otherProps
    }: TextFieldRootProps,
    ref
  ) {
    return (
      <label
        className={cn("group flex flex-col items-start gap-1", className)}
        ref={ref}
        {...otherProps}
      >
        {label ? (
          <span className="text-caption-bold font-caption-bold text-default-font">
            {label}
          </span>
        ) : null}
        <div
          className={cn(
            "flex h-8 w-full flex-none items-center gap-1 rounded-md border border-solid border-neutral-border bg-default-background px-2 group-focus-within:border-brand-primary transition-colors",
            {
              "border-neutral-100 bg-neutral-100 group-hover:border-neutral-border group-focus-within:bg-default-background":
                variant === "filled",
              "border-error-600": error,
              "border-neutral-200 bg-neutral-200": disabled,
            }
          )}
        >
          {icon ? (
            <span className="text-body font-body text-subtext-color shrink-0 [&>svg]:h-[1em] [&>svg]:w-[1em]">
              {icon}
            </span>
          ) : null}
          {children ? (
            <div className="flex grow shrink-0 basis-0 flex-col items-start self-stretch px-1">
              {children}
            </div>
          ) : null}
          {iconRight ? (
            <span className={cn("text-body font-body text-subtext-color shrink-0 [&>svg]:h-[1em] [&>svg]:w-[1em]", { "text-error-500": error })}>
              {iconRight}
            </span>
          ) : null}
        </div>
        {helpText ? (
          <span className={cn("text-caption font-caption text-subtext-color", { "text-error-700": error })}>
            {helpText}
          </span>
        ) : null}
      </label>
    );
  }
);

export const TextField = Object.assign(TextFieldRoot, {
  Input,
});
