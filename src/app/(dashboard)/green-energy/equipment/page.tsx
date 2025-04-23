export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authConfig } from "@/lib/auth.config"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { getAllEquipment } from "@/lib/green-energy/actions/equipment"

import Link from "next/link"
import { Button } from "@/components/ui/button"






import { EquipmentFilters } from "@/components/green-energy/equipment/equipment-filters"

/**
 * Loading component for the equipment page
 */
function EquipmentLoading() {
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
 * Green Energy Equipment page
 * Displays available equipment for purchase
 */
export default async function EquipmentPage({
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
    redirect("/profile/kyc")
  }

  // Parse filter parameters - properly await searchParams in Next.js 15
  const awaitedSearchParams = await searchParams
  
  // Note: We're not using filters directly since the getAllEquipment function doesn't accept parameters
  // This is a placeholder for future filter implementation
  const filters = {
    type: awaitedSearchParams.type ? 
      (Array.isArray(awaitedSearchParams.type) ? awaitedSearchParams.type[0] : awaitedSearchParams.type) : 
      undefined,
    minPrice: awaitedSearchParams.minPrice ? Number(awaitedSearchParams.minPrice) : undefined,
    maxPrice: awaitedSearchParams.maxPrice ? Number(awaitedSearchParams.maxPrice) : undefined,
    status: awaitedSearchParams.status ? 
      (Array.isArray(awaitedSearchParams.status) ? awaitedSearchParams.status[0] : awaitedSearchParams.status) : 
      undefined,
  }

  const equipmentResponse = await getAllEquipment()

  if (!equipmentResponse.success || !equipmentResponse.data) {
    throw new Error(equipmentResponse.error || "Failed to fetch equipment")
  }

  // Get all equipment (including sold items)
  const allEquipment = equipmentResponse.data
  
  // Calculate min and max prices for the filter
  const prices = allEquipment.map(item => item.price)
  const minPrice = Math.min(...prices, 0)
  const maxPrice = Math.max(...prices, 10000)
  
  // Filter equipment based on user selections
  let equipment = [...allEquipment]
  
  // Apply additional filters if provided
  if (filters.type && filters.type !== "all") {
    equipment = equipment.filter(item => item.type === filters.type)
  }
  if (filters.minPrice) {
    equipment = equipment.filter(item => item.price >= filters.minPrice!)
  }
  if (filters.maxPrice) {
    equipment = equipment.filter(item => item.price <= filters.maxPrice!)
  }
  // Filter by availability (instead of status)
  if (filters.status && filters.status !== "all") {
    if (filters.status === "available") {
      equipment = equipment.filter(item => item.stockQuantity > 0)
    } else if (filters.status === "sold") {
      equipment = equipment.filter(item => item.stockQuantity <= 0)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Green Energy Equipment</h1>
        <p className="text-muted-foreground">Browse and invest in sustainable green energy equipment</p>
      </div>

      {/* Equipment Filters */}
      <EquipmentFilters 
        currentFilters={filters} 
        minPrice={minPrice} 
        maxPrice={maxPrice} 
      />

      <Suspense fallback={<EquipmentLoading />}>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {equipment.length > 0 ? (
            equipment.map((item) => (
              <div key={item.id} className="rounded-lg border bg-card overflow-hidden group relative">
                {/* Out of Stock Badge */}
                {item.stockQuantity <= 0 && (
                  <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                    Out of Stock
                  </div>
                )}
                
                {item.images && item.images.length > 0 && (
                  <div className="aspect-[4/3] relative">
                    {/* eslint-disable @next/next/no-img-element */}
<img 
                      src={item.images[0]} 
                      alt={item.name} 
                      className={`object-cover w-full h-full transition-opacity ${item.stockQuantity <= 0 ? 'opacity-70' : ''}`}
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {item.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-medium text-primary">
                      ${item.price.toLocaleString()}
                    </span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {item.type}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`text-xs ${item.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                      {item.stockQuantity > 0 ? `${item.stockQuantity} in stock` : 'Out of stock'}
                    </span>
                  </div>
                  <Button 
                    asChild 
                    className="w-full mt-4"
                    variant={item.stockQuantity <= 0 ? "outline" : "default"}
                  >
                    <Link href={`/green-energy/equipment/${item.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">No equipment available with the selected filters.</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or check back later for new listings.</p>
            </div>
          )}
        </div>
      </Suspense>
    </div>
  )
} 