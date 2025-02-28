import Link from "next/link"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { Button } from "@/components/ui/button"

export async function Header() {
  const session = await getServerSession(authConfig)

  return (
    <header className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto py-4 px-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            StartWealth Capital
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

