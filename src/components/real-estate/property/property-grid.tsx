import type { Property } from "@/lib/real-estate/types"
import { PropertyCard } from "./property-card"

interface PropertyGridProps {
  properties: Property[]
  variant?: "default" | "compact"
}

export function PropertyGrid({ properties, variant = "default" }: PropertyGridProps) {
  if (properties.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
        <p className="text-center text-muted-foreground">No properties found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} variant={variant} />
      ))}
    </div>
  )
}

