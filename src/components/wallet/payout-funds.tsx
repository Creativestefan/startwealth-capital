"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { AlertCircle, Loader2 } from "lucide-react"
import { Wallet } from "@/types/wallet"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { payoutFunds } from "@/lib/wallet/actions"

const payoutFormSchema = z.object({
  amount: z.coerce.number()
    .positive("Amount must be positive")
    .min(100, "Minimum payout is $100"),
  cryptoType: z.enum(["BTC", "USDT"], {
    required_error: "Please select a cryptocurrency type",
  }),
  address: z.string().min(20, "Wallet address must be at least 20 characters"),
  reason: z.string().optional(),
})

type PayoutFormValues = z.infer<typeof payoutFormSchema>

interface PayoutFundsProps {
  wallet: Wallet
}

export function PayoutFunds({ wallet }: PayoutFundsProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  
  const form = useForm<PayoutFormValues>({
    resolver: zodResolver(payoutFormSchema),
    defaultValues: {
      amount: undefined,
      cryptoType: "BTC",
      address: "",
      reason: "",
    },
  })
  
  const watchAmount = form.watch("amount")
  const insufficientFunds = typeof watchAmount === "number" && watchAmount > wallet.balance
  
  async function onSubmit(data: PayoutFormValues) {
    if (insufficientFunds) {
      form.setError("amount", { 
        type: "manual", 
        message: "Insufficient funds in your wallet" 
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Call the server action to create the payout request
      const result = await payoutFunds(data)
      
      if (result.success) {
        toast.success("Payout request submitted successfully", {
          description: "Your request will be processed by the admin.",
        })
        
        form.reset({
          amount: undefined,
          cryptoType: "BTC",
          address: "",
          reason: "",
        })
      } else {
        toast.error("Failed to submit payout request", {
          description: result.error || "Please try again later.",
        })
      }
    } catch (error) {
      console.error("Error submitting payout:", error)
      toast.error("Failed to submit payout request", {
        description: "Please try again later.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Payout Funds</CardTitle>
          <CardDescription>
            Request a payout from your wallet to your external cryptocurrency wallet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="rounded-lg border p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Available Balance:</span>
                  <span className="font-bold">{formatCurrency(wallet.balance)}</span>
                </div>
              </div>
              
              {insufficientFunds && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Insufficient funds</AlertTitle>
                  <AlertDescription>
                    Your payout amount exceeds your available balance.
                  </AlertDescription>
                </Alert>
              )}
              
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (USD)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter amount"
                        type="number"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.valueAsNumber)
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum payout amount is $100
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cryptoType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Cryptocurrency</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="BTC" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Bitcoin (BTC)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="USDT" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Tether (USDT - TRC20)
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>External Wallet Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your external wallet address"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the address of your personal wallet where you want to receive funds
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter reason for payout"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Providing a reason may help expedite your payout request
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isSubmitting || insufficientFunds}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  "Request Payout"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Payout Information</CardTitle>
          <CardDescription>
            Important details about the payout process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border p-4 space-y-2">
            <h3 className="font-medium">Processing Times:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><span className="font-medium">Bitcoin (BTC):</span> 1-3 business days</li>
              <li><span className="font-medium">USDT (TRC20):</span> 1-2 business days</li>
            </ul>
          </div>
          
          <div className="rounded-lg border p-4 space-y-2">
            <h3 className="font-medium">Fees:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><span className="font-medium">Platform fee:</span> 1% of payout amount</li>
              <li><span className="font-medium">Network fee:</span> Variable based on blockchain congestion</li>
              <li>Fees are deducted from the payout amount</li>
            </ul>
          </div>
          
          <div className="rounded-lg border p-4 space-y-2">
            <h3 className="font-medium">Important Notes:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Double-check your wallet address before submitting</li>
              <li>Payouts require admin approval</li>
              <li>Minimum payout amount: $100</li>
              <li>Maximum payout amount: $10,000 per day</li>
              <li>All payouts are subject to KYC verification</li>
              <li>Payouts are for withdrawing funds to external wallets</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            For assistance with payouts, please contact our support team.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
} 