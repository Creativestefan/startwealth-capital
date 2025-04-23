'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils/formatting"
import { AlertTriangle, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deleteInvestmentPlan } from "@/lib/real-estate/actions/investments"

interface PlanCardProps {
  plan: {
    id: string
    name: string
    description: string
    minAmount: number
    maxAmount: number
    returnRate: number
    durationMonths: number
    type: string
  }
  onUpdate: () => void
}

export function PlanCard({ plan, onUpdate }: PlanCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  async function handleDelete() {
    try {
      setIsDeleting(true)
      await deleteInvestmentPlan(plan.id)
      toast.success("Investment plan deleted successfully")
      onUpdate()
      setShowDeleteDialog(false)
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{plan.name}</span>
            <div className="flex items-center gap-2">
              <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Edit Investment Plan</DialogTitle>
                  {/* Add your edit form component here */}
                </DialogContent>
              </Dialog>
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Delete Investment Plan</DialogTitle>
                  <div className="flex flex-col items-center justify-center gap-4 py-8">
                    <div className="rounded-full bg-destructive/10 p-3">
                      <AlertTriangle className="h-6 w-6 text-destructive" />
                    </div>
                    <div className="text-center">
                      <DialogDescription>
                        Are you sure you want to delete this investment plan?
                      </DialogDescription>
                      <p className="text-sm text-muted-foreground mt-1">
                        This action cannot be undone. This will permanently delete the plan
                        and remove it from our servers.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteDialog(false)}
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete Plan"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">{plan.description}</p>
          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Investment Range</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(plan.minAmount)} - {formatCurrency(plan.maxAmount)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Return Rate</p>
              <p className="text-sm text-muted-foreground">{plan.returnRate}%</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Plan Type</p>
            <p className="text-sm text-muted-foreground capitalize">
              {plan.type.toLowerCase().replace('_', ' ')}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Duration: {plan.durationMonths} months
          </p>
        </CardFooter>
      </Card>
    </>
  )
} 