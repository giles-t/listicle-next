"use client"

import * as React from "react"
import * as Ariakit from "@ariakit/react"
import { cn } from "@/src/client/tiptap/lib/tiptap-utils"
import "@/src/client/tiptap/components/tiptap-ui-primitive/combobox/combobox.scss"

export function ComboboxProvider({ ...props }: Ariakit.ComboboxProviderProps) {
  return (
    <Ariakit.ComboboxProvider
      includesBaseElement={false}
      resetValueOnHide
      {...props}
    />
  )
}

export const ComboboxList = React.forwardRef<
  React.ComponentRef<typeof Ariakit.ComboboxList>,
  React.ComponentProps<typeof Ariakit.ComboboxList>
>(({ className, ...props }, ref) => {
  return (
    <Ariakit.ComboboxList
      ref={ref}
      className={cn(
        "h-full rounded-[calc(0.375rem+0.5rem+1px)] border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 p-1.5 shadow-md outline-none max-w-64 max-h-[var(--popover-available-height)] overflow-y-auto my-1.5 empty:!hidden tiptap-combobox-list",
        className
      )}
      {...props}
    />
  )
})
ComboboxList.displayName = "ComboboxList"

export const ComboboxPopover = React.forwardRef<
  React.ComponentRef<typeof Ariakit.ComboboxPopover>,
  React.ComponentProps<typeof Ariakit.ComboboxPopover>
>(({ className, ...props }, ref) => {
  return (
    <Ariakit.ComboboxPopover
      ref={ref}
      className={cn("tiptap-combobox-popover", className)}
      {...props}
    />
  )
})
ComboboxPopover.displayName = "ComboboxPopover"

export const Combobox = React.forwardRef<
  React.ComponentRef<typeof Ariakit.Combobox>,
  React.ComponentProps<typeof Ariakit.Combobox>
>(({ className, ...props }, ref) => {
  return (
    <Ariakit.Combobox
      ref={ref}
      autoSelect
      {...props}
      className={cn("tiptap-combobox", className)}
    />
  )
})
Combobox.displayName = "Combobox"

export const ComboboxItem = React.forwardRef<
  React.ComponentRef<typeof Ariakit.ComboboxItem>,
  React.ComponentProps<typeof Ariakit.ComboboxItem>
>(({ className, ...props }, ref) => {
  return (
    <Ariakit.ComboboxItem
      ref={ref}
      className={cn("tiptap-combobox-item", className)}
      {...props}
    />
  )
})
ComboboxItem.displayName = "ComboboxItem"
