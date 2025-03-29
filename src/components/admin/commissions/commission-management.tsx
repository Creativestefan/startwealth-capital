"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  approveCommission, 
  rejectCommission, 
  bulkApproveCommissions,
  getAllCommissions,
  getPendingCommissions 
} from "@/lib/referrals/admin-actions"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Check, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { formatCurrency } from "@/lib/utils"

// Don't use UI components if they're not yet available
// Use a simple checkbox instead
const Checkbox = ({ checked, onCheckedChange }: { checked?: boolean, onCheckedChange?: (checked: boolean) => void }) => (
  <input 
    type="checkbox" 
    checked={checked} 
    onChange={e => onCheckedChange?.(e.target.checked)} 
    className="h-4 w-4"
  />
)

// Simple toast implementation
const useToast = () => {
  return {
    toast: ({ title, description, variant }: { title: string, description: string, variant?: string }) => {
      console.log(`${title}: ${description}`)
      // In a real app, you'd use a proper toast implementation
      if (typeof window !== 'undefined') {
        alert(`${title}: ${description}`)
      }
    }
  }
}

type Commission = {
  id: string
  referralId: string
  userId: string
  amount: number
  status: string
  transactionType: string
  createdAt: Date | string
  updatedAt: Date | string
  paidAt: Date | string | null
  propertyTransactionId: string | null
  equipmentTransactionId: string | null
  marketInvestmentId: string | null
  realEstateInvestmentId: string | null
  greenEnergyInvestmentId: string | null
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  referral: {
    id: string
    referred: {
      id: string
      firstName: string
      lastName: string
      email: string
    }
  }
}

export function CommissionManagement() {
  const router = useRouter()
  const { toast } = useToast()
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [pendingCommissions, setPendingCommissions] = useState<Commission[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([])
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [commissionToReject, setCommissionToReject] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("pending")

  const loadCommissions = async () => {
    setLoading(true)
    try {
      const allCommissions = await getAllCommissions()
      const pending = await getPendingCommissions()
      setCommissions(allCommissions as Commission[])
      setPendingCommissions(pending as Commission[])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load commissions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Load commissions on initial render
   
useEffect(() => {
    loadCommissions()
  }, [])

  const handleSelectCommission = (commissionId: string) => {
    setSelectedCommissions(prev => {
      if (prev.includes(commissionId)) {
        return prev.filter(id => id !== commissionId)
      } else {
        return [...prev, commissionId]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectedCommissions.length === pendingCommissions.length) {
      setSelectedCommissions([])
    } else {
      setSelectedCommissions(pendingCommissions.map(c => c.id))
    }
  }

  const handleApproveCommission = async (commissionId: string) => {
    setIsApproving(true)
    try {
      const result = await approveCommission(commissionId)
      if (result.success) {
        toast({
          title: "Success",
          description: "Commission approved and funds transferred to user wallet",
        })
        await loadCommissions()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to approve commission",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while approving the commission",
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
    }
  }

  const handleBulkApprove = async () => {
    if (selectedCommissions.length === 0) return
    
    setIsApproving(true)
    try {
      const result = await bulkApproveCommissions(selectedCommissions)
      if (result.success) {
        toast({
          title: "Success",
          description: `${selectedCommissions.length} commissions approved successfully`,
        })
        setSelectedCommissions([])
        await loadCommissions()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to approve commissions",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while approving the commissions",
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
    }
  }

  const openRejectDialog = (commissionId: string) => {
    setCommissionToReject(commissionId)
    setIsRejecting(true)
  }

  const handleRejectCommission = async () => {
    if (!commissionToReject || !rejectReason) return
    
    try {
      const result = await rejectCommission(commissionToReject, rejectReason)
      if (result.success) {
        toast({
          title: "Success",
          description: "Commission rejected successfully",
        })
        await loadCommissions()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to reject commission",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while rejecting the commission",
        variant: "destructive",
      })
    } finally {
      setIsRejecting(false)
      setCommissionToReject(null)
      setRejectReason("")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "APPROVED":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Approved</Badge>
      case "PAID":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Paid</Badge>
      case "REJECTED":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTransactionTypeDisplay = (type: string) => {
    return type.replace(/_/g, " ").split(" ").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(" ")
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-"
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={loadCommissions}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        
        {selectedCommissions.length > 0 && (
          <Button
            onClick={handleBulkApprove}
            disabled={isApproving || selectedCommissions.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="mr-2 h-4 w-4" />
            Approve Selected ({selectedCommissions.length})
          </Button>
        )}
      </div>

      <Tabs defaultValue="pending" onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pending">Pending ({pendingCommissions.length})</TabsTrigger>
          <TabsTrigger value="all">All Commissions ({commissions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Commissions</CardTitle>
              <CardDescription>
                Review and approve commission payouts for referrers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingCommissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending commissions found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox 
                          checked={selectedCommissions.length === pendingCommissions.length && pendingCommissions.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Referrer</TableHead>
                      <TableHead>Referred User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Transaction Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingCommissions.map((commission) => (
                      <TableRow key={commission.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedCommissions.includes(commission.id)}
                            onCheckedChange={() => handleSelectCommission(commission.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {commission.user.firstName} {commission.user.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {commission.user.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {commission.referral.referred.firstName} {commission.referral.referred.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {commission.referral.referred.email}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(commission.amount)}
                        </TableCell>
                        <TableCell>
                          {getTransactionTypeDisplay(commission.transactionType)}
                        </TableCell>
                        <TableCell>
                          {formatDate(commission.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveCommission(commission.id)}
                              disabled={isApproving}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openRejectDialog(commission.id)}
                              disabled={isRejecting}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Commissions</CardTitle>
              <CardDescription>
                Complete history of referral commissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {commissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No commissions found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Referrer</TableHead>
                      <TableHead>Referred User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Transaction Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Paid Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissions.map((commission) => (
                      <TableRow key={commission.id}>
                        <TableCell>
                          <div className="font-medium">
                            {commission.user.firstName} {commission.user.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {commission.user.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {commission.referral.referred.firstName} {commission.referral.referred.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {commission.referral.referred.email}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(commission.amount)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(commission.status)}
                        </TableCell>
                        <TableCell>
                          {getTransactionTypeDisplay(commission.transactionType)}
                        </TableCell>
                        <TableCell>
                          {formatDate(commission.createdAt)}
                        </TableCell>
                        <TableCell>
                          {formatDate(commission.paidAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isRejecting} onOpenChange={(open) => {
        if (!open) {
          setIsRejecting(false);
          setCommissionToReject(null);
          setRejectReason("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Commission</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this commission.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Reason</Label>
            <Input
              id="reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejecting(false);
                setCommissionToReject(null);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectCommission}
              disabled={!rejectReason.trim()}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 