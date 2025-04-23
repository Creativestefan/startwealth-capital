export const dynamic = 'force-dynamic';
import { Suspense } from "react"
import { Metadata } from "next"
import { Separator } from "@/components/ui/separator"
import { WalletsList } from "@/components/admin/wallets/wallets-list"
import { getAllWallets } from "@/lib/wallet/admin-actions"

export const metadata: Metadata = {
  title: "User Wallets | Admin Dashboard",
  description: "Manage user wallets and transactions",
}

export default async function AdminWalletsPage() {
  const result = await getAllWallets()
  
  return (
    <div className="container py-8 max-w-7xl">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">User Wallets</h2>
        <p className="text-muted-foreground">
          Manage user wallets, approve transactions, and fund or deduct from user balances
        </p>
      </div>
      <Separator className="my-6" />
      <Suspense fallback={<div>Loading wallets...</div>}>
        <WalletsList 
          wallets={result.success ? (result.data || []) : []} 
          error={result.success ? undefined : result.error} 
        />
      </Suspense>
    </div>
  )
} 