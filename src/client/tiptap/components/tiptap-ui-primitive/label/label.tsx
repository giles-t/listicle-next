"use client"

import * as React from "react"
import "@/src/client/tiptap/components/tiptap-ui-primitive/label/label.scss"
import { cn } from "@/src/client/tiptap/lib/tiptap-utils"

export interface BaseProps extends React.HTMLAttributes<HTMLElement> {
  as?: "label" | "div"
  onMouseDown?: React.MouseEventHandler<HTMLElement>
}

export type LabelProps<T extends "label" | "div"> = T extends "label"
  ? BaseProps & { htmlFor?: string }
  : BaseProps

export const Label = React.forwardRef<
  HTMLElement,
  LabelProps<"label"> | LabelProps<"div">
>(({ as = "div", ...props }, ref) => {
  const renderProps = { ...props }

  if (as === "label") {
    renderProps.onMouseDown = (event: React.MouseEvent<HTMLElement>) => {
      // only prevent text selection if clicking inside the label itself
      const target = event.target as HTMLElement
      if (target.closest("button, input, select, textarea")) return
      props.onMouseDown?.(event)
      // prevent text selection when double clicking label
      if (!event.defaultPrevented && event.detail > 1) event.preventDefault()
    }
  }

  return React.createElement(as, {
    ...renderProps,
    ref,
    className: cn(
      "mt-3 ml-2 mr-2 mb-1 text-xs font-semibold leading-normal capitalize text-neutral-800 dark:text-neutral-200 tiptap-label",
      props.className
    ),
  })
})

Label.displayName = "Label"

export default Label
