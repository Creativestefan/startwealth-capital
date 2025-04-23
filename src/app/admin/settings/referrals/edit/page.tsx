"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  ChevronLeft,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

// Default commission rates if api fails
const DEFAULT_RATES = {
  propertyCommissionRate: 0,
  equipmentCommissionRate: 0,
  marketCommissionRate: 0,
  greenEnergyCommissionRate: 0,
}

// Define the schema for the form
const formSchema = z.object({
  propertyCommissionRate: z
    .number()
    .min(0, { message: "Rate must be at least 0%" })
    .max(20, { message: "Rate must be at most 20%" }),
  equipmentCommissionRate: z
    .number()
    .min(0, { message: "Rate must be at least 0%" })
    .max(20, { message: "Rate must be at most 20%" }),
  marketCommissionRate: z
    .number()
    .min(0, { message: "Rate must be at least 0%" })
    .max(20, { message: "Rate must be at most 20%" }),
  greenEnergyCommissionRate: z
    .number()
    .min(0, { message: "Rate must be at least 0%" })
    .max(20, { message: "Rate must be at most 20%" }),
})

type SettingsFormValues = z.infer<typeof formSchema>

export default function EditReferralSettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  // Initialize the form with default values
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_RATES,
  })

  // Fetch the current settings when the component mounts
  useEffect(() => {
    async function fetchSettings() {
      try {
        setIsLoading(true)
        setError(null)
        
        // Add timestamp to prevent caching
        const response = await fetch(`/api/admin/referral-settings?t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
          }
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch settings: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Update form values with the current settings
        if (data.settings) {
          const formValues = {
            propertyCommissionRate: Number(data.settings.propertyCommissionRate || 0),
            equipmentCommissionRate: Number(data.settings.equipmentCommissionRate || 0),
            marketCommissionRate: Number(data.settings.marketCommissionRate || 0),
            greenEnergyCommissionRate: Number(data.settings.greenEnergyCommissionRate || 0),
          }
          
          form.reset(formValues)
          
          // Set last updated timestamp
          if (data.settings.updatedAt) {
            setLastUpdated(new Date(data.settings.updatedAt).toLocaleString())
          }
        } else {
          form.reset(DEFAULT_RATES)
          setLastUpdated(null)
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
        setError(error instanceof Error ? error.message : "An unknown error occurred")
        form.reset(DEFAULT_RATES)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSettings()
  }, [form])

  // Handle form submission
  async function onSubmit(values: SettingsFormValues) {
    try {
      setIsSaving(true)
      setError(null)
      
      // Simple direct approach
      const response = await fetch("/api/admin/referral-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        },
        body: JSON.stringify({
          propertyCommissionRate: Number(values.propertyCommissionRate),
          equipmentCommissionRate: Number(values.equipmentCommissionRate),
          marketCommissionRate: Number(values.marketCommissionRate),
          greenEnergyCommissionRate: Number(values.greenEnergyCommissionRate),
        }),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Server error response:", errorText)
        throw new Error(`Server error: ${response.status}`)
      }
      
      toast.success("Settings updated successfully")
      
      // Go back to settings page with timestamp to force refresh
      router.push(`/admin/settings/referrals?t=${Date.now()}`)
    } catch (error) {
      console.error("Error updating settings:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
      toast.error("Failed to update settings")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Edit Referral Commission Rates</h2>
          <p className="text-muted-foreground">
            Modify the commission rates for the referral program
          </p>
          {lastUpdated ? (
            <p className="text-sm text-muted-foreground mt-1">
              Last updated: {lastUpdated}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">
              Setting initial commission rates. No previous settings found.
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/settings/referrals">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Settings
          </Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Settings Form */}
      <Card>
        <CardHeader>
          <CardTitle>Update Commission Rates</CardTitle>
          <CardDescription>
            Set the percentage of commission that referrers will earn when their referrals make investments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="propertyCommissionRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Real Estate Commission Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          disabled={isLoading || isSaving}
                          {...field}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value)
                            field.onChange(isNaN(value) ? 0 : value)
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Commission percentage for property purchases
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="equipmentCommissionRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equipment Commission Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          disabled={isLoading || isSaving}
                          {...field}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value)
                            field.onChange(isNaN(value) ? 0 : value)
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Commission percentage for equipment purchases
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="marketCommissionRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Market Commission Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          disabled={isLoading || isSaving}
                          {...field}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value)
                            field.onChange(isNaN(value) ? 0 : value)
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Commission percentage for market investments
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="greenEnergyCommissionRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Green Energy Commission Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          disabled={isLoading || isSaving}
                          {...field}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value)
                            field.onChange(isNaN(value) ? 0 : value)
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Commission percentage for green energy investments
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-4 gap-2">
                <Button 
                  variant="outline"
                  type="button"
                  disabled={isLoading || isSaving}
                  onClick={() => router.push("/admin/settings/referrals")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || isSaving}
                  className="flex items-center"
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 