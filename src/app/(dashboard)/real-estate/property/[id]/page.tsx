export const dynamic = 'force-dynamic';
import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authConfig } from "@/lib/auth.config"
import { Skeleton } from "@/components/ui/skeleton"
import { PropertyDetails } from "@/components/real-estate/property/property-details"
import { getPropertyById } from "@/lib/real-estate/actions/properties"

/**
 * Loading component for the property details page
 */
function PropertyDetailsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[400px] rounded-lg" />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-[40px] w-3/4 rounded-lg" />
          <Skeleton className="h-[20px] w-1/2 rounded-lg" />
          <Skeleton className="h-[200px] rounded-lg" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-[300px] rounded-lg" />
        </div>
      </div>
    </div>
  )
}

/**
 * Property Details page
 * Displays detailed information about a specific property
 */
export default async function PropertyDetailPage(props: { params: Promise<{ id: string }> }) {
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

  // Get the property ID from params
  const params = await props.params
  const { id } = params
  
  try {
    const propertyResponse = await getPropertyById(id)

    if (!propertyResponse.success || !propertyResponse.data) {
      // Redirect to properties list with error message
      redirect("/real-estate/properties?error=property-not-found")
    }

    const property = propertyResponse.data

    return (
      <div className="flex flex-col gap-6 p-6">
        <Suspense fallback={<PropertyDetailsLoading />}>
          <PropertyDetails property={property} />
        </Suspense>
      </div>
    )
  } catch (error) {
    // Handle any errors
    console.error("Error fetching property:", error)
    redirect("/real-estate/properties?error=property-not-found")
  }
}

