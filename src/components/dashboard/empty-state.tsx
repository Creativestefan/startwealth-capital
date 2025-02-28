import Link from "next/link"
import { Building2, Leaf, LineChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function EmptyState() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Start Your Investment Journey</h2>
        <p className="text-muted-foreground">Choose from our diverse range of investment opportunities</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Real Estate</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            <CardDescription>
              Invest in premium properties with high appreciation potential and steady rental income. Starting from
              $300,000.
            </CardDescription>
            <div className="mt-auto">
              <Button asChild className="w-full">
                <Link href="/dashboard/investment/real-estate">View Properties</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Green Energy</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            <CardDescription>
              Support sustainable future while earning returns from renewable energy projects. Starting from $300,000.
            </CardDescription>
            <div className="mt-auto">
              <Button asChild className="w-full">
                <Link href="/dashboard/investment/green-energy">Explore Projects</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <LineChart className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Markets</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            <CardDescription>
              Diversify your portfolio with our expertly managed market investment plans. Starting from $300,000.
            </CardDescription>
            <div className="mt-auto">
              <Button asChild className="w-full">
                <Link href="/dashboard/investment/markets">View Plans</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

