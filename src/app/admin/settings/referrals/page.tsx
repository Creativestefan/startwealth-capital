"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { 
  RefreshCw, 
  Banknote, 
  Building, 
  Home, 
  Truck, 
  Loader2,
  Edit
} from "lucide-react"
import { toast } from "sonner"
import CleanupDatabaseButton from "./cleanup"

// Default commission rates if api fails
const DEFAULT_RATES = {
  propertyCommissionRate: 0,
  equipmentCommissionRate: 0,
  marketCommissionRate: 0,
  greenEnergyCommissionRate: 0,
}

export default function ReferralSettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState(DEFAULT_RATES)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  // Fetch settings only on initial mount
  useEffect(() => {
    // Simple fetch function defined inside useEffect to avoid dependency issues
    async function fetchSettings() {
      try {
        setIsLoading(true)
        setError(null)
        
        // Add a cache-busting timestamp
        const timestamp = Date.now()
        
        // Make the request with cache headers
        const response = await fetch(`/api/admin/referral-settings?t=${timestamp}`, {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch settings: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.settings) {
          setSettings(data.settings)
          
          if (data.settings.updatedAt) {
            setLastUpdated(new Date(data.settings.updatedAt).toLocaleString())
          }
        } else {
          setSettings(DEFAULT_RATES)
          setLastUpdated(null)
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
        setError(error instanceof Error ? error.message : "An unknown error occurred")
        setSettings(DEFAULT_RATES)
        setLastUpdated(null)
      } finally {
        setIsLoading(false)
      }
    }
    
    // Call the fetch function
    fetchSettings()
    
    // No dependencies - only runs on mount
  }, [])

  // Simple refresh handler
  const handleRefresh = async () => {
    if (isRefreshing) return
    
    try {
      setIsRefreshing(true)
      setError(null)
      
      const timestamp = Date.now()
      
      const response = await fetch(`/api/admin/referral-settings?t=${timestamp}&revalidate=true`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to refresh settings: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.settings) {
        setSettings(data.settings)
        
        if (data.settings.updatedAt) {
          setLastUpdated(new Date(data.settings.updatedAt).toLocaleString())
        }
        
        toast.success("Settings refreshed successfully")
      } else {
        setSettings(DEFAULT_RATES)
        setLastUpdated(null)
      }
    } catch (error) {
      console.error("Error refreshing settings:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
      toast.error("Failed to refresh settings")
    } finally {
      setIsRefreshing(false)
    }
  }

  // Format rate to display with percent sign
  const formatRate = (rate: any) => {
    if (rate === null || rate === undefined) return "0%"
    return `${rate}%`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Referral Commission Settings</h2>
          <p className="text-muted-foreground">
            Current commission rates for the referral program
          </p>
          {lastUpdated ? (
            <p className="text-sm text-muted-foreground mt-1">
              Last updated: {lastUpdated}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">
              Using default rates (0%). Update rates to enable commission payments.
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <CleanupDatabaseButton />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="default"
            size="sm"
            asChild
          >
            <Link href="/admin/settings/referrals/edit">
              <Edit className="mr-2 h-4 w-4" />
              Edit Rates
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Commission Rate Cards */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Home className="h-5 w-5 text-orange-500" />
              <span>Real Estate</span>
            </CardTitle>
            <CardDescription>
              Commission rates for property purchases and real estate investments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Loading...
                </span>
              ) : (
                formatRate(settings?.propertyCommissionRate)
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-500" />
              <span>Equipment</span>
            </CardTitle>
            <CardDescription>
              Commission rates for equipment purchases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Loading...
                </span>
              ) : (
                formatRate(settings?.equipmentCommissionRate)
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Banknote className="h-5 w-5 text-green-500" />
              <span>Market Investments</span>
            </CardTitle>
            <CardDescription>
              Commission rates for market investment plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Loading...
                </span>
              ) : (
                formatRate(settings?.marketCommissionRate)
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="h-5 w-5 text-emerald-500" />
              <span>Green Energy</span>
            </CardTitle>
            <CardDescription>
              Commission rates for green energy investments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Loading...
                </span>
              ) : (
                formatRate(settings?.greenEnergyCommissionRate)
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 