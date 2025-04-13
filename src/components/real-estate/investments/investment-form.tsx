"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Calculator } from "lucide-react"
import { formatCurrency } from "@/lib/real-estate/utils/formatting"
import { makeInvestment } from "@/lib/real-estate/actions/investments"
import { INVESTMENT_PLANS } from "@/lib/real-estate/constants"

interface InvestmentFormProps {
  plans: any[]
}

const formSchema = z.object({
  investmentId: z.string().min(1, "Please select an investment plan"),
  type: z.enum(["SEMI_ANNUAL", "ANNUAL"]),
  amount: z
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount must be a number",
    })
    .positive("Amount must be positive")
    .refine(
      (val) => val >= INVESTMENT_PLANS.SEMI_ANNUAL.minAmount,
      `Minimum investment amount is ${formatCurrency(INVESTMENT_PLANS.SEMI_ANNUAL.minAmount)}`
    )
    .refine(
      (val) => val <= INVESTMENT_PLANS.ANNUAL.maxAmount,
      `Maximum investment amount is ${formatCurrency(INVESTMENT_PLANS.ANNUAL.maxAmount)}`
    ),
})

export function InvestmentForm({ plans }: InvestmentFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expectedReturn, setExpectedReturn] = useState<number | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      investmentId: "",
      type: "SEMI_ANNUAL",
      amount: INVESTMENT_PLANS.SEMI_ANNUAL.minAmount,
    },
  })

  const watchType = form.watch("type")
  const watchAmount = form.watch("amount")

  // Calculate expected return when type or amount changes
  const calculateReturn = () => {
    const type = form.getValues("type")
    const amount = form.getValues("amount")
    
    if (!amount || isNaN(amount)) return null
    
    const rate = type === "SEMI_ANNUAL" ? 0.15 : 0.3
    return amount * rate
  }

  // Update expected return when form values change
  const updateExpectedReturn = () => {
    setExpectedReturn(calculateReturn())
  }

  // Handle plan selection
  const handlePlanChange = (planId: string) => {
    const selectedPlan = plans.find(plan => plan.id === planId)
    if (selectedPlan) {
      form.setValue("type", selectedPlan.type)
      form.setValue("investmentId", planId)
      
      // Set a default amount within the plan's range
      const defaultAmount = Math.max(
        selectedPlan.minAmount,
        Math.min(form.getValues("amount"), selectedPlan.maxAmount)
      )
      form.setValue("amount", defaultAmount)
      
      updateExpectedReturn()
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      
      const response = await makeInvestment(
        values.investmentId,
        values.type,
        values.amount
      )
      
      if (!response.success) {
        if (response.requiresKyc) {
          toast.error("KYC verification is required to make investments")
          router.push("/profile/kyc")
          return
        }
        
        toast.error(response.error || "Failed to make investment")
        return
      }
      
      toast.success("Investment made successfully! You can track it in your portfolio.")
      router.refresh()
      router.push("/real-estate/portfolio")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Invest in Real Estate Shares</CardTitle>
        <CardDescription>
          Choose an investment plan and enter the amount you want to invest
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="investmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Investment Plan</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      handlePlanChange(value)
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an investment plan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - {(plan.returnRate * 100).toFixed(0)}% return
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the investment plan that matches your goals
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      min={
                        watchType === "SEMI_ANNUAL"
                          ? INVESTMENT_PLANS.SEMI_ANNUAL.minAmount
                          : INVESTMENT_PLANS.ANNUAL.minAmount
                      }
                      max={
                        watchType === "SEMI_ANNUAL"
                          ? INVESTMENT_PLANS.SEMI_ANNUAL.maxAmount
                          : INVESTMENT_PLANS.ANNUAL.maxAmount
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    {watchType === "SEMI_ANNUAL"
                      ? `Amount between ${formatCurrency(INVESTMENT_PLANS.SEMI_ANNUAL.minAmount)} and ${formatCurrency(
                          INVESTMENT_PLANS.SEMI_ANNUAL.maxAmount
                        )}`
                      : `Amount between ${formatCurrency(INVESTMENT_PLANS.ANNUAL.minAmount)} and ${formatCurrency(
                          INVESTMENT_PLANS.ANNUAL.maxAmount
                        )}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {expectedReturn !== null && (
              <div className="rounded-md bg-muted p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-4 w-4" />
                  <h4 className="font-medium">Investment Summary</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Investment Type:</span>
                    <span className="font-medium">
                      {watchType === "SEMI_ANNUAL" ? "Semi-Annual Plan" : "Annual Plan"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>
                      {watchType === "SEMI_ANNUAL"
                        ? `${INVESTMENT_PLANS.SEMI_ANNUAL.durationMonths} months`
                        : `${INVESTMENT_PLANS.ANNUAL.durationMonths} months`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Investment Amount:</span>
                    <span>{formatCurrency(watchAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expected Return:</span>
                    <span className="font-medium text-green-600">{formatCurrency(expectedReturn)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Value at Maturity:</span>
                    <span className="font-medium">
                      {formatCurrency((watchAmount || 0) + expectedReturn)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting || !form.formState.isValid}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Invest Now"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
} 