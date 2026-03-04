"use client"

import * as React from "react"
import { Separator } from "@/src/client/tiptap/components/tiptap-ui-primitive/separator"
import "@/src/client/tiptap/components/tiptap-ui-primitive/toolbar/toolbar.scss"
import { cn } from "@/src/client/tiptap/lib/tiptap-utils"
import { useMenuNavigation } from "@/src/client/tiptap/hooks/use-menu-navigation"
import { useComposedRef } from "@/src/client/tiptap/hooks/use-composed-ref"

type BaseProps = React.HTMLAttributes<HTMLDivElement>

interface ToolbarProps extends BaseProps {
  variant?: "floating" | "fixed"
}

const useToolbarNavigation = (
  toolbarRef: React.RefObject<HTMLDivElement | null>
) => {
  const [items, setItems] = React.useState<HTMLElement[]>([])

  const collectItems = React.useCallback(() => {
    if (!toolbarRef.current) return []
    return Array.from(
      toolbarRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [role="button"]:not([disabled]), [tabindex="0"]:not([disabled])'
      )
    )
  }, [toolbarRef])

  React.useEffect(() => {
    const toolbar = toolbarRef.current
    if (!toolbar) return

    const updateItems = () => setItems(collectItems())

    updateItems()
    const observer = new MutationObserver(updateItems)
    observer.observe(toolbar, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [collectItems, toolbarRef])

  const { selectedIndex } = useMenuNavigation<HTMLElement>({
    containerRef: toolbarRef,
    items,
    orientation: "horizontal",
    onSelect: (el) => el.click(),
    autoSelectFirstItem: false,
  })

  React.useEffect(() => {
    const toolbar = toolbarRef.current
    if (!toolbar) return

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (toolbar.contains(target))
        target.setAttribute("data-focus-visible", "true")
    }

    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (toolbar.contains(target)) target.removeAttribute("data-focus-visible")
    }

    toolbar.addEventListener("focus", handleFocus, true)
    toolbar.addEventListener("blur", handleBlur, true)

    return () => {
      toolbar.removeEventListener("focus", handleFocus, true)
      toolbar.removeEventListener("blur-sm", handleBlur, true)
    }
  }, [toolbarRef])

  React.useEffect(() => {
    if (selectedIndex !== undefined && items[selectedIndex]) {
      items[selectedIndex].focus()
    }
  }, [selectedIndex, items])
}

export const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  ({ children, className, variant = "fixed", ...props }, ref) => {
    const toolbarRef = React.useRef<HTMLDivElement>(null)
    const composedRef = useComposedRef(toolbarRef, ref)
    useToolbarNavigation(toolbarRef)

    const toolbarBase =
      "flex items-center gap-1 tiptap-toolbar"
    const variantClasses =
      variant === "fixed"
        ? "sticky top-0 z-10 w-full min-h-[2.75rem] bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 px-2 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[480px]:absolute max-[480px]:top-auto max-[480px]:h-[calc(2.75rem+env(safe-area-inset-bottom,0px))] max-[480px]:border-t max-[480px]:border-b-0 max-[480px]:pb-[env(safe-area-inset-bottom,0px)] max-[480px]:flex-nowrap max-[480px]:justify-start"
        : "p-[0.188rem] rounded-[calc(0.125rem+0.5rem+1px)] border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-md outline-none overflow-hidden data-[plain=true]:p-0 data-[plain=true]:rounded-none data-[plain=true]:border-none data-[plain=true]:shadow-none data-[plain=true]:bg-transparent max-[480px]:w-full max-[480px]:rounded-none max-[480px]:border-none max-[480px]:shadow-none"

    return (
      <div
        ref={composedRef}
        role="toolbar"
        aria-label="toolbar"
        data-variant={variant}
        className={cn(toolbarBase, variantClasses, className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Toolbar.displayName = "Toolbar"

export const ToolbarGroup = React.forwardRef<HTMLDivElement, BaseProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      className={cn(
        "flex items-center gap-0.5 empty:hidden tiptap-toolbar-group",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
ToolbarGroup.displayName = "ToolbarGroup"

export const ToolbarSeparator = React.forwardRef<HTMLDivElement, BaseProps>(
  ({ className, ...props }, ref) => (
    <Separator
      ref={ref}
      orientation="vertical"
      decorative
      className={cn(
        "tiptap-separator",
        "[.tiptap-toolbar-group:empty+&]:hidden",
        className
      )}
      {...props}
    />
  )
)
ToolbarSeparator.displayName = "ToolbarSeparator"
