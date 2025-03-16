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
import { updateEquipmentTransactionDeliveryAddress } from "@/lib/green-energy/actions/equipment"
import { useRouter } from "next/navigation"

interface UpdateDeliveryAddressModalProps {
  isOpen: boolean
  onClose: () => void
  transactionId: string
  currentAddress: {
    street?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
}

export function UpdateDeliveryAddressModal({
  isOpen,
  onClose,
  transactionId,
  currentAddress
}: UpdateDeliveryAddressModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [street, setStreet] = useState(currentAddress.street || "")
  const [city, setCity] = useState(currentAddress.city || "")
  const [state, setState] = useState(currentAddress.state || "")
  const [postalCode, setPostalCode] = useState(currentAddress.postalCode || "")
  const [country, setCountry] = useState(currentAddress.country || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!street || !city || !state || !postalCode || !country) {
      setError("Please fill in all address fields")
      return
    }
    
    setError(null)
    setIsLoading(true)
    
    try {
      const newAddress = {
        street,
        city,
        state,
        postalCode,
        country
      }
      
      const result = await updateEquipmentTransactionDeliveryAddress(transactionId, newAddress)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      router.refresh()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update delivery address. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Delivery Address</DialogTitle>
          <DialogDescription>
            Update the delivery address for this order.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4 py-2">
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
                <Label htmlFor="postalCode">Zip/Postal Code</Label>
                <Input
                  id="postalCode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
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
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Address"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 