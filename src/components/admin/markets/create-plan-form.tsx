'use client'

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createMarketPlan, updateMarketPlan } from "@/lib/market/actions/plans"
import { MarketPlanType } from "@/lib/market/utils/constants"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  minAmount: z.string().min(1, "Minimum amount is required"),
  maxAmount: z.string().min(1, "Maximum amount is required"),
  returnRate: z.string().min(1, "Return rate is required"),
  durationMonths: z.string().min(1, "Duration is required"),
})

interface CreatePlanFormProps {
  plan?: {
    id: string
    name: string
    description: string
    minAmount: number
    maxAmount: number
    returnRate: number
    durationMonths: number
  }
  onSuccess?: () => void
}

export function CreatePlanForm({ plan, onSuccess }: CreatePlanFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: plan?.name || "",
      description: plan?.description || "",
      minAmount: plan?.minAmount?.toString() || "",
      maxAmount: plan?.maxAmount?.toString() || "",
      returnRate: plan?.returnRate?.toString() || "",
      durationMonths: plan?.durationMonths?.toString() || "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      const formattedValues = {
        name: values.name,
        description: values.description,
        minAmount: parseFloat(values.minAmount),
        maxAmount: parseFloat(values.maxAmount),
        returnRate: parseFloat(values.returnRate),
        durationMonths: parseInt(values.durationMonths),
        type: MarketPlanType.SEMI_ANNUAL,
      }

      if (plan) {
        await updateMarketPlan(plan.id, formattedValues)
        toast.success("Market plan updated successfully")
      } else {
        await createMarketPlan(formattedValues)
        toast.success("Market plan created successfully")
      }

      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{plan ? "Edit Market Plan" : "Create Market Plan"}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter plan name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter plan description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="minAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Amount (USD)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="300000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Amount (USD)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="700000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="returnRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Return Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="15" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="durationMonths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (Months)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="6" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {plan ? "Update Plan" : "Create Plan"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
} 