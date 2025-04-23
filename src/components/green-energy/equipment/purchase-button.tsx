"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PurchaseEquipmentModal } from "@/components/green-energy/purchase-equipment-modal"
import { purchaseEquipment } from "@/lib/green-energy/actions/purchase"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface PurchaseEquipmentButtonProps {
  equipmentId: string
  equipmentName: string
  equipmentPrice: number
  isAvailable?: boolean
}

export function PurchaseEquipmentButton({
  equipmentId,
  equipmentName,
  equipmentPrice,
  isAvailable = true
}: PurchaseEquipmentButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()
  
  // For demo purposes, we'll use a fixed wallet balance
  // In a real app, you would fetch this from the server
  const walletBalance = 10000 // $10,000
  
  const handlePurchase = async (deliveryAddress: string) => {
    try {
      const result = await purchaseEquipment(equipmentId, deliveryAddress)
      
      if (result.success) {
        toast.success("Equipment purchased successfully!")
        setIsModalOpen(false)
        router.push("/green-energy/portfolio/equipment")
      } else {
        toast.error(result.error || "Failed to purchase equipment")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error(error)
    }
  }
  
  return (
    <>
      <Button 
        onClick={() => setIsModalOpen(true)}
        disabled={!isAvailable}
      >
        {isAvailable ? "Purchase Equipment" : "Out of Stock"}
      </Button>
      
      <PurchaseEquipmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        equipmentId={equipmentId}
        equipmentName={equipmentName}
        equipmentPrice={equipmentPrice}
        walletBalance={walletBalance}
        onPurchase={handlePurchase}
      />
    </>
  )
} 