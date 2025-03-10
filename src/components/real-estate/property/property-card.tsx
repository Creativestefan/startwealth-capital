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
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative">
        <div className="aspect-video w-full overflow-hidden">
          <Image
            src={property.mainImage || "/placeholder.svg"}
            alt={property.name}
            fill
            className="object-cover transition-transform hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <InvestmentStatusBadge status={property.status} className="absolute right-2 top-2" />
      </div>

      <CardHeader className={isCompact ? "p-3" : "p-4"}>
        <div className="space-y-1">
          <h3 className="line-clamp-1 font-semibold">{property.name}</h3>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-1 h-3.5 w-3.5" />
            <span className="line-clamp-1">{property.location}</span>
          </div>
        </div>
      </CardHeader>

      {!isCompact && (
        <CardContent className="p-4 pt-0">
          <p className="line-clamp-2 text-sm text-muted-foreground">{property.description}</p>
        </CardContent>
      )}

      <CardFooter className={`flex items-center justify-between ${isCompact ? "p-3 pt-0" : "p-4 pt-0"}`}>
        <PriceTag amount={property.price} />
        <Button asChild size={isCompact ? "sm" : "default"} variant="outline">
          <Link href={`/real-estate/property/${property.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

