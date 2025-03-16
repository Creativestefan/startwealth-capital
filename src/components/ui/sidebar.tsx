"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Constants for sidebar widths
const SIDEBAR_WIDTH = "260px"
const SIDEBAR_WIDTH_ICON = "60px"

// Sidebar context for state management
type SidebarContext = {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  isMobile: boolean
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

// Sidebar provider props
interface SidebarProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultCollapsed?: boolean
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

// Sidebar provider component
const SidebarProvider = React.forwardRef<HTMLDivElement, SidebarProviderProps>(
  ({ defaultCollapsed = false, collapsed: collapsedProp, onCollapsedChange, className, children, ...props }, ref) => {
    const [collapsed, setCollapsed] = React.useState(defaultCollapsed)
    const [isMobile, setIsMobile] = React.useState(false)

    // Check if we're on mobile
    React.useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768)
      }
      
      checkMobile()
      window.addEventListener("resize", checkMobile)
      
      return () => {
        window.removeEventListener("resize", checkMobile)
      }
    }, [])

    const value = React.useMemo(
      () => ({
        collapsed: collapsedProp ?? collapsed,
        setCollapsed: (value: boolean) => {
          setCollapsed(value)
          onCollapsedChange?.(value)
        },
        isMobile,
      }),
      [collapsed, collapsedProp, onCollapsedChange, isMobile],
    )

    return (
      <SidebarContext.Provider value={value}>
        <div ref={ref} className={cn("relative min-h-screen w-full", className)} {...props}>
          {children}
        </div>
      </SidebarContext.Provider>
    )
  },
)
SidebarProvider.displayName = "SidebarProvider"

// Main sidebar component
interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsible?: "icon" | "full" | false
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, collapsible = "icon", ...props }, ref) => {
    const { collapsed } = useSidebar()

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex h-screen w-[var(--sidebar-width)] flex-col overflow-hidden bg-white border-r transition-all duration-300 ease-in-out",
          collapsed && collapsible === "icon" && "w-[var(--sidebar-width-icon)]",
          className,
        )}
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
          } as React.CSSProperties
        }
        data-collapsible={collapsible}
        {...props}
      />
    )
  },
)
Sidebar.displayName = "Sidebar"

// Sidebar header component
const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { collapsed, isMobile } = useSidebar()
    
    return (
      <div 
        ref={ref} 
        className={cn(
          "flex h-14 items-center border-b px-4 transition-all duration-300",
          collapsed && !isMobile && "justify-center px-2",
          className
        )} 
        {...props} 
      />
    )
  },
)
SidebarHeader.displayName = "SidebarHeader"

// Sidebar content component
const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex-1 overflow-auto", className)} {...props} />
  ),
)
SidebarContent.displayName = "SidebarContent"

// Sidebar footer component
const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("border-t", className)} {...props} />
  ),
)
SidebarFooter.displayName = "SidebarFooter"

// Sidebar group component
const SidebarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("py-2", className)} {...props} />
  ),
)
SidebarGroup.displayName = "SidebarGroup"

// Sidebar group label component
const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { collapsed } = useSidebar()
    
    return (
      <div 
        ref={ref} 
        className={cn(
          "px-4 py-1 text-xs font-medium text-gray-500",
          collapsed && "sr-only",
          className
        )} 
        {...props} 
      />
    )
  },
)
SidebarGroupLabel.displayName = "SidebarGroupLabel"

// Sidebar menu component
const SidebarMenu = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("grid gap-1 px-2", className)} {...props} />
  ),
)
SidebarMenu.displayName = "SidebarMenu"

// Sidebar menu item component
const SidebarMenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("relative", className)} {...props} />
  ),
)
SidebarMenuItem.displayName = "SidebarMenuItem"

// Sidebar menu button variants
const sidebarMenuButtonVariants = cva(
  "group relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "text-gray-600 hover:bg-gray-100",
        active: "bg-gray-100 text-gray-900",
      },
      size: {
        default: "h-9",
        sm: "h-8",
        lg: "h-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

// Sidebar menu button props
interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean
  tooltip?: string
}

// Sidebar menu button component
const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, variant, size, asChild = false, tooltip, ...props }, ref) => {
    const { collapsed } = useSidebar()
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        ref={ref}
        className={cn(
          sidebarMenuButtonVariants({ variant, size, className }),
          collapsed && "justify-center px-2"
        )}
        data-tooltip={tooltip}
        {...props}
      />
    )
  },
)
SidebarMenuButton.displayName = "SidebarMenuButton"

// Sidebar menu action component
const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { showOnHover?: boolean }
>(({ className, showOnHover, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900",
      showOnHover && "opacity-0 group-hover:opacity-100",
      className
    )}
    {...props}
  />
))
SidebarMenuAction.displayName = "SidebarMenuAction"

// Sidebar menu sub component
const SidebarMenuSub = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("grid gap-1 pl-6", className)} {...props} />
  ),
)
SidebarMenuSub.displayName = "SidebarMenuSub"

// Sidebar menu sub item component
const SidebarMenuSubItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("relative", className)} {...props} />
  ),
)
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

// Sidebar menu sub button variants
const sidebarMenuSubButtonVariants = cva(
  "group relative flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "text-gray-600 hover:bg-gray-100",
        active: "bg-gray-100 text-gray-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

// Sidebar menu sub button props
interface SidebarMenuSubButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof sidebarMenuSubButtonVariants> {
  asChild?: boolean
}

// Sidebar menu sub button component
const SidebarMenuSubButton = React.forwardRef<HTMLButtonElement, SidebarMenuSubButtonProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        ref={ref}
        className={cn(sidebarMenuSubButtonVariants({ variant, className }))}
        {...props}
      />
    )
  },
)
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

// Export all components
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  useSidebar,
  type SidebarMenuButtonProps,
  type SidebarMenuSubButtonProps,
  type SidebarProps,
}

