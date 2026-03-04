"use client"

import * as React from "react"
import { cn } from "@/src/client/tiptap/lib/tiptap-utils"
import "@/src/client/tiptap/components/tiptap-ui-primitive/input/input.scss"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "block w-full h-8 text-sm font-normal leading-6 py-1.5 px-2 rounded-md bg-transparent appearance-none outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500 tiptap-input",
        className
      )}
      {...props}
    />
  )
}

function InputGroup({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative flex flex-wrap items-stretch tiptap-input-group",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Input, InputGroup }
