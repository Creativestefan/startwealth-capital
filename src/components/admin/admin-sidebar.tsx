"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Home,
  BarChart3,
  Settings,
  ShieldCheck,
  Wallet,
  LogOut,
  Leaf,
  Building,
  LineChart,
  CreditCard,
  Bell,
  UserCheck,
  FileText,
  DollarSign,
  Package,
  ChevronDown,
  Command,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const adminRoutes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Properties",
    icon: Building,
    color: "text-pink-500",
    subItems: [
      {
        label: "Listings",
        href: "/admin/properties",
        icon: Home,
      },
      {
        label: "Investment Plans",
        href: "/admin/properties/plans",
        icon: FileText,
      },
      {
        label: "Transactions",
        href: "/admin/properties/transactions",
        icon: CreditCard,
      },
      {
        label: "Analytics",
        href: "/admin/properties/analytics",
        icon: LineChart,
      },
    ],
  },
  {
    label: "Markets",
    icon: BarChart3,
    color: "text-orange-500",
    subItems: [
      {
        label: "Investment Plans",
        href: "/admin/markets/plans",
        icon: FileText,
      },
      {
        label: "Transactions",
        href: "/admin/markets/transactions",
        icon: CreditCard,
      },
      {
        label: "Analytics",
        href: "/admin/markets/analytics",
        icon: LineChart,
      },
    ],
  },
  {
    label: "Green Energy",
    icon: Leaf,
    color: "text-emerald-500",
    subItems: [
      {
        label: "Equipment",
        href: "/admin/green-energy/equipment",
        icon: Package,
      },
      {
        label: "Investment Plans",
        href: "/admin/green-energy/plans",
        icon: FileText,
      },
      {
        label: "Transactions",
        href: "/admin/green-energy/transactions",
        icon: CreditCard,
      },
      {
        label: "Analytics",
        href: "/admin/green-energy/analytics",
        icon: LineChart,
      },
    ],
  },
  {
    label: "Users",
    icon: Users,
    color: "text-violet-500",
    subItems: [
      {
        label: "All Users",
        href: "/admin/users",
        icon: Users,
      },
      {
        label: "KYC Verification",
        href: "/admin/users/kyc",
        icon: UserCheck,
      },
      {
        label: "Wallets",
        href: "/admin/users/wallets",
        icon: Wallet,
      },
      {
        label: "Investments",
        href: "/admin/users/investments",
        icon: DollarSign,
      },
      {
        label: "Referrals",
        href: "/admin/users/referrals",
        icon: Users,
      },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/admin/settings",
    color: "text-blue-500",
    subItems: [
      {
        label: "Profile",
        href: "/admin/settings/profile",
        icon: Users,
      },
      {
        label: "Security",
        href: "/admin/settings/security",
        icon: ShieldCheck,
      },
      {
        label: "Notifications",
        href: "/admin/settings/notifications",
        icon: Bell,
      },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})

  // Initialize open menus based on active route
  useEffect(() => {
    const initialOpenMenus: Record<string, boolean> = {};
    
    adminRoutes.forEach(route => {
      if (route.subItems && route.subItems.some(item => pathname.startsWith(item.href || ''))) {
        initialOpenMenus[route.label] = true;
      }
    });
    
    setOpenMenus(initialOpenMenus);
  }, [pathname]);

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }))
  }

  const isRouteActive = (href: string | undefined) => {
    if (!href) return false
    
    if (href === "/admin/dashboard" && pathname === "/admin/dashboard") {
      return true
    }
    
    return pathname.startsWith(href)
  }

  return (
    <div className="flex h-full w-full flex-col border-r bg-background">
      {/* Logo and branding */}
      <div className="py-2 px-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
            <Command className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold">StartWealth</h2>
            <p className="text-xs text-muted-foreground">Admin Portal</p>
          </div>
        </div>
        <Separator className="my-2" />
      </div>
      
      {/* Navigation */}
      <div className="flex-1 overflow-auto py-2 px-2">
        <nav className="grid items-start text-sm font-medium">
          {adminRoutes.map((route) => (
            <div key={route.label} className="mb-1">
              {route.subItems ? (
                <>
                  <button
                    onClick={() => toggleMenu(route.label)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 transition-all hover:bg-muted",
                      (route.subItems?.some(item => isRouteActive(item.href)) || 
                       isRouteActive(route.href))
                        ? "bg-muted/80 text-primary font-semibold"
                        : "text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("p-1.5 rounded-md bg-muted/50", route.color)}>
                        <route.icon className={cn("h-4 w-4", route.color)} />
                      </div>
                      {route.label}
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform text-muted-foreground",
                        openMenus[route.label] ? "rotate-180" : ""
                      )}
                    />
                  </button>
                  {openMenus[route.label] && (
                    <div className="ml-4 mt-1 space-y-1 pl-4 border-l border-muted">
                      {route.subItems.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href || "#"}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 transition-all hover:bg-muted",
                            isRouteActive(subItem.href)
                              ? "bg-muted/50 text-primary font-medium"
                              : "text-muted-foreground"
                          )}
                        >
                          <subItem.icon className="h-4 w-4" />
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={route.href || "#"}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 transition-all hover:bg-muted",
                    isRouteActive(route.href)
                      ? "bg-muted/80 text-primary font-semibold"
                      : "text-muted-foreground"
                  )}
                >
                  <div className={cn("p-1.5 rounded-md bg-muted/50", route.color)}>
                    <route.icon className={cn("h-4 w-4", route.color)} />
                  </div>
                  {route.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>
      
      {/* Footer */}
      <div className="mt-auto p-4 border-t">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 py-2.5"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p>StartWealth Capital</p>
          <p>Admin v1.0</p>
        </div>
      </div>
    </div>
  )
} 