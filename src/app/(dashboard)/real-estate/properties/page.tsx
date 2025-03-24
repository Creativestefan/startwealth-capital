import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authConfig } from "@/lib/auth.config"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { PropertyGrid } from "@/components/real-estate/property/property-grid"
import { PropertyFilters } from "@/components/real-estate/property/property-filters"
import { getProperties } from "@/lib/real-estate/actions/properties"
import { PropertyStatus } from "@prisma/client"
import { ErrorHandler } from "@/components/real-estate/property/error-handler"

/**
 * Loading component for the property page
 */
function PropertyLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[60px] w-full max-w-md rounded-lg" />
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array(8)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-[350px] rounded-lg" />
          ))}
      </div>
    </div>
  )
}

/**
 * Real Estate Properties page
 * Displays available properties for purchase
 */
export default async function PropertiesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await getServerSession(authConfig)

  if (!session || !session.user) {
    redirect("/login")
  }

  // Ensure email is verified
  if (!session.user.emailVerified) {
    redirect(`/verify-email?email=${session.user.email}`)
  }

  // Check KYC status
  if (!session.user.kycStatus || session.user.kycStatus === "PENDING") {
    redirect("/dashboard?kyc=required")
  }

  // Await searchParams before accessing its properties
  const searchParams = await props.searchParams
  
  // Parse filter parameters
  const filters = {
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    location: searchParams.location ? 
      (Array.isArray(searchParams.location) ? searchParams.location[0] : searchParams.location) : 
      undefined,
    status: searchParams.status ? searchParams.status as PropertyStatus : undefined,
  }

  const propertiesResponse = await getProperties(filters)

  if (!propertiesResponse.success || !propertiesResponse.data) {
    throw new Error(propertiesResponse.error || "Failed to fetch properties")
  }

  const properties = propertiesResponse.data
  const error = searchParams.error as string | undefined

  return (
    <div className="flex flex-col gap-4 sm:gap-6 px-4 sm:px-6 py-4 sm:py-6">
      {/* Error handler component */}
      <ErrorHandler error={error} />
      
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Real Estate Properties</h1>
        <p className="text-sm text-muted-foreground">Browse and invest in premium real estate properties</p>
      </div>

      <PropertyFilters filters={filters} />

      <Suspense fallback={<PropertyLoading />}>
        <div className="px-1">
          <PropertyGrid properties={properties} />
        </div>
      </Suspense>
    </div>
  )
} 