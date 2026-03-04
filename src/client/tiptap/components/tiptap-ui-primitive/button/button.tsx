"use client"

import * as React from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/src/client/tiptap/components/tiptap-ui-primitive/tooltip"

import { cn, parseShortcutKeys } from "@/src/client/tiptap/lib/tiptap-utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  showTooltip?: boolean
  tooltip?: React.ReactNode
  shortcutKeys?: string
}

const ghostStyles = [
  "bg-transparent text-neutral-600",
  "hover:bg-neutral-100 hover:text-neutral-900",
  "[&_.tiptap-button-icon]:text-neutral-500 hover:[&_.tiptap-button-icon]:text-neutral-700",
  "[&_.tiptap-button-icon-sub]:text-neutral-400 hover:[&_.tiptap-button-icon-sub]:text-neutral-500",
  "[&[data-active-state=on]]:bg-neutral-100 [&[data-active-state=on]]:text-neutral-900",
  "[&[data-active-state=on]_.tiptap-button-icon]:text-brand-600",
  "[&[data-active-state=on][data-appearance=emphasized]]:bg-brand-50 [&[data-active-state=on][data-appearance=emphasized]_.tiptap-button-icon]:text-brand-600",
  "[&[data-state=open]]:bg-neutral-100 [&[data-state=open]]:text-neutral-900",
  "disabled:bg-transparent disabled:text-neutral-400 disabled:[&_.tiptap-button-icon]:text-neutral-400",
].join(" ")

const primaryStyles = [
  "bg-brand-600 text-white",
  "hover:bg-brand-500 hover:text-white",
  "[&_.tiptap-button-icon]:text-white hover:[&_.tiptap-button-icon]:text-white",
  "[&_.tiptap-button-icon-sub]:text-neutral-300 hover:[&_.tiptap-button-icon-sub]:text-neutral-200",
  "disabled:bg-neutral-200 disabled:text-neutral-400 disabled:[&_.tiptap-button-icon]:text-neutral-400",
].join(" ")

const defaultStyles = [
  "bg-neutral-50 text-neutral-600",
  "hover:bg-neutral-100 hover:text-neutral-900",
  "[&_.tiptap-button-icon]:text-neutral-500 hover:[&_.tiptap-button-icon]:text-neutral-700",
  "[&_.tiptap-button-icon-sub]:text-neutral-400 hover:[&_.tiptap-button-icon-sub]:text-neutral-500",
  "[&[data-active-state=on]]:bg-neutral-100 [&[data-active-state=on]]:text-neutral-900",
  "[&[data-active-state=on]_.tiptap-button-icon]:text-brand-600",
  "[&[data-state=open]]:bg-neutral-100 [&[data-state=open]]:text-neutral-900",
  "disabled:bg-neutral-50 disabled:text-neutral-400 disabled:[&_.tiptap-button-icon]:text-neutral-400",
].join(" ")

function getStyleClasses(dataStyle?: string): string {
  switch (dataStyle) {
    case "ghost":
      return ghostStyles
    case "primary":
      return primaryStyles
    default:
      return defaultStyles
  }
}

export const ShortcutDisplay: React.FC<{ shortcuts: string[] }> = ({
  shortcuts,
}) => {
  if (shortcuts.length === 0) return null

  return (
    <div>
      {shortcuts.map((key, index) => (
        <React.Fragment key={index}>
          {index > 0 && <kbd>+</kbd>}
          <kbd>{key}</kbd>
        </React.Fragment>
      ))}
    </div>
  )
}

const baseClasses = [
  "flex items-center justify-center",
  "h-8 min-w-[2rem] gap-1 rounded-lg px-2",
  "border-none cursor-pointer",
  "text-sm font-medium leading-tight",
  "transition-colors duration-150",
  "focus-visible:outline-none",
  "[&_.tiptap-button-icon]:w-4 [&_.tiptap-button-icon]:h-4 [&_.tiptap-button-icon]:flex-shrink-0",
  "[&_.tiptap-button-icon-sub]:w-4 [&_.tiptap-button-icon-sub]:h-4 [&_.tiptap-button-icon-sub]:flex-shrink-0",
  "[&_.tiptap-button-dropdown-arrows]:w-3 [&_.tiptap-button-dropdown-arrows]:h-3 [&_.tiptap-button-dropdown-arrows]:flex-shrink-0",
  "[&_.tiptap-button-dropdown-small]:w-2.5 [&_.tiptap-button-dropdown-small]:h-2.5 [&_.tiptap-button-dropdown-small]:flex-shrink-0",
  "[&_.tiptap-button-text]:px-0.5 [&_.tiptap-button-text]:flex-grow [&_.tiptap-button-text]:text-left [&_.tiptap-button-text]:leading-6",
  "[&_.tiptap-button-emoji]:w-4 [&_.tiptap-button-emoji]:flex [&_.tiptap-button-emoji]:justify-center",
].join(" ")

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      tooltip,
      showTooltip = true,
      shortcutKeys,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const shortcuts = React.useMemo(
      () => parseShortcutKeys({ shortcutKeys }),
      [shortcutKeys]
    )

    const dataStyle = (props as Record<string, unknown>)["data-style"] as
      | string
      | undefined
    const styleClasses = getStyleClasses(dataStyle)

    if (!tooltip || !showTooltip) {
      return (
        <button
          className={cn(baseClasses, styleClasses, "tiptap-button", className)}
          ref={ref}
          aria-label={ariaLabel}
          {...props}
        >
          {children}
        </button>
      )
    }

    return (
      <Tooltip delay={200}>
        <TooltipTrigger
          className={cn(baseClasses, styleClasses, "tiptap-button", className)}
          ref={ref}
          aria-label={ariaLabel}
          {...props}
        >
          {children}
        </TooltipTrigger>
        <TooltipContent>
          {tooltip}
          <ShortcutDisplay shortcuts={shortcuts} />
        </TooltipContent>
      </Tooltip>
    )
  }
)

Button.displayName = "Button"

export const ButtonGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    orientation?: "horizontal" | "vertical"
  }
>(({ className, children, orientation = "vertical", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex gap-0.5",
        orientation === "horizontal" ? "flex-row" : "flex-col",
        "tiptap-button-group",
        className
      )}
      data-orientation={orientation}
      role="group"
      {...props}
    >
      {children}
    </div>
  )
})
ButtonGroup.displayName = "ButtonGroup"

export default Button
