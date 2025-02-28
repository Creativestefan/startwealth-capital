"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_ICON = "4rem"

type SidebarContext = {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultCollapsed?: boolean
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

const SidebarProvider = React.forwardRef<HTMLDivElement, SidebarProviderProps>(
  ({ defaultCollapsed = false, collapsed: collapsedProp, onCollapsedChange, className, children, ...props }, ref) => {
    const [collapsed, setCollapsed] = React.useState(defaultCollapsed)

    const value = React.useMemo(
      () => ({
        collapsed: collapsedProp ?? collapsed,
        setCollapsed: (value: boolean) => {
          setCollapsed(value)
          onCollapsedChange?.(value)
        },
      }),
      [collapsed, collapsedProp, onCollapsedChange],
    )

    return (
      <SidebarContext.Provider value={value}>
        <div ref={ref} className={cn("grid min-h-screen w-full lg:grid-cols-[auto_1fr]", className)} {...props}>
          {children}
        </div>
      </SidebarContext.Provider>
    )
  },
)
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { collapsed } = useSidebar()

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex h-screen w-[var(--sidebar-width)] flex-col overflow-hidden border-r bg-card transition-all",
          collapsed && "w-[var(--sidebar-width-icon)]",
          className,
        )}
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
          } as React.CSSProperties
        }
        {...props}
      />
    )
  },
)
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex h-14 items-center border-b px-4", className)} {...props} />
  ),
)
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex-1 overflow-auto", className)} {...props} />,
)
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("border-t", className)} {...props} />,
)
SidebarFooter.displayName = "SidebarFooter"

const sidebarItemVariants = cva(
  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors duration-150 ease-in-out",
  {
    variants: {
      variant: {
        default: "text-muted-foreground hover:bg-secondary hover:text-foreground",
        active: "bg-secondary text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

interface SidebarItemProps extends React.HTMLAttributes<HTMLAnchorElement>, VariantProps<typeof sidebarItemVariants> {
  asChild?: boolean
  href?: string
}

const SidebarItem = React.forwardRef<HTMLAnchorElement, SidebarItemProps>(
  ({ className, variant, asChild = false, href, ...props }, ref) => {
    const Comp = asChild ? Slot : "a"
    return <Comp ref={ref} href={href} className={cn(sidebarItemVariants({ variant, className }))} {...props} />
  },
)
SidebarItem.displayName = "SidebarItem"

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarItem,
  SidebarProvider,
  useSidebar,
  type SidebarItemProps,
}

