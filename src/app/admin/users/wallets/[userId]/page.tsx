export const dynamic = 'force-dynamic';
import { Suspense } from "react"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { getUserWalletForAdmin } from "@/lib/wallet/admin-actions"
import { UserWalletDetail } from "@/components/admin/wallets/user-wallet-detail"

export const metadata: Metadata = {
  title: "User Wallet Details | Admin Dashboard",
  description: "Manage user wallet details and transactions",
}

interface UserWalletPageProps {
  params: {
    userId: string
  }
}

export default async function UserWalletPage({ params }: UserWalletPageProps) {
  // In Next.js 15, we need to await the params object
  const resolvedParams = await Promise.resolve(params);
  const userId = resolvedParams.userId;
  
  const result = await getUserWalletForAdmin(userId)
  
  if (!result.success || !result.data) {
    notFound()
  }
  
  const wallet = result.data
  
  return (
    <div className="container py-8 max-w-7xl">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">
            Wallet for {wallet.wallet.user.firstName} {wallet.wallet.user.lastName}
          </h2>
          <p className="text-muted-foreground">
            Manage wallet details, transactions, and balance
          </p>
        </div>
        <Link href="/admin/users/wallets">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Wallets
          </Button>
        </Link>
      </div>
      <Separator className="my-6" />
      <Suspense fallback={<div>Loading wallet details...</div>}>
        <UserWalletDetail wallet={wallet} />
      </Suspense>
    </div>
  )
} 