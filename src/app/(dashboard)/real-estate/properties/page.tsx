import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authConfig } from "@/lib/auth.config"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { PropertyGrid } from "@/components/real-estate/property/property-grid"
import { PropertyFilters } from "@/components/real-estate/property/property-filters"
import { getProperties } from "@/lib/real-estate/actions/properties"
import { PropertyStatus } from "@prisma/client"

/**
 * Loading component for the property page
 */
function PropertyLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[60px] w-full max-w-md rounded-lg" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
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

  // Parse filter parameters - properly await searchParams in Next.js 15
  const awaitedSearchParams = await searchParams
  
  const filters = {
    minPrice: awaitedSearchParams.minPrice ? Number(awaitedSearchParams.minPrice) : undefined,
    maxPrice: awaitedSearchParams.maxPrice ? Number(awaitedSearchParams.maxPrice) : undefined,
    location: awaitedSearchParams.location ? 
      (Array.isArray(awaitedSearchParams.location) ? awaitedSearchParams.location[0] : awaitedSearchParams.location) : 
      undefined,
    status: awaitedSearchParams.status ? awaitedSearchParams.status as PropertyStatus : undefined,
  }

  const propertiesResponse = await getProperties(filters)

  if (!propertiesResponse.success || !propertiesResponse.data) {
    throw new Error(propertiesResponse.error || "Failed to fetch properties")
  }

  const properties = propertiesResponse.data

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Real Estate Properties</h1>
        <p className="text-muted-foreground">Browse and invest in premium real estate properties</p>
      </div>

      <PropertyFilters filters={filters} />

      <Suspense fallback={<PropertyLoading />}>
        <PropertyGrid properties={properties} />
      </Suspense>
    </div>
  )
} 