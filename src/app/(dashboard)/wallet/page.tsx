export const dynamic = 'force-dynamic';
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"
import { WalletOverview } from "@/components/wallet/wallet-overview"
import { DepositFunds } from "@/components/wallet/deposit-funds"
import { PayoutFunds } from "@/components/wallet/payout-funds"
import { TransactionHistory } from "@/components/wallet/transaction-history"
import { KycRequired } from "@/components/shared/kyc-required"
import { getUserPropertyTransactions } from "@/lib/data/transactions"

// Set revalidation interval to 30 seconds for real-time updates
export const revalidate = 30

export default async function WalletPage() {
  const session = await getServerSession(authConfig)
  
  if (!session?.user?.id) {
    redirect("/login")
  }
  
  // Get user with wallet and KYC info
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      wallet: {
        include: {
          transactions: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      },
      kyc: true,
    },
  })
  
  if (!user) {
    redirect("/dashboard")
  }
  
  const kycVerified = user.kyc?.status === "APPROVED"
  
  if (!kycVerified) {
    redirect("/profile/kyc")
  }
  
  if (!user.wallet) {
    // Create a wallet for the user if they don't have one
    await prisma.wallet.create({
      data: {
        userId: user.id,
        balance: 0,
        btcAddress: `bc1${Math.random().toString(36).substring(2, 15)}`,
        usdtAddress: `T${Math.random().toString(36).substring(2, 15)}`,
      },
    })
    
    // Refresh the page to show the new wallet
    redirect("/wallet")
  }
  
  // Fetch property transactions for the user
  const propertyTransactions = await getUserPropertyTransactions(user.id)
  
  return (
    <>
      <script dangerouslySetInnerHTML={{
        __html: `
          localStorage.setItem('userFirstName', ${JSON.stringify(user.firstName || '')});
          localStorage.setItem('userLastName', ${JSON.stringify(user.lastName || '')});
        `
      }} />
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground">
            Manage your funds, make deposits, payouts, and view your transaction history.
          </p>
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="payout">Payout</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <WalletOverview wallet={user.wallet} />
          </TabsContent>
          
          <TabsContent value="deposit" className="mt-6">
            <DepositFunds wallet={user.wallet} />
          </TabsContent>
          
          <TabsContent value="payout" className="mt-6">
            <PayoutFunds wallet={user.wallet} />
          </TabsContent>
          
          <TabsContent value="transactions" className="mt-6">
            <TransactionHistory wallet={user.wallet} propertyTransactions={propertyTransactions || []} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
} 