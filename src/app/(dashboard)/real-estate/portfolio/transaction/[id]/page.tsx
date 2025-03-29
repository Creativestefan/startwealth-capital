export const dynamic = 'force-dynamic';
import { getPropertyTransactionById } from "@/lib/real-estate/actions/portfolio"
import { PropertyTransactionDetail } from "@/components/real-estate/property/property-transaction-detail"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { redirect } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default async function TransactionDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authConfig)
  
  if (!session?.user) {
    redirect("/login")
  }
  
  // Ensure email is verified
  if (!session.user.emailVerified) {
    redirect(`/verify-email?email=${session.user.email}`)
  }

  // Check KYC status
  if (!session.user.kycStatus || session.user.kycStatus === "PENDING") {
    redirect("/dashboard?kyc=required")
  }
  
  try {
    // Ensure params is awaited before accessing its properties
    const paramsData = await params
    const id = paramsData.id
    const transactionResponse = await getPropertyTransactionById(id)
    
    if (!transactionResponse.success || !transactionResponse.data) {
      return (
        <div className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {transactionResponse.error || "Transaction not found. Please try again later."}
            </AlertDescription>
          </Alert>
        </div>
      )
    }
    
    const transaction = transactionResponse.data
    
    return (
      <div className="container py-10">
        <div className="max-w-4xl mx-auto">
          <PropertyTransactionDetail transaction={transaction} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error fetching transaction:", error)
    
    return (
      <div className="container py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Error</h1>
          <p>There was an error loading the transaction details. Please try again later.</p>
        </div>
      </div>
    )
  }
}

// Loading state
export function Loading() {
  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-8 w-full mt-4" />
            <Skeleton className="h-4 w-3/4 mt-2" />
            <Skeleton className="h-20 w-full mt-4" />
          </div>
          <div>
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-3/4 mt-2" />
            <div className="space-y-2 mt-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 