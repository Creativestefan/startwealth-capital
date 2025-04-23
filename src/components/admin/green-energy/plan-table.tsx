"use client"

import { useState } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Eye, 
  LineChart 
} from "lucide-react"
import { 
  formatCurrency, 
  formatDate, 
  formatInvestmentType,
  formatInvestmentDuration,
  formatReturnRate
} from "@/lib/green-energy/utils/formatting"
import { SerializedGreenEnergyPlan } from "@/lib/green-energy/types"
import { deleteGreenEnergyPlan } from "@/lib/green-energy/actions/investments"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface PlanTableProps {
  plans: SerializedGreenEnergyPlan[]
}

export function PlanTable({ plans }: PlanTableProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this investment plan? This action cannot be undone.")) {
      setIsDeleting(id)
      
      try {
        const result = await deleteGreenEnergyPlan(id)
        
        if (result.success) {
          alert("Plan deleted successfully")
          router.refresh()
        } else {
          alert(result.error || "Failed to delete investment plan")
        }
      } catch (error) {
        alert("An unexpected error occurred")
      } finally {
        setIsDeleting(null)
      }
    }
  }

  if (!plans.length) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-md border border-dashed p-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <LineChart className="h-10 w-10 text-muted-foreground" />
          <h3 className="text-xl font-semibold">No investment plans found</h3>
          <p className="text-sm text-muted-foreground">
            Add some investment plans to get started.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Return Rate</TableHead>
            <TableHead>Min Amount</TableHead>
            <TableHead>Max Amount</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell className="font-medium">{plan.name}</TableCell>
              <TableCell>{formatInvestmentType(plan.type)}</TableCell>
              <TableCell>{formatInvestmentDuration(plan.durationMonths)}</TableCell>
              <TableCell>{formatReturnRate(plan.returnRate)}</TableCell>
              <TableCell>{formatCurrency(plan.minAmount)}</TableCell>
              <TableCell>{formatCurrency(plan.maxAmount)}</TableCell>
              <TableCell>{formatDate(plan.createdAt)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/green-energy/plans/${plan.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/green-energy/plans/${plan.id}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(plan.id)}
                      disabled={isDeleting === plan.id}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isDeleting === plan.id ? "Deleting..." : "Delete"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 