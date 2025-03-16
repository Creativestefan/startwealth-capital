"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar 
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  isActive?: boolean
  items?: {
    title: string
    href: string
  }[]
}

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  const { collapsed } = useSidebar()

  return (
    <div className="px-3 py-2">
      {!collapsed && <div className="mb-2 text-xs font-medium text-gray-500">Navigation</div>}
      <div className="space-y-1">
        {items.map((item) => {
          const isActive = item.isActive || pathname === item.href || 
                          (item.items && pathname.startsWith(item.href) && pathname !== item.href);

          if (!item.items?.length) {
            return collapsed ? (
              <TooltipProvider key={item.href}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link 
                      href={item.href}
                      className={`flex h-10 w-10 items-center justify-center rounded-md ${
                        isActive ? "bg-white text-gray-900" : "text-gray-600 hover:bg-white hover:text-gray-900"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center" className="ml-1">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`flex h-10 items-center rounded-md px-3 text-sm font-medium ${
                  isActive ? "bg-white text-gray-900" : "text-gray-600 hover:bg-white hover:text-gray-900"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.title}
              </Link>
            )
          }

          const isGroupActive = isActive || item.items.some((subItem) => pathname === subItem.href);

          if (collapsed) {
            return (
              <TooltipProvider key={item.href}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={`flex h-10 w-10 items-center justify-center rounded-md ${
                        isGroupActive ? "bg-white text-gray-900" : "text-gray-600 hover:bg-white hover:text-gray-900"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center" className="ml-1">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          }

          return (
            <div key={item.href} className="space-y-1">
              <Collapsible
                defaultOpen={isGroupActive}
                className="space-y-1"
              >
                <CollapsibleTrigger
                  className={`flex w-full h-10 items-center justify-between rounded-md px-3 text-sm font-medium ${
                    isGroupActive ? "bg-white text-gray-900" : "text-gray-600 hover:bg-white hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center">
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.title}
                  </div>
                  <ChevronRight className="h-4 w-4 transition-transform ui-open:rotate-90" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-8 space-y-1">
                  {item.items.map((subItem) => {
                    const isSubActive = pathname === subItem.href;
                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`flex h-8 items-center rounded-md px-3 text-sm font-medium ${
                          isSubActive ? "bg-white text-gray-900" : "text-gray-600 hover:bg-white hover:text-gray-900"
                        }`}
                      >
                        {subItem.title}
                      </Link>
                    )
                  })}
                </CollapsibleContent>
              </Collapsible>
            </div>
          )
        })}
      </div>
    </div>
  )
}

