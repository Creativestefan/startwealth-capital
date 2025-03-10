import { notFound } from "next/navigation"
import Link from "next/link"
import { getInvestmentPlanById } from "@/lib/real-estate/actions/investments"
import { InvestmentPlanForm } from "@/components/admin/properties/investment-plan-form"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon, TrendingUpIcon } from "lucide-react"

interface EditInvestmentPlanPageProps {
  params: {
    id: string
  }
}

export default async function EditInvestmentPlanPage({ params }: EditInvestmentPlanPageProps) {
  // In Next.js 15, we need to await the params object
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  const { data: planData, success } = await getInvestmentPlanById(id)

  if (!success || !planData) {
    notFound()
  }

  // Convert the plan data to the format expected by the form
  const plan = {
    id: planData.id,
    name: planData.name,
    description: planData.description,
    type: planData.type,
    minAmount: planData.minAmount,
    maxAmount: planData.maxAmount,
    returnRate: planData.returnRate,
    durationMonths: planData.durationMonths || 0,
    image: planData.image || "",
    createdAt: new Date(planData.createdAt),
    updatedAt: new Date(planData.updatedAt)
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header with breadcrumb */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/admin/properties" className="hover:underline">Properties</Link>
          <span>/</span>
          <Link href="/admin/properties/plans" className="hover:underline">Investment Plans</Link>
          <span>/</span>
          <Link href={`/admin/properties/plans/${id}`} className="hover:underline">Plan Details</Link>
          <span>/</span>
          <span>Edit</span>
        </div>
        
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <TrendingUpIcon className="mr-2 h-6 w-6 text-primary" />
              Edit Investment Plan
            </h1>
            <p className="text-muted-foreground mt-1">
              Update the details of this investment plan
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/properties/plans/${id}`}>
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Plan Details
            </Link>
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto">
        <InvestmentPlanForm plan={plan} mode="edit" />
      </div>
    </div>
  )
} 