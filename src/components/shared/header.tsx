import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth.config"
import { Button } from "@/components/ui/button"
import { Building2, ChevronDown, Menu, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"

export async function Header() {
  const session = await getServerSession(authConfig)
  
  // Don't show the shared header on admin pages
  if (session?.user?.role === "ADMIN") {
    return null;
  }
  
  return (
    <header className="sticky top-0 w-full z-50 bg-white shadow-sm">
      <div className="container mx-auto py-4 px-4">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center space-x-2"
          >
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">SW</span>
            </div>
            <span className="text-xl font-bold">
              <span className="text-secondary">Strat</span><span className="text-primary">Wealth</span> Capital
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary transition-colors font-medium">
              Home
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="text-gray-700 hover:text-primary transition-colors font-medium flex items-center focus:outline-none">
                Invest <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-white mt-2 z-50">
                <DropdownMenuItem asChild>
                  <Link href="/property-investments" className="w-full hover:bg-primary hover:text-white">
                    Real Estate
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/green-energy-investments" className="w-full hover:bg-primary hover:text-white">
                    Green Energy
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/markets-investments" className="w-full hover:bg-primary hover:text-white">
                    Financial Markets
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link href="/about" className="text-gray-700 hover:text-primary transition-colors font-medium">
              About Us
            </Link>
            
            <Link href="/contact" className="text-gray-700 hover:text-primary transition-colors font-medium">
              Contact
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <Button asChild variant="default" className="bg-primary text-white hover:bg-primary/90">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="bg-primary text-white hover:bg-primary/90">
                  <Link href="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button - This would need client-side interactivity */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
