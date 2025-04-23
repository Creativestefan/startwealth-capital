// This component displays a table of investment plans for admin users
// Updated to fix TypeScript import issues
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { deleteInvestmentPlan } from "@/lib/real-estate/actions/investments"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { MoreHorizontalIcon, PencilIcon, TrashIcon, EyeIcon, TrendingUpIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Define the investment plan type
interface InvestmentPlan {
  id: string
  name: string
  description: string
  type: string
  minAmount: number
  maxAmount: number
  returnRate: number
  image?: string
  createdAt: Date
}

interface InvestmentPlanTableProps {
  plans: InvestmentPlan[]
}

export function InvestmentPlanTable({ plans }: InvestmentPlanTableProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this investment plan? This action cannot be undone.")) {
      setIsDeleting(id)
      
      try {
        const response = await deleteInvestmentPlan(id)
        
        if (response.success) {
          toast.success("Investment plan deleted successfully")
          router.refresh()
        } else {
          toast.error(response.error || "Failed to delete investment plan")
        }
      } catch (error) {
        toast.error("An error occurred while deleting the investment plan")
        console.error(error)
      } finally {
        setIsDeleting(null)
      }
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plan Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Min Amount</TableHead>
            <TableHead>Max Amount</TableHead>
            <TableHead>Return Rate</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No investment plans found
              </TableCell>
            </TableRow>
          ) : (
            plans.map((plan) => (
              <TableRow key={plan.id} className="group">
                <TableCell className="font-medium">
                  <Link 
                    href={`/admin/properties/plans/${plan.id}`}
                    className="flex items-center gap-3 hover:underline group-hover:text-primary transition-colors"
                  >
                    <TrendingUpIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="font-medium">{plan.name}</span>
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {plan.type === "SEMI_ANNUAL" ? "Semi-Annual" : "Annual"}
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(plan.minAmount)}</TableCell>
                <TableCell>{formatCurrency(plan.maxAmount)}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400">
                    {(plan.returnRate * 100).toFixed(1)}%
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      asChild
                      className="hidden md:flex"
                    >
                      <Link href={`/admin/properties/plans/${plan.id}`}>
                        <EyeIcon className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      asChild
                      className="hidden md:flex"
                    >
                      <Link href={`/admin/properties/plans/${plan.id}/edit`}>
                        <PencilIcon className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontalIcon className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/properties/plans/${plan.id}`}>
                            <EyeIcon className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/properties/plans/${plan.id}/edit`}>
                            <PencilIcon className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(plan.id)}
                          disabled={isDeleting === plan.id}
                          className="text-destructive focus:text-destructive"
                        >
                          <TrashIcon className="mr-2 h-4 w-4" />
                          {isDeleting === plan.id ? "Deleting..." : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
} 