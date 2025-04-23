"use client"

import { useState } from "react"
import type { Property } from "@/lib/real-estate/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Check, 
  Calendar, 
  DollarSign, 
  Home, 
  Maximize, 
  Bed, 
  Bath, 
  Car, 
  Landmark,
  Share2,
  Share,
  ArrowLeft
} from "lucide-react"
import { PriceTag } from "../shared/price-tag"
import { LocationMap } from "../shared/location-map"
import { PropertyGallery } from "./property-gallery"
import { PurchaseForm } from "../purchase/purchase-form"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface PropertyDetailsProps {
  property: Property
}

/**
 * Displays comprehensive information about a specific property
 * Used on individual property pages
 */
export function PropertyDetails({ property }: PropertyDetailsProps) {
  const [showPurchaseForm, setShowPurchaseForm] = useState(false)
  const router = useRouter()

  // Format date
  const formattedDate = property.createdAt 
    ? new Date(property.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : "N/A"

  // Extract features
  const features = {
    bedrooms: typeof property.features === 'object' && property.features !== null && 'bedrooms' in property.features 
      ? (property.features as Record<string, any>).bedrooms 
      : null,
    bathrooms: typeof property.features === 'object' && property.features !== null && 'bathrooms' in property.features 
      ? (property.features as Record<string, any>).bathrooms 
      : null,
    area: typeof property.features === 'object' && property.features !== null && 'area' in property.features 
      ? (property.features as Record<string, any>).area 
      : null,
    yearBuilt: typeof property.features === 'object' && property.features !== null && 'yearBuilt' in property.features 
      ? (property.features as Record<string, any>).yearBuilt 
      : null,
    parking: typeof property.features === 'object' && property.features !== null && 'parking' in property.features 
      ? (property.features as Record<string, any>).parking 
      : null,
    type: typeof property.features === 'object' && property.features !== null && 'propertyType' in property.features 
      ? (property.features as Record<string, any>).propertyType 
      : null
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.name,
        text: `Check out this property: ${property.name}`,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          toast("Link copied to clipboard", {
            description: "You can now share it with others",
          })
        })
        .catch((error) => console.log('Error copying to clipboard', error));
    }
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4 flex items-center gap-1 text-muted-foreground hover:text-foreground"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to properties
      </Button>

      {/* Main content grid with fixed right sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Gallery and Property Details */}
        <div className="md:col-span-2 space-y-5">
          {/* Hero Section with Gallery */}
          <PropertyGallery images={property.images} alt={property.name} />
          
          {/* Divider between gallery and property details */}
          <div className="border-t border-gray-200 my-4"></div>

          {/* Property Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant={property.status === "AVAILABLE" ? "default" : "secondary"}>
                {property.status === "AVAILABLE" ? "Available" : property.status}
              </Badge>
              {features.type && (
                <Badge variant="outline" className="text-xs">
                  <Landmark className="mr-1 h-3 w-3" />
                  {features.type}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                <Calendar className="mr-1 h-3 w-3" />
                Listed on {formattedDate}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold md:text-3xl">{property.name}</h1>
            <div className="mt-2 flex items-center text-muted-foreground text-sm">
              <MapPin className="mr-1 h-4 w-4" />
              <span>{property.location}</span>
            </div>
          </div>

          {/* Key Features Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-y">
            {features.bedrooms && (
              <div className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-xs text-muted-foreground">Bedrooms</div>
                  <div className="font-medium text-sm">{features.bedrooms}</div>
                </div>
              </div>
            )}
            {features.bathrooms && (
              <div className="flex items-center gap-2">
                <Bath className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-xs text-muted-foreground">Bathrooms</div>
                  <div className="font-medium text-sm">{features.bathrooms}</div>
                </div>
              </div>
            )}
            {features.area && (
              <div className="flex items-center gap-2">
                <Maximize className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-xs text-muted-foreground">Area</div>
                  <div className="font-medium text-sm">{features.area} sq ft</div>
                </div>
              </div>
            )}
            {features.yearBuilt && (
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-xs text-muted-foreground">Year Built</div>
                  <div className="font-medium text-sm">{features.yearBuilt}</div>
                </div>
              </div>
            )}
            {features.parking && (
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-xs text-muted-foreground">Parking</div>
                  <div className="font-medium text-sm">{features.parking}</div>
                </div>
              </div>
            )}
          </div>

          {/* Content Sections */}
          <div className="space-y-6">
            {/* Description Section */}
            <section>
              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <div className="prose max-w-none dark:prose-invert text-sm">
                <p>{property.description}</p>
              </div>
            </section>
            
            {/* Features Section */}
            <section>
              <h2 className="text-lg font-semibold mb-3">Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {property.features && 
                 typeof property.features === 'object' && 
                 !Array.isArray(property.features) &&
                 Object.entries(property.features as Record<string, any>).map(([key, value]) => (
                  value && (
                    <div key={key} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <div>
                        <div className="font-medium text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                        <div className="text-xs text-muted-foreground">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </section>
            
            {/* Location Section */}
            <section>
              <h2 className="text-lg font-semibold mb-3">Location</h2>
              <p className="mb-3 text-sm">{property.location}</p>
              
              <Button 
                variant="outline" 
                className="flex items-center gap-2 text-xs"
                size="sm"
                onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(property.location)}`, '_blank')}
              >
                <MapPin className="h-3 w-3" />
                View on Google Maps
              </Button>
            </section>
          </div>
        </div>

        {/* Right column - Price and CTA Card (Fixed while scrolling) */}
        <div className="md:col-span-1">
          <div className="md:sticky md:top-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base font-medium text-[16px]">
                  <span>Property Price</span>
                  <Badge variant={property.status === "AVAILABLE" ? "default" : "secondary"}>
                    {property.status === "AVAILABLE" ? "Available" : property.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pb-3">
                <div>
                  <div className="text-3xl">
                    <PriceTag amount={property.price} fontWeight={700} />
                  </div>
                </div>
                
                {property.status === "AVAILABLE" && (
                  <Button 
                    className="w-full" 
                    size="default" 
                    onClick={() => setShowPurchaseForm(true)}
                  >
                    Purchase Property
                  </Button>
                )}
                
                <Button variant="outline" className="w-full text-sm" size="sm" onClick={handleShare}>
                  <Share className="mr-2 h-3 w-3" />
                  Share Property
                </Button>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground border-t pt-3">
                <p>Purchase directly charges your wallet balance</p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Purchase Form Modal */}
      <PurchaseForm property={property} open={showPurchaseForm} onOpenChange={setShowPurchaseForm} />
    </div>
  )
}

