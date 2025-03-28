import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth.config"
import { Button } from "@/components/ui/button"
import { Building2 } from "lucide-react"

export async function Header() {
  const session = await getServerSession(authConfig)
  
  // Don't show the shared header on admin pages
  if (session?.user?.role === "ADMIN") {
    return null;
  }
  
  return (
    <header className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto py-4 px-4">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center space-x-2"
          >
            <Building2 className="h-6 w-6" />
            <span className="font-semibold">StratWealth Capital</span>
          </Link>
          <div className="space-x-4">
            {session ? (
              <Button asChild variant="ghost">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Start Investing</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

