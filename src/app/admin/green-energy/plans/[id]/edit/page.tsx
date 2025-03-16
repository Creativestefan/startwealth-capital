import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getGreenEnergyPlanById } from "@/lib/green-energy/actions/investments"
import { PlanForm } from "@/components/admin/green-energy/plan-form"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Edit Investment Plan",
  description: "Edit green energy investment plan details",
}

interface EditPlanPageProps {
  params: {
    id: string
  }
}

export default async function EditPlanPage({ params }: EditPlanPageProps) {
  // Await the params object before accessing its properties
  const { id } = await params;
  
  const result = await getGreenEnergyPlanById(id)
  
  if (!result.success || !result.data) {
    notFound()
  }
  
  const plan = result.data
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/green-energy/plans">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Plans
          </Link>
        </Button>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Edit Investment Plan</h2>
        <p className="text-muted-foreground">
          Update the details of {plan.name}.
        </p>
      </div>
      
      <div className="rounded-md border p-6">
        <PlanForm plan={plan} isEditing />
      </div>
    </div>
  )
} 