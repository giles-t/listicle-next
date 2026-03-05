"use client";

import React from "react";
import { cn } from "../utils";

interface InputProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "placeholder"> {
  placeholder?: React.ReactNode;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
}

const Input = React.forwardRef<HTMLTextAreaElement, InputProps>(function Input(
  { placeholder, className, ...otherProps }: InputProps,
  ref
) {
  return (
    <textarea
      className={cn(
        "min-h-[96px] w-full border-none bg-transparent px-2 py-1.5 text-body font-body text-default-font outline-none placeholder:text-neutral-400",
        className
      )}
      placeholder={placeholder as string}
      ref={ref}
      {...otherProps}
    />
  );
});

interface TextAreaRootProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  error?: boolean;
  variant?: "outline" | "filled";
  label?: React.ReactNode;
  helpText?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const TextAreaRoot = React.forwardRef<HTMLLabelElement, TextAreaRootProps>(
  function TextAreaRoot(
    { error = false, variant = "outline", label, helpText, children, className, ...otherProps }: TextAreaRootProps,
    ref
  ) {
    return (
      <label
        className={cn("group flex flex-col items-start gap-1", className)}
        ref={ref}
        {...otherProps}
      >
        {label ? (
          <span className="text-caption-bold font-caption-bold text-default-font">{label}</span>
        ) : null}
        {children ? (
          <div
            className={cn(
              "flex w-full grow shrink-0 basis-0 flex-col items-start rounded-md border border-solid border-neutral-border bg-default-background pl-1 group-focus-within:border-brand-primary transition-colors",
              {
                "border-neutral-100 bg-neutral-100 group-hover:border-neutral-border group-focus-within:bg-default-background": variant === "filled",
                "border-error-600": error,
              }
            )}
          >
            {children}
          </div>
        ) : null}
        {helpText ? (
          <span className={cn("text-caption font-caption text-subtext-color", { "text-error-700": error })}>
            {helpText}
          </span>
        ) : null}
      </label>
    );
  }
);

export const TextArea = Object.assign(TextAreaRoot, {
  Input,
});
