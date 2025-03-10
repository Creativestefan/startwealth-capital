// This component provides a form for creating and editing investment plans
// Updated to fix TypeScript import issues
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { INVESTMENT_PLANS } from "@/lib/real-estate/constants"
import { createInvestmentPlan, updateInvestmentPlan } from "@/lib/real-estate/actions/investments"

// Define the schema for investment plan creation/editing
const investmentPlanSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum(["SEMI_ANNUAL", "ANNUAL"]),
  minAmount: z.number().min(1, "Minimum amount must be greater than 0"),
  maxAmount: z.number().min(1, "Maximum amount must be greater than 0"),
  returnRate: z.number().min(0.01, "Return rate must be greater than 0"),
  image: z.string().optional(),
})

// Define the investment plan type
interface InvestmentPlan {
  id: string
  name: string
  description: string
  type: string
  minAmount: number
  maxAmount: number
  returnRate: number
  durationMonths: number
  image?: string
}

interface InvestmentPlanFormProps {
  plan?: InvestmentPlan
  mode: "create" | "edit"
}

type FormData = z.infer<typeof investmentPlanSchema>

export function InvestmentPlanForm({ plan, mode }: InvestmentPlanFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(investmentPlanSchema),
    defaultValues: plan
      ? {
          name: plan.name,
          description: plan.description,
          type: plan.type as "SEMI_ANNUAL" | "ANNUAL",
          minAmount: plan.minAmount,
          maxAmount: plan.maxAmount,
          returnRate: plan.returnRate,
          image: plan.image || "",
        }
      : {
          name: "",
          description: "",
          type: "SEMI_ANNUAL",
          minAmount: INVESTMENT_PLANS.SEMI_ANNUAL.minAmount,
          maxAmount: INVESTMENT_PLANS.SEMI_ANNUAL.maxAmount,
          returnRate: INVESTMENT_PLANS.SEMI_ANNUAL.returnRate,
          image: "",
        },
  })

  // Update min/max amounts and return rate when type changes
  const watchType = form.watch("type")
  
  // Update default values when type changes
  const updateDefaultsByType = (type: "SEMI_ANNUAL" | "ANNUAL") => {
    const planDefaults = INVESTMENT_PLANS[type]
    form.setValue("minAmount", planDefaults.minAmount)
    form.setValue("maxAmount", planDefaults.maxAmount)
    form.setValue("returnRate", planDefaults.returnRate)
  }

  async function onSubmit(data: FormData) {
    setIsSubmitting(true)

    try {
      // Set duration based on plan type
      const durationMonths = data.type === "SEMI_ANNUAL" ? 6 : 12;
      
      // Ensure image is a string (not undefined)
      const formData = {
        ...data,
        durationMonths,
        image: data.image || ""
      }
      
      let response;
      
      if (mode === "create") {
        response = await createInvestmentPlan(formData)
      } else {
        if (!plan) throw new Error("Plan not found")
        response = await updateInvestmentPlan(plan.id, formData)
      }
      
      if (response.success) {
        toast.success(
          mode === "create" ? "Investment plan created successfully" : "Investment plan updated successfully"
        )
        
        if (mode === "create") {
          router.push("/admin/properties/plans")
        } else {
          router.push(`/admin/properties/plans/${plan?.id}`)
        }
        
        router.refresh()
      } else {
        toast.error(response.error || "Failed to save investment plan")
      }
    } catch (error) {
      toast.error("An error occurred while saving the investment plan")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plan Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter plan name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plan Type</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value)
                    // Only update defaults if creating a new plan or if explicitly changing the type
                    if (mode === "create" || field.value !== value) {
                      updateDefaultsByType(value as "SEMI_ANNUAL" | "ANNUAL")
                    }
                  }} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SEMI_ANNUAL">Semi-Annual (6 months)</SelectItem>
                    <SelectItem value="ANNUAL">Annual (12 months)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  This will determine the investment parameters and duration
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the investment plan"
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-3">
          <FormField
            control={form.control}
            name="minAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Investment</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={field.value === 0 || field.value === undefined ? "" : field.value.toString()}
                    onChange={(e) => {
                      const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                      field.onChange(isNaN(value) ? 0 : value);
                    }}
                  />
                </FormControl>
                <FormDescription>Minimum investment amount in USD</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Investment</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={field.value === 0 || field.value === undefined ? "" : field.value.toString()}
                    onChange={(e) => {
                      const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                      field.onChange(isNaN(value) ? 0 : value);
                    }}
                  />
                </FormControl>
                <FormDescription>Maximum investment amount in USD</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="returnRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Return Rate</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={field.value === 0 || field.value === undefined ? "" : field.value.toString()}
                    onChange={(e) => {
                      const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                      field.onChange(isNaN(value) ? 0 : value);
                    }}
                  />
                </FormControl>
                <FormDescription>Return rate as a decimal (e.g., 0.15 for 15%)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormDescription>URL to an image representing this investment plan (optional)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (mode === "edit" && plan) {
                router.push(`/admin/properties/plans/${plan.id}`)
              } else {
                router.push("/admin/properties/plans")
              }
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : mode === "create" ? "Create Plan" : "Update Plan"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 