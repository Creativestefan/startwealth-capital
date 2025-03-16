"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { greenEnergyPlanCreateSchema, GreenEnergyPlanCreateInput } from "@/lib/green-energy/validations"
import { createGreenEnergyPlan, updateGreenEnergyPlan } from "@/lib/green-energy/actions/investments"
import { SerializedGreenEnergyPlan } from "@/lib/green-energy/types"
import { GreenEnergyInvestmentType } from "@prisma/client"
import { toast } from "sonner"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2, InfoIcon } from "lucide-react"

// Define default values for different plan types
const PLAN_DEFAULTS = {
  SEMI_ANNUAL: {
    minAmount: 300000,
    maxAmount: 700000,
    returnRate: 15,  // 15%
    durationMonths: 6
  },
  ANNUAL: {
    minAmount: 500000,
    maxAmount: 2000000,
    returnRate: 22,  // 22%
    durationMonths: 12
  }
}

interface PlanFormProps {
  plan?: SerializedGreenEnergyPlan
  isEditing?: boolean
}

export function PlanForm({ plan, isEditing = false }: PlanFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with default values or existing plan data
  const form = useForm<GreenEnergyPlanCreateInput>({
    resolver: zodResolver(greenEnergyPlanCreateSchema),
    defaultValues: isEditing && plan
      ? {
          name: plan.name,
          description: plan.description,
          type: plan.type,
          minAmount: plan.minAmount,
          maxAmount: plan.maxAmount,
          returnRate: plan.returnRate,
          durationMonths: plan.durationMonths,
          image: plan.image,
        }
      : {
          name: "",
          description: "",
          type: GreenEnergyInvestmentType.SEMI_ANNUAL,
          minAmount: PLAN_DEFAULTS.SEMI_ANNUAL.minAmount,
          maxAmount: PLAN_DEFAULTS.SEMI_ANNUAL.maxAmount,
          returnRate: PLAN_DEFAULTS.SEMI_ANNUAL.returnRate,
          durationMonths: PLAN_DEFAULTS.SEMI_ANNUAL.durationMonths,
          image: "",
        },
  })

  // Watch the type field to update defaults when it changes
  const watchType = form.watch("type")
  
  // Update default values when type changes
  const updateDefaultsByType = (type: GreenEnergyInvestmentType) => {
    const planDefaults = PLAN_DEFAULTS[type]
    form.setValue("minAmount", planDefaults.minAmount)
    form.setValue("maxAmount", planDefaults.maxAmount)
    form.setValue("returnRate", planDefaults.returnRate)
    form.setValue("durationMonths", planDefaults.durationMonths)
  }

  // Handle form submission
  const onSubmit = async (data: GreenEnergyPlanCreateInput) => {
    setIsSubmitting(true)

    try {
      // Set duration based on plan type
      data.durationMonths = data.type === GreenEnergyInvestmentType.SEMI_ANNUAL ? 6 : 12;
      
      let result

      if (isEditing && plan) {
        // Update existing plan
        result = await updateGreenEnergyPlan(plan.id, data)
      } else {
        // Create new plan
        result = await createGreenEnergyPlan(data)
      }

      if (result.success) {
        toast.success(
          isEditing ? "Plan updated successfully" : "Plan created successfully"
        )
        router.push("/admin/green-energy/plans")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to save investment plan")
      }
    } catch (error) {
      console.error("Error saving plan:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plan Name</FormLabel>
                <FormControl>
                  <Input placeholder="Annual Green Energy Plan" {...field} />
                </FormControl>
                <FormDescription>
                  The name of the investment plan.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Type */}
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
                    if (!isEditing || field.value !== value) {
                      updateDefaultsByType(value as GreenEnergyInvestmentType)
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
                  This will determine the investment parameters and duration.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Duration Note */}
        <div className="flex items-start gap-2 p-3 rounded-md bg-muted/50 text-sm">
          <InfoIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Duration is automatically set based on plan type:</p>
            <ul className="list-disc list-inside mt-1 ml-1 text-muted-foreground">
              <li>Semi-Annual plans have a 6-month duration</li>
              <li>Annual plans have a 12-month duration</li>
            </ul>
          </div>
        </div>

        {/* Description */}
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
              <FormDescription>
                Provide a detailed description of the investment plan.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Min Amount */}
          <FormField
            control={form.control}
            name="minAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Amount (USD)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="300000"
                    value={field.value === 0 ? "" : field.value}
                    onChange={(e) => {
                      const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                      field.onChange(isNaN(value) ? 0 : value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  The minimum investment amount in USD.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Max Amount */}
          <FormField
            control={form.control}
            name="maxAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Amount (USD)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="700000"
                    value={field.value === 0 ? "" : field.value}
                    onChange={(e) => {
                      const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                      field.onChange(isNaN(value) ? 0 : value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  The maximum investment amount in USD.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Return Rate */}
          <FormField
            control={form.control}
            name="returnRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Return Rate (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="15"
                    value={field.value === 0 ? "" : field.value}
                    onChange={(e) => {
                      const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                      field.onChange(isNaN(value) ? 0 : value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Enter the percentage directly (e.g., 15 for 15%)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image URL */}
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem className="md:col-span-3">
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  URL to an image representing this investment plan.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Hidden duration field - automatically set based on type */}
        <input 
          type="hidden" 
          {...form.register("durationMonths")} 
          value={watchType === GreenEnergyInvestmentType.SEMI_ANNUAL ? 6 : 12} 
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Plan" : "Create Plan"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 