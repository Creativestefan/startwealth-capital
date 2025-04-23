"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Calculator, Download, Loader2 } from "lucide-react"
import { formatCurrency, formatDate, formatReturnRate } from "@/lib/green-energy/utils/formatting"
import { investInGreenEnergy } from "@/lib/green-energy/actions/investments"
import type { GreenEnergyInvestmentType } from "@prisma/client"
import type { SerializedGreenEnergyPlan } from "@/lib/green-energy/types"

interface InvestmentModalProps {
  plan: SerializedGreenEnergyPlan & {
    type: "SEMI_ANNUAL" | "ANNUAL";
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

const formSchema = z.object({
  amount: z
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount must be a number",
    })
    .positive("Amount must be positive")
})

export function InvestmentModal({ plan, open, onOpenChange }: InvestmentModalProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [investmentSuccess, setInvestmentSuccess] = useState(false)
  const [investmentDetails, setInvestmentDetails] = useState<any>(null)
  const [expectedReturn, setExpectedReturn] = useState<number | null>(null)

  // Set min and max amount based on plan type
  const minAmount = plan.minAmount
  const maxAmount = plan.maxAmount

  // Update form schema with dynamic validation
  const dynamicFormSchema = z.object({
    amount: z
      .number({
        required_error: "Amount is required",
        invalid_type_error: "Amount must be a number",
      })
      .positive("Amount must be positive")
      .min(minAmount, `Minimum investment amount is ${formatCurrency(minAmount)}`)
      .max(maxAmount, `Maximum investment amount is ${formatCurrency(maxAmount)}`)
  })

  const form = useForm<z.infer<typeof dynamicFormSchema>>({
    resolver: zodResolver(dynamicFormSchema),
    defaultValues: {
      amount: minAmount,
    },
  })

  // Calculate expected return when amount changes
  const calculateReturn = (amount: number) => {
    return amount * (plan.returnRate / 100)
  }

  // Update expected return when form values change
  const updateExpectedReturn = () => {
    const amount = form.getValues("amount")
    if (!amount || isNaN(amount)) {
      setExpectedReturn(null)
      return
    }
    setExpectedReturn(calculateReturn(amount))
  }

  async function onSubmit(values: z.infer<typeof dynamicFormSchema>) {
    try {
      setIsSubmitting(true)
      
      // Call investInGreenEnergy with the correct parameters
      const response = await investInGreenEnergy(
        plan.id,
        values.amount
      )
      
      if (!response || !response.success) {
        // Handle KYC verification requirement
        if (response && 'requiresKyc' in response && response.requiresKyc) {
          toast.error("KYC verification is required to make investments")
          onOpenChange(false)
          router.push("/profile/kyc")
          return
        }
        
        // Handle general error
        toast.error(response?.error || "Failed to make investment")
        return
      }
      
      // Store investment details for the receipt
      const currentDate = new Date();
      const maturityDate = new Date(currentDate);
      maturityDate.setMonth(maturityDate.getMonth() + plan.durationMonths);
      
      setInvestmentDetails({
        plan: plan,
        investment: 'data' in response ? response.data : null,
        date: currentDate.toISOString(),
        amount: values.amount,
        expectedReturn: calculateReturn(values.amount),
        duration: plan.durationMonths,
        maturityDate: maturityDate.toISOString(),
      })
      
      // Show success message and redirect
      toast.success("Investment successful!")
      onOpenChange(false)
      
      // Redirect to portfolio page
      setTimeout(() => {
        router.push("/green-energy/portfolio")
      }, 1500)
      
    } catch (error) {
      // Safely log and display error
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      console.log("Investment error:", errorMessage);
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invest in {plan.name}</DialogTitle>
          <DialogDescription>
            <span>{plan.description}</span>
            <span className="block mt-2">The amount will be deducted directly from your wallet balance.</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Investment Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => {
                        field.onChange(parseFloat(e.target.value))
                        updateExpectedReturn()
                      }}
                      min={minAmount}
                      max={maxAmount}
                    />
                  </FormControl>
                  <FormDescription>
                    Amount between {formatCurrency(minAmount)} and {formatCurrency(maxAmount)}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-md bg-muted p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-4 w-4" />
                <h4 className="font-medium">Investment Summary</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Investment Type:</span>
                  <span className="font-medium">{plan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{plan.durationMonths} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Return Rate:</span>
                  <span>{formatReturnRate(plan.returnRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Investment Amount:</span>
                  <span>{formatCurrency(form.getValues("amount") || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected Return:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(expectedReturn || calculateReturn(form.getValues("amount") || 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Value at Maturity:</span>
                  <span className="font-medium">
                    {formatCurrency((form.getValues("amount") || 0) + (expectedReturn || calculateReturn(form.getValues("amount") || 0)))}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Investment"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 