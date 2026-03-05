"use client";

import React from "react";
import { cn } from "../utils";

interface OAuthSocialButtonRootProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode; logo?: string; disabled?: boolean; className?: string;
}

const OAuthSocialButtonRoot = React.forwardRef<HTMLButtonElement, OAuthSocialButtonRootProps>(
  function OAuthSocialButtonRoot({ children, logo, disabled = false, className, type = "button", ...otherProps }, ref) {
    return (
      <button
        className={cn("group flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-solid border-neutral-border bg-white px-4 text-left transition-colors hover:bg-neutral-50 active:bg-white disabled:cursor-default disabled:bg-white", className)}
        ref={ref} type={type} disabled={disabled} {...otherProps}
      >
        {logo ? <img className="h-5 w-5 flex-none object-cover" src={logo} /> : null}
        {children ? <span className="text-body-bold font-body-bold text-neutral-700 group-disabled:text-neutral-400">{children}</span> : null}
      </button>
    );
  }
);

export const OAuthSocialButton = OAuthSocialButtonRoot;
