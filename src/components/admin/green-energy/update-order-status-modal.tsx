"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { updateEquipmentTransactionStatus } from "@/lib/green-energy/actions/equipment"
import { useRouter } from "next/navigation"
import { TransactionStatus } from "@prisma/client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface UpdateOrderStatusModalProps {
  isOpen: boolean
  onClose: () => void
  transactionId: string
  currentStatus: TransactionStatus
}

export function UpdateOrderStatusModal({
  isOpen,
  onClose,
  transactionId,
  currentStatus
}: UpdateOrderStatusModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<TransactionStatus>(currentStatus)
  const [trackingNumber, setTrackingNumber] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!status) {
      setError("Please select a status")
      return
    }
    
    setError(null)
    setIsLoading(true)
    
    try {
      const result = await updateEquipmentTransactionStatus(
        transactionId, 
        status, 
        status === TransactionStatus.OUT_FOR_DELIVERY && trackingNumber ? trackingNumber : undefined
      )
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      router.refresh()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order status. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Function to format status for display
  const formatStatus = (status: TransactionStatus): string => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, char => char.toUpperCase())
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Change the status of this order.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4 py-2">
            {/* Current Status Display */}
            <div className="grid gap-2">
              <Label>Current Status:</Label>
              <div className="font-bold text-lg">{formatStatus(currentStatus)}</div>
            </div>
            
            {/* New Status Dropdown */}
            <div className="grid gap-2">
              <Label htmlFor="status">New Status:</Label>
              <Select 
                value={status} 
                onValueChange={(value) => setStatus(value as TransactionStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TransactionStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={TransactionStatus.ACCEPTED}>Accepted</SelectItem>
                  <SelectItem value={TransactionStatus.PROCESSING}>Processing</SelectItem>
                  <SelectItem value={TransactionStatus.OUT_FOR_DELIVERY}>Out for Delivery</SelectItem>
                  <SelectItem value={TransactionStatus.COMPLETED}>Completed</SelectItem>
                  <SelectItem value={TransactionStatus.CANCELLED}>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {status === TransactionStatus.OUT_FOR_DELIVERY && (
              <div className="grid gap-2">
                <Label htmlFor="trackingNumber">Tracking Number (Optional)</Label>
                <Input
                  id="trackingNumber"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                />
              </div>
            )}
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 