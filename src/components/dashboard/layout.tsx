"use client"

import type * as React from "react"
import { useState, useEffect } from "react"
import { Building2, Command, HelpCircle, Leaf, LineChart, Wallet, Menu, ChevronLeft } from "lucide-react"
import { useSession } from "next-auth/react"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

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

// Toggle button component for the sidebar
function SidebarToggle() {
  const { collapsed, setCollapsed } = useSidebar()
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="absolute right-[-12px] top-4 h-6 w-6 rounded-full border bg-white shadow-md z-30"
      onClick={() => setCollapsed(!collapsed)}
    >
      {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
    </Button>
  )
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Use useEffect to handle client-side rendering
  useEffect(() => {
    setMounted(true)
    
    // Check if there's a saved preference in localStorage
    const savedCollapsed = localStorage.getItem('sidebarCollapsed') === 'true'
    if (savedCollapsed !== collapsed) {
      setCollapsed(savedCollapsed)
    }
  }, [])

  // Save preference to localStorage when it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebarCollapsed', String(collapsed))
    }
  }, [collapsed, mounted])

  if (!session?.user) {
    return null
  }

  // Ensure we have the required user data with fallbacks
  const user = {
    firstName: session.user.firstName || "User",
    lastName: session.user.lastName || "",
    email: session.user.email || "",
    image: session.user.image || null,
    role: session.user.role,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarProvider defaultCollapsed={collapsed} onCollapsedChange={setCollapsed}>
        <div className={`fixed left-0 top-0 z-20 h-screen bg-gray-50 border-r shadow-sm transition-all duration-300 ${collapsed ? 'w-[60px]' : 'w-[260px]'}`}>
          <SidebarToggle />
          
          {/* Header */}
          <div className={`flex h-14 items-center border-b px-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white">
                <Command className="h-4 w-4" />
              </div>
              {!collapsed && (
                <div>
                  <div className="text-sm font-semibold">StartWealth Capital</div>
                  <div className="text-xs text-gray-500">Investment Platform</div>
                </div>
              )}
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex flex-col h-[calc(100vh-3.5rem)]">
            <div className="flex-1 overflow-auto py-2">
              <NavMain items={navigationItems} />
            </div>
            
            {/* User */}
            <NavUser user={user} />
          </div>
        </div>
        
        <main className="transition-all duration-300 bg-white" style={{ 
          marginLeft: collapsed ? "60px" : "260px",
          minHeight: "100vh",
          padding: "1.5rem"
        }}>
          {children}
        </main>
      </SidebarProvider>
    </div>
  )
}

