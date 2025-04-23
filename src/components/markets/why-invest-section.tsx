"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function WhyInvestSection() {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Why Invest in Markets?</CardTitle>
        <CardDescription>
          Strategic investments for financial growth
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <h3 className="font-semibold">Diversified Portfolio</h3>
            <p className="text-sm text-muted-foreground">
              Market investments allow you to diversify your portfolio across various sectors and industries, 
              reducing risk while maximizing potential returns.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Competitive Returns</h3>
            <p className="text-sm text-muted-foreground">
              Our market investment plans offer attractive returns with carefully selected 
              investment strategies designed to outperform traditional savings options.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Long-term Growth</h3>
            <p className="text-sm text-muted-foreground">
              Market investments have historically provided substantial long-term growth, 
              helping you build wealth and achieve your financial goals over time.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 