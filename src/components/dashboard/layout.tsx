"use client"

import type * as React from "react"
import { Building2, Command, HelpCircle, Leaf, LineChart, Wallet } from "lucide-react"
import { useSession } from "next-auth/react"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarProvider } from "@/components/ui/sidebar"

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Command,
  },
  {
    title: "Real Estate",
    href: "/real-estate",
    icon: Building2,
    items: [
      {
        title: "Properties",
        href: "/real-estate/properties",
      },
      {
        title: "Shares",
        href: "/real-estate/shares",
      },
      {
        title: "My Portfolio",
        href: "/real-estate/portfolio",
      },
    ],
  },
  {
    title: "Green Energy",
    href: "/green-energy",
    icon: Leaf,
    items: [
      {
        title: "Equipment",
        href: "/green-energy/equipment",
      },
      {
        title: "Shares",
        href: "/green-energy/shares",
      },
      {
        title: "My Portfolio",
        href: "/green-energy/portfolio",
      },
    ],
  },
  {
    title: "Markets",
    href: "/markets",
    icon: LineChart,
    items: [
      {
        title: "Shares",
        href: "/markets/shares",
      },
      {
        title: "My Portfolio",
        href: "/markets/portfolio",
      },
    ],
  },
  {
    title: "Wallet",
    href: "/wallet",
    icon: Wallet,
  },
  {
    title: "Get Help",
    href: "/help",
    icon: HelpCircle,
  },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession()

  if (!session?.user) {
    return null
  }

  // Ensure we have the required user data with fallbacks
  const user = {
    firstName: session.user.firstName || "User",
    lastName: session.user.lastName || "",
    email: session.user.email || "",
    image: session.user.image || null,
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <Sidebar className="border-r shadow-sm">
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Command className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="grid">
                <span className="text-sm font-semibold">StartWealth Capital</span>
                <span className="text-xs text-muted-foreground">Investment Platform</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <NavMain items={navigationItems} />
          </SidebarContent>
          <SidebarFooter className="p-2">
            <NavUser user={user} />
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarProvider>
    </div>
  )
}

