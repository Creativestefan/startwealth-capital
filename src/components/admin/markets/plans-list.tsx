'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { CreatePlanForm } from "./create-plan-form"
import { PlanCard } from "./plan-card"

interface PlansListProps {
  initialPlans: {
    id: string
    name: string
    description: string
    minAmount: number
    maxAmount: number
    returnRate: number
    durationMonths: number
  }[]
}

export function PlansList({ initialPlans }: PlansListProps) {
  const [plans, setPlans] = useState(initialPlans)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const handleUpdate = async () => {
    // Fetch updated plans
    const response = await fetch("/api/admin/markets/plans")
    const updatedPlans = await response.json()
    setPlans(updatedPlans)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Create Market Plan</DialogTitle>
            <CreatePlanForm
              onSuccess={() => {
                setShowCreateDialog(false)
                handleUpdate()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} onUpdate={handleUpdate} />
        ))}
      </div>

      {plans.length === 0 && (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed">
          <h3 className="text-lg font-medium">No plans found</h3>
          <p className="text-sm text-muted-foreground">
            Create a new plan to get started.
          </p>
        </div>
      )}
    </div>
  )
} 