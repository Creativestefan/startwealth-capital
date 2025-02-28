"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SidebarItem } from "@/components/ui/sidebar"

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

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        const isActive = item.isActive || pathname === item.href

        if (!item.items?.length) {
          return (
            <SidebarItem key={item.href} asChild variant={isActive ? "active" : "default"}>
              <Link href={item.href}>
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            </SidebarItem>
          )
        }

        const isGroupActive = item.items.some((subItem) => pathname === subItem.href)

        return (
          <Collapsible key={item.href} defaultOpen={isGroupActive}>
            <SidebarItem asChild variant={isGroupActive ? "active" : "default"}>
              <CollapsibleTrigger className="flex w-full items-center">
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
                <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
              </CollapsibleTrigger>
            </SidebarItem>
            <CollapsibleContent className="pl-6 pt-2">
              <div className="flex flex-col gap-2">
                {item.items.map((subItem) => (
                  <SidebarItem key={subItem.href} asChild variant={pathname === subItem.href ? "active" : "default"}>
                    <Link href={subItem.href}>{subItem.title}</Link>
                  </SidebarItem>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )
      })}
    </div>
  )
}

