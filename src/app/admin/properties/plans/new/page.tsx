export const dynamic = 'force-dynamic';
import { InvestmentPlanForm } from "@/components/admin/properties/investment-plan-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon, PlusCircleIcon, TrendingUpIcon } from "lucide-react"

export default function NewInvestmentPlanPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header with breadcrumb */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/admin/properties" className="hover:underline">Properties</Link>
          <span>/</span>
          <Link href="/admin/properties/plans" className="hover:underline">Investment Plans</Link>
          <span>/</span>
          <span>New Plan</span>
        </div>
        
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <TrendingUpIcon className="mr-2 h-6 w-6 text-primary" />
              Create New Investment Plan
            </h1>
            <p className="text-muted-foreground mt-1">
              Add a new real estate investment plan to the platform for users to invest in.
            </p>
          </div>
          
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/properties/plans">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Plans
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Investment Plan Form */}
      <div className="bg-card rounded-lg border shadow-sm p-6">
        <InvestmentPlanForm mode="create" />
      </div>
    </div>
  )
} 