"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function WhyInvestSection() {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Why Invest in Green Energy?</CardTitle>
        <CardDescription>
          Sustainable investments for a better future
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <h3 className="font-semibold">Environmental Impact</h3>
            <p className="text-sm text-muted-foreground">
              By investing in green energy, you're directly contributing to reducing carbon emissions
              and supporting sustainable energy production methods.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Competitive Returns</h3>
            <p className="text-sm text-muted-foreground">
              Our green energy investment plans offer competitive returns compared to traditional
              investment options, with the added benefit of supporting environmental sustainability.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Future-Proof Investment</h3>
            <p className="text-sm text-muted-foreground">
              As the world transitions to renewable energy sources, green energy investments are
              positioned for long-term growth and stability.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 