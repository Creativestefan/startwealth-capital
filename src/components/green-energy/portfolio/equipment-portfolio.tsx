"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EquipmentTransactionTable } from "./equipment-transaction-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { TransactionStatus } from "@prisma/client"

interface EquipmentTransaction {
  id: string
  equipment?: {
    id: string
    name: string
    type: string
  } | null
  totalAmount: number
  status: TransactionStatus
  createdAt: string
  updatedAt: string
  trackingNumber?: string | null
}

interface EquipmentPortfolioProps {
  transactions: EquipmentTransaction[]
}

/**
 * Displays the user's equipment portfolio with a table of transactions
 * and a button to browse more equipment
 */
export function EquipmentPortfolio({ transactions }: EquipmentPortfolioProps) {
  const router = useRouter()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>My Green Energy Equipment</CardTitle>
          <CardDescription>Equipment you've purchased for sustainable energy generation</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={() => router.push("/green-energy/equipment")}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Browse Equipment
        </Button>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-sm text-muted-foreground">You haven't purchased any green energy equipment yet.</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push("/green-energy/equipment")}>
              Browse Available Equipment
            </Button>
          </div>
        ) : (
          <EquipmentTransactionTable transactions={transactions} />
        )}
      </CardContent>
    </Card>
  )
} 