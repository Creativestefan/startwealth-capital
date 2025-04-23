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
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency } from "@/lib/green-energy/utils/formatting"
import { Separator } from "@/components/ui/separator"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface PurchaseEquipmentModalProps {
  isOpen: boolean
  onClose: () => void
  equipmentId: string
  equipmentName: string
  equipmentPrice: number
  walletBalance: number
  onPurchase: (deliveryAddress: string) => Promise<void>
}

export function PurchaseEquipmentModal({
  isOpen,
  onClose,
  equipmentId,
  equipmentName,
  equipmentPrice,
  walletBalance,
  onPurchase
}: PurchaseEquipmentModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [street, setStreet] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [country, setCountry] = useState("")

  const insufficientFunds = walletBalance < equipmentPrice

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (insufficientFunds) {
      setError("Insufficient funds in your wallet. Please deposit more funds before proceeding.")
      return
    }
    
    if (!street || !city || !state || !zipCode || !country) {
      setError("Please fill in all address fields")
      return
    }
    
    setError(null)
    setIsLoading(true)
    
    try {
      // Format address in the expected format for parsing
      const fullAddress = `${street}, ${city}, ${state} ${zipCode}, ${country}`
      await onPurchase(fullAddress)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process purchase. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Purchase Equipment</DialogTitle>
          <DialogDescription>
            Enter your delivery address to complete your purchase of {equipmentName}.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4 py-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Equipment:</span>
              <span className="text-sm">{equipmentName}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Price:</span>
              <span className="text-sm font-semibold">{formatCurrency(equipmentPrice)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Wallet Balance:</span>
              <span className={`text-sm font-semibold ${insufficientFunds ? 'text-red-500' : 'text-green-500'}`}>
                {formatCurrency(walletBalance)}
              </span>
            </div>
            
            <Separator />
            
            <div className="grid gap-2">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="123 Main St"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="New York"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="NY"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="zipCode">Zip/Postal Code</Label>
                <Input
                  id="zipCode"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="10001"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="United States"
                  required
                />
              </div>
            </div>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {insufficientFunds && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Insufficient Funds</AlertTitle>
              <AlertDescription>
                You don't have enough funds in your wallet to complete this purchase.
                Please deposit more funds before proceeding.
              </AlertDescription>
            </Alert>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || insufficientFunds}>
              {isLoading ? "Processing..." : "Confirm Purchase"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 