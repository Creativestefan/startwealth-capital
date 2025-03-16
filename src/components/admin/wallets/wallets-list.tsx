"use client"

import { useState } from "react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface WalletsListProps {
  wallets: any[]
  error?: string
}

export function WalletsList({ wallets, error }: WalletsListProps) {
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load wallets</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    )
  }
  
  // Check if wallets array is empty
  if (!wallets || wallets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Wallets</CardTitle>
          <CardDescription>No user wallets found in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <p>There are no user wallets available at this time.</p>
        </CardContent>
      </Card>
    )
  }
  
  // Filter wallets to only show users with the "USER" role
  // If role is not available, include all wallets
  const userWallets = wallets.filter(wallet => 
    !wallet.user.role || wallet.user.role === "USER"
  )
  
  console.log("Total wallets:", wallets.length)
  console.log("User wallets:", userWallets.length)
  
  return <WalletsListClient wallets={userWallets} />
}

interface WalletsListClientProps {
  wallets: any[]
}

function WalletsListClient({ wallets }: WalletsListClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  
  const filteredWallets = wallets.filter((wallet) => {
    const fullName = `${wallet.user.firstName} ${wallet.user.lastName}`.toLowerCase()
    const email = wallet.user.email.toLowerCase()
    const query = searchQuery.toLowerCase()
    
    return fullName.includes(query) || email.includes(query)
  })
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>BTC Address</TableHead>
              <TableHead>USDT Address</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWallets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No wallets found.
                </TableCell>
              </TableRow>
            ) : (
              filteredWallets.map((wallet) => (
                <TableRow key={wallet.id}>
                  <TableCell className="font-medium">
                    {wallet.user.firstName} {wallet.user.lastName}
                  </TableCell>
                  <TableCell>{wallet.user.email}</TableCell>
                  <TableCell>{formatCurrency(wallet.balance)}</TableCell>
                  <TableCell>
                    <div className="font-mono text-xs truncate max-w-[120px]">
                      {wallet.btcAddress || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-xs truncate max-w-[120px]">
                      {wallet.usdtAddress || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/users/wallets/${wallet.user.id}`}>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 