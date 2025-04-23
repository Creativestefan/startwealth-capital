"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { Property } from "@/lib/real-estate/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { toast } from "sonner"
import { PaymentOptions } from "./payment-options"
import { InstallmentForm } from "./installment-form"
import { PriceTag } from "@/components/real-estate/shared/price-tag"
import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/real-estate/utils/formatting"

interface PurchaseFormProps {
  property: Property
  open: boolean
  onOpenChange: (open: boolean) => void
}

const formSchema = z.object({
  type: z.enum(["FULL", "INSTALLMENT"]),
  amount: z.number().positive("Amount must be positive"),
  installments: z.number().min(2).max(12).optional(),
})

export function PurchaseForm({ property, open, onOpenChange }: PurchaseFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  const [purchaseDetails, setPurchaseDetails] = useState<any>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "FULL",
      amount: Number.parseFloat(property.price.toString()),
      installments: 3,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      const response = await fetch(`/api/real-estate/properties/${property.id}/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error === "Insufficient wallet balance") {
          toast.error(
            `Insufficient wallet balance. You need ${new Intl.NumberFormat('en-US', { 
              style: 'currency', 
              currency: 'USD' 
            }).format(data.required)} but have ${new Intl.NumberFormat('en-US', { 
              style: 'currency', 
              currency: 'USD' 
            }).format(data.available)}.`
          )
        } else {
          toast.error(data.error || "Failed to purchase property")
        }
        return
      }

      // Store purchase details for the receipt
      setPurchaseDetails({
        property: property,
        transaction: data,
        date: new Date().toISOString(),
        type: values.type,
        amount: values.amount,
        installments: values.installments,
        installmentAmount: values.installments ? values.amount / values.installments : 0,
      })
      
      // Show success modal instead of redirecting immediately
      setPurchaseSuccess(true)
      onOpenChange(false)
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Function to handle receipt download
  const handleDownloadReceipt = () => {
    if (!purchaseDetails) return
    
    // Create receipt content
    const receiptContent = `
      PURCHASE RECEIPT
      ----------------
      
      Property: ${purchaseDetails.property.name}
      Location: ${purchaseDetails.property.location}
      Date: ${formatDate(purchaseDetails.date)}
      
      Transaction Type: ${purchaseDetails.type === "FULL" ? "Full Payment" : "Installment Plan"}
      Transaction ID: ${purchaseDetails.transaction.id || "N/A"}
      
      Amount: ${formatCurrency(purchaseDetails.amount)}
      ${purchaseDetails.type === "INSTALLMENT" ? 
        `Installments: ${purchaseDetails.installments}
      Monthly Payment: ${formatCurrency(purchaseDetails.installmentAmount)}` : ''}
      
      Thank you for your purchase!
      StartWealth Capital
    `
    
    // Create a blob and download it
    const blob = new Blob([receiptContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  // Handle closing the success modal
  const handleSuccessModalClose = () => {
    setPurchaseSuccess(false)
    router.push("/real-estate/portfolio")
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Purchase Property</DialogTitle>
            <DialogDescription>
              <span>{property.name} - <PriceTag amount={property.price} /></span>
              <span className="block mt-2">The amount will be deducted directly from your wallet balance.</span>
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <PaymentOptions value={form.watch("type")} onChange={(value) => form.setValue("type", value)} />

              {form.watch("type") === "INSTALLMENT" && (
                <InstallmentForm
                  amount={form.watch("amount")}
                  installments={form.watch("installments") || 3}
                  onInstallmentsChange={(value) => form.setValue("installments", value)}
                />
              )}

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Complete Purchase"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Purchase Success Modal */}
      <Dialog open={purchaseSuccess} onOpenChange={handleSuccessModalClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Purchase Successful!</DialogTitle>
            <DialogDescription className="text-center">
              Your offer has been submitted successfully!
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="rounded-md bg-muted p-4">
              <h4 className="font-medium mb-2">Purchase Summary</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property:</span>
                  <span className="font-medium">{property.name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span>{property.location}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{purchaseDetails && formatDate(purchaseDetails.date)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Type:</span>
                  <span>
                    {purchaseDetails?.type === "FULL" ? "Full Payment" : "Installment Plan"}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <PriceTag amount={property.price} />
                </div>
                
                {purchaseDetails?.type === "INSTALLMENT" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Installments:</span>
                      <span>{purchaseDetails.installments}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Payment:</span>
                      <PriceTag amount={purchaseDetails.installmentAmount} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={handleDownloadReceipt}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Receipt
            </Button>
            
            <Button 
              className="w-full sm:w-auto"
              onClick={handleSuccessModalClose}
            >
              View My Portfolio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

