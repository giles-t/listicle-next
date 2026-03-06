"use client"

import * as React from "react"
import { cn } from "@/src/client/tiptap/lib/tiptap-utils"

const Card = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center outline-none relative min-w-0 break-words bg-clip-border",
          "rounded-xl shadow-lg bg-default-background border border-neutral-200",
          "tiptap-card",
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "p-1.5 flex-none flex items-center justify-between w-full border-b border-neutral-200",
        className
      )}
      {...props}
    />
  )
})
CardHeader.displayName = "CardHeader"

const CardBody = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("p-1.5 flex-1 overflow-y-auto", className)}
        {...props}
      />
    )
  }
)
CardBody.displayName = "CardBody"

const CardItemGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    orientation?: "horizontal" | "vertical"
  }
>(({ className, orientation = "vertical", ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-orientation={orientation}
      className={cn(
        "relative flex align-middle min-w-max",
        orientation === "vertical"
          ? "flex-col justify-center"
          : "flex-row items-center gap-1",
        className
      )}
      {...props}
    />
  )
})
CardItemGroup.displayName = "CardItemGroup"

const CardGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "pt-3 px-2 pb-1 text-xs font-semibold capitalize text-neutral-800 leading-normal",
        className
      )}
      {...props}
    />
  )
})
CardGroupLabel.displayName = "CardGroupLabel"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("p-1.5", className)}
      {...props}
    />
  )
})
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardBody, CardItemGroup, CardGroupLabel }
