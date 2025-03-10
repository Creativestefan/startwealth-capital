"use client"

import { NavUser } from "@/components/dashboard/nav-user"
import { AdminNavUser } from "@/components/admin/admin-nav-user"
import { Bell, Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import Link from "next/link"

export function DashboardHeader({ user, isAdmin = false }: { 
  user: any; 
  isAdmin?: boolean 
}) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-4">
        {/* Mobile menu for admin */}
        {isAdmin && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <AdminSidebar />
            </SheetContent>
          </Sheet>
        )}
        
       
        {/* <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <span className="text-sm font-bold text-primary-foreground">SW</span>
          </div>
          <span className="text-lg font-semibold hidden md:inline-block">
            {isAdmin ? "Admin Panel" : "Dashboard"}
          </span>
        </div> */}
      </div>
      
      <div className="flex items-center gap-4">
        {/* Search bar - only visible on larger screens */}
        {isAdmin && (
          <div className="hidden md:flex relative w-40 lg:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8 h-9"
            />
          </div>
        )}
        
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
          <span className="sr-only">Notifications</span>
        </Button>
        
        {/* User menu - use AdminNavUser for admin users */}
        {isAdmin ? (
          <AdminNavUser user={{
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            image: user.image
          }} />
        ) : (
          <NavUser user={{
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            image: user.image,
            role: user.role
          }} />
        )}
      </div>
    </header>
  )
} 