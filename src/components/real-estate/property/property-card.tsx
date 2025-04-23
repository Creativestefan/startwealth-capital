"use client"

import Image from "next/image"
import Link from "next/link"
import type { Property } from "@/lib/real-estate/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import { PriceTag } from "../shared/price-tag"
import { InvestmentStatusBadge } from "../shared/investment-status-badge"

interface PropertyCardProps {
  property: Property
  variant?: "default" | "compact"
}

/**
 * Displays a single property with basic information in a card format
 * Used in property listings and grid views
 */
export function PropertyCard({ property, variant = "default" }: PropertyCardProps) {
  const isCompact = variant === "compact"

  return (
    <Card className="overflow-hidden h-full flex flex-col border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
      <div className="relative">
        <div className="aspect-[3/2] w-full overflow-hidden">
          <Image
            src={property.mainImage || "/placeholder.svg"}
            alt={property.name}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>
        <InvestmentStatusBadge status={property.status} className="absolute right-2 top-2 z-10" />
      </div>

      <CardHeader className="p-3 pb-1">
        <div className="space-y-1">
          <h3 className="text-base font-semibold line-clamp-1">{property.name}</h3>
          <div className="flex items-center text-xs text-muted-foreground">
            <MapPin className="mr-1 h-3 w-3 text-primary/70" />
            <span className="line-clamp-1">{property.location}</span>
          </div>
        </div>
      </CardHeader>

      {!isCompact && (
        <CardContent className="px-3 py-1 flex-grow">
          <p className="line-clamp-2 text-xs text-muted-foreground">{property.description}</p>
        </CardContent>
      )}

      <CardFooter className="p-3 mt-auto border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <div className="font-semibold text-sm">
          <PriceTag amount={property.price} fontWeight={600} />
        </div>
        <Button 
          asChild 
          size="sm"
          variant="default" 
          className="h-8 px-3 rounded-md transition-all duration-200 hover:shadow-md text-xs"
        >
          <Link href={`/real-estate/property/${property.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

