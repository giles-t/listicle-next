"use client";

import React from "react";
import { cn } from "../utils";

interface TextFieldUnstyledProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const TextFieldUnstyled = React.forwardRef<HTMLInputElement, TextFieldUnstyledProps>(
  function TextFieldUnstyled({ className, ...otherProps }, ref) {
    return <input className={cn("w-full border-none bg-transparent outline-none text-body font-body text-default-font placeholder:text-neutral-400", className)} ref={ref} {...otherProps} />;
  }
);

export { TextFieldUnstyled };
