import Link from "next/link"
import { BarChart3, Building2, Leaf, LineChart, Shield, TrendingUp } from "lucide-react"
import { Header } from "@/components/shared/header"
import { Footer } from "@/components/shared/footer"

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                Your Gateway to Premium Investments
              </h1>
              <p className="text-xl text-muted-foreground">
                Join thousands of investors building wealth through our curated investment opportunities in real estate,
                green energy, and market funds.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/register"
                  className="px-8 py-4 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors"
                >
                  Start with $300,000
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 bg-secondary text-secondary-foreground font-medium rounded-md hover:bg-secondary/90 transition-colors"
                >
                  View Opportunities
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-primary">$2.5B+</div>
                <div className="text-muted-foreground">Assets Under Management</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-primary">15,000+</div>
                <div className="text-muted-foreground">Active Investors</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-primary">12%</div>
                <div className="text-muted-foreground">Average Annual Returns</div>
              </div>
            </div>
          </div>
        </section>

        {/* Investment Categories */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Premium Investment Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
                <Building2 className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Real Estate</h3>
                <p className="text-muted-foreground mb-4">
                  Invest in premium properties with high appreciation potential and steady rental income.
                </p>
                <Link href="/register" className="text-primary hover:underline">
                  Learn more →
                </Link>
              </div>
              <div className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
                <Leaf className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Green Energy</h3>
                <p className="text-muted-foreground mb-4">
                  Support sustainable future while earning returns from renewable energy projects.
                </p>
                <Link href="/register" className="text-primary hover:underline">
                  Learn more →
                </Link>
              </div>
              <div className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
                <LineChart className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Market Funds</h3>
                <p className="text-muted-foreground mb-4">
                  Diversified investment options managed by expert financial advisors.
                </p>
                <Link href="/register" className="text-primary hover:underline">
                  Learn more →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose StartWealth Capital</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <Shield className="w-12 h-12 text-primary" />
                <h3 className="text-xl font-semibold">Secure Investments</h3>
                <p className="text-muted-foreground">
                  All investments are thoroughly vetted and secured with advanced protection measures.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <BarChart3 className="w-12 h-12 text-primary" />
                <h3 className="text-xl font-semibold">Expert Management</h3>
                <p className="text-muted-foreground">
                  Our team of financial experts ensures optimal portfolio performance.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <TrendingUp className="w-12 h-12 text-primary" />
                <h3 className="text-xl font-semibold">Consistent Returns</h3>
                <p className="text-muted-foreground">Track record of delivering steady returns across market cycles.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold">Ready to Start Building Wealth?</h2>
              <p className="text-xl text-muted-foreground">
                Join StartWealth Capital today and access premium investment opportunities starting from $300,000.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/register"
                  className="px-8 py-4 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors"
                >
                  Create Account
                </Link>
                <Link
                  href="/contact"
                  className="px-8 py-4 bg-secondary text-secondary-foreground font-medium rounded-md hover:bg-secondary/90 transition-colors"
                >
                  Talk to an Advisor
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

