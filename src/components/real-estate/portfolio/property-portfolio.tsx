"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PropertyTransactionTable } from "./property-transaction-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import type { PropertyTransaction } from "@/lib/real-estate/types"

interface PropertyPortfolioProps {
  transactions: PropertyTransaction[]
}

/**
 * Displays the user's property portfolio with a table of transactions
 * and a button to add more properties
 */
export function PropertyPortfolio({ transactions }: PropertyPortfolioProps) {
  const router = useRouter()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>My Properties</CardTitle>
          <CardDescription>Properties you've purchased or are paying in installments</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={() => router.push("/real-estate/property")}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Browse Properties
        </Button>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-sm text-muted-foreground">You haven't purchased any properties yet.</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push("/real-estate/property")}>
              Browse Available Properties
            </Button>
          </div>
        ) : (
          <PropertyTransactionTable transactions={transactions} />
        )}
      </CardContent>
    </Card>
  )
}

