import Link from "next/link"
import { Building2 } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">About</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Investments</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/real-estate" className="text-muted-foreground hover:text-foreground">
                  Real Estate
                </Link>
              </li>
              <li>
                <Link href="/green-energy" className="text-muted-foreground hover:text-foreground">
                  Green Energy
                </Link>
              </li>
              <li>
                <Link href="/market-funds" className="text-muted-foreground hover:text-foreground">
                  Market Funds
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-3">
              <Building2 className="h-6 w-6" />
              <span className="text-xl font-bold">StratWealth Capital</span>
            </div>
          </div>
          <div className="mt-8 md:mt-0 text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} StratWealth Capital. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}

