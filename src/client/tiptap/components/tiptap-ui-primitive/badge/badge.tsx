"use client"

import * as React from "react"
import { cn } from "@/src/client/tiptap/lib/tiptap-utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "ghost" | "white" | "gray" | "green" | "default"
  size?: "default" | "small"
  appearance?: "default" | "subdued" | "emphasized"
  trimText?: boolean
}

const sizeClasses = {
  default: "h-5 min-w-[1.25rem] px-1 text-[0.625rem] rounded-md",
  small: "h-4 min-w-[1rem] px-0.5 text-[0.625rem] rounded-sm",
}

const appearanceClasses = {
  default:
    "bg-neutral-100 border-neutral-300 text-neutral-700 [&_.tiptap-badge-icon]:text-neutral-500",
  subdued:
    "bg-neutral-50 border-neutral-200 text-neutral-500 [&_.tiptap-badge-icon]:text-neutral-400",
  emphasized:
    "bg-brand-50 border-brand-200 text-brand-700 [&_.tiptap-badge-icon]:text-brand-600",
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      variant,
      size = "default",
      appearance = "default",
      trimText = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center border font-bold leading-tight transition-colors duration-150",
          sizeClasses[size] || sizeClasses.default,
          appearanceClasses[appearance] || appearanceClasses.default,
          "[&_.tiptap-badge-text]:px-0.5 [&_.tiptap-badge-text]:flex-grow [&_.tiptap-badge-text]:text-left",
          "[&_.tiptap-badge-icon]:pointer-events-none [&_.tiptap-badge-icon]:flex-shrink-0 [&_.tiptap-badge-icon]:w-2.5 [&_.tiptap-badge-icon]:h-2.5",
          trimText &&
            "[&_.tiptap-badge-text]:text-ellipsis [&_.tiptap-badge-text]:overflow-hidden",
          "tiptap-badge",
          className
        )}
        data-style={variant}
        data-size={size}
        data-appearance={appearance}
        data-text-trim={trimText ? "on" : "off"}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Badge.displayName = "Badge"

export default Badge
