import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authConfig } from "@/lib/auth.config"
import { getUserEquipmentTransactions } from "@/lib/green-energy/actions/equipment"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { EquipmentPortfolio } from "@/components/green-energy/portfolio/equipment-portfolio"

/**
 * Green Energy Equipment Portfolio page
 * Displays the user's green energy equipment purchases
 */
export default async function EquipmentPortfolioPage() {
  const session = await getServerSession(authConfig)

  if (!session || !session.user) {
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

  // Get user's equipment transactions
  const result = await getUserEquipmentTransactions()
  const equipmentTransactions = result.success && result.data ? result.data : []

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Green Energy Equipment</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/green-energy/portfolio">
            Back to Portfolio
          </Link>
        </Button>
      </div>

      <EquipmentPortfolio transactions={equipmentTransactions} />
    </div>
  )
} 