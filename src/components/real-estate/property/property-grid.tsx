import type { Property } from "@/lib/real-estate/types"
import { PropertyCard } from "./property-card"

interface PropertyGridProps {
  properties: Property[]
  variant?: "default" | "compact"
}

export function PropertyGrid({ properties, variant = "default" }: PropertyGridProps) {
  if (properties.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center rounded-lg border border-dashed bg-muted/20">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">No properties found</p>
          <p className="text-xs text-muted-foreground">Try adjusting your filters or check back later</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {properties.map((property) => (
        <div key={property.id} className="w-full">
          <PropertyCard property={property} variant={variant} />
        </div>
      ))}
    </div>
  )
}

