"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UpdateOrderStatusModal } from "@/components/admin/green-energy/update-order-status-modal"
import { UpdateDeliveryAddressModal } from "@/components/admin/green-energy/update-delivery-address-modal"
import { TransactionStatus } from "@prisma/client"
import { toast } from "sonner"

export function StatusUpdateButton({ 
  transactionId, 
  currentStatus 
}: { 
  transactionId: string, 
  currentStatus: TransactionStatus 
}) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      <Button className="w-full" onClick={() => setIsOpen(true)}>
        Update Status
      </Button>
      <UpdateOrderStatusModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
          toast.success("Status updated successfully")
        }}
        transactionId={transactionId}
        currentStatus={currentStatus}
      />
    </>
  )
}

export function AddressUpdateButton({ 
  transactionId, 
  currentAddress 
}: { 
  transactionId: string, 
  currentAddress: any 
}) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      <Button className="w-full mt-4" variant="outline" onClick={() => setIsOpen(true)}>
        {currentAddress ? "Update Delivery Address" : "Add Delivery Address"}
      </Button>
      <UpdateDeliveryAddressModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
          toast.success(currentAddress ? "Delivery address updated successfully" : "Delivery address added successfully")
        }}
        transactionId={transactionId}
        currentAddress={currentAddress || {}}
      />
    </>
  )
} 