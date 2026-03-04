"use client"

import * as React from "react"
import { Button } from "@/src/client/tiptap/components/tiptap-ui-primitive/button"
import { MessageSquareIcon } from "@/src/client/tiptap/components/tiptap-icons/message-square-icon"
import { useIsMobile } from "@/src/client/tiptap/hooks/use-mobile"
import { cn } from "@/src/client/tiptap/lib/tiptap-utils"
import "@/src/client/tiptap/components/tiptap-ui-primitive/sidebar/sidebar.scss"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "26rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)
const SidebarSideContext = React.createContext<"left" | "right">("left")

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)

    // This is the internal state of the sidebar.
    // We use openProp and setOpenProp for control from outside the component.
    const [_open, _setOpen] = React.useState(defaultOpen)
    const open = openProp ?? _open
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value
        if (setOpenProp) {
          setOpenProp(openState)
        } else {
          _setOpen(openState)
        }

        // This sets the cookie to keep the sidebar state.
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
      },
      [setOpenProp, open]
    )

    // Helper to toggle the sidebar.
    const toggleSidebar = React.useCallback(() => {
      return isMobile
        ? setOpenMobile((open) => !open)
        : setOpen((open) => !open)
    }, [isMobile, setOpen, setOpenMobile])

    // Adds a keyboard shortcut to toggle the sidebar.
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault()
          toggleSidebar()
        }
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebar])

    // We add a state so that we can do data-state="expanded" or "collapsed".
    // This makes it easier to style the sidebar with Tailwind classes.
    const state = open ? "expanded" : "collapsed"

    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <div
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "flex min-h-svh w-full sidebar-wrapper",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    collapsible?: "offcanvas"
  }
>(
  (
    { side = "left", collapsible = "offcanvas", className, children, ...props },
    ref
  ) => {
    const { state } = useSidebar()

    const sidebarClasses =
      "hidden md:block sidebar"
    const gapClasses =
      "relative w-[var(--sidebar-width)] bg-transparent transition-[width] duration-200 linear data-[collapsible=offcanvas]:w-0 data-[side=right]:rotate-180 sidebar-gap"
    const containerBase =
      "fixed top-0 bottom-0 z-10 h-svh w-[var(--sidebar-width)] hidden md:flex transition-all duration-200 linear border-neutral-200 dark:border-neutral-800"
    const containerSideClasses =
      "data-[side=left]:left-0 data-[side=left]:border-r data-[side=left]:data-[collapsible=offcanvas]:-left-[var(--sidebar-width)] data-[side=right]:right-0 data-[side=right]:border-l data-[side=right]:data-[collapsible=offcanvas]:-right-[var(--sidebar-width)]"
    const mainClasses =
      "flex h-full w-full flex-col bg-neutral-100 dark:bg-neutral-900 sidebar-main"

    return (
      <SidebarSideContext.Provider value={side}>
        <div
          ref={ref}
          className={sidebarClasses}
          data-state={state}
          data-collapsible={state === "collapsed" ? collapsible : ""}
          data-side={side}
        >
          {/* This is what handles the sidebar gap on desktop */}
          <div
            className={gapClasses}
            data-collapsible={state === "collapsed" ? collapsible : ""}
            data-side={side}
          />
          <div
            className={cn(
              "sidebar-container",
              containerBase,
              containerSideClasses,
              className
            )}
            data-state={state}
            data-collapsible={state === "collapsed" ? collapsible : ""}
            data-side={side}
            {...props}
          >
            <div data-sidebar="sidebar" className={mainClasses}>
              {children}
            </div>
          </div>
        </div>
      </SidebarSideContext.Provider>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef<
  React.ComponentRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      data-style="ghost"
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <MessageSquareIcon className="tiptap-button-icon" />
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => {
  const { toggleSidebar, state } = useSidebar()
  const side = React.useContext(SidebarSideContext)

  const railClasses = cn(
    "absolute top-0 bottom-0 z-20 w-4 -translate-x-1/2 transition-all duration-200 hidden sm:flex",
    "after:content-[''] after:absolute after:top-0 after:bottom-0 after:left-1/2 after:w-0.5",
    "hover:after:bg-neutral-200 dark:hover:after:bg-neutral-700",
    side === "left" && "right-[-1rem] cursor-w-resize",
    side === "right" && "left-0 cursor-e-resize",
    side === "left" && state === "collapsed" && "cursor-e-resize",
    side === "right" && state === "collapsed" && "cursor-w-resize",
    state === "collapsed" && "translate-x-0 after:left-full",
    state === "collapsed" && "hover:bg-neutral-100 dark:hover:bg-neutral-900",
    side === "left" && state === "collapsed" && "right-[-0.5rem]",
    side === "right" && state === "collapsed" && "left-[-0.5rem]",
    "sidebar-rail"
  )

  return (
    <button
      ref={ref}
      data-sidebar="rail"
      data-side={side}
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(railClasses, className)}
      {...props}
    />
  )
})
SidebarRail.displayName = "SidebarRail"

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"main">
>(({ className, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={cn(
        "relative flex w-full flex-1 flex-col sidebar-inset",
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn(
        "flex flex-col gap-2 p-2 sidebar-header",
        className
      )}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn(
        "flex flex-col gap-2 p-2 sidebar-footer",
        className
      )}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto sidebar-content",
        className
      )}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
}
