export const dynamic = 'force-dynamic';
import { notFound } from "next/navigation"
import Link from "next/link"
import { getPropertyById } from "@/lib/real-estate/actions/properties"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { PropertyGallery } from "@/components/real-estate/property/property-gallery"
import { formatCurrency } from "@/lib/utils"
import { PencilIcon, MapPinIcon, CalendarIcon, TagIcon, HomeIcon, BedIcon, BathIcon, SquareIcon, ClockIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import type { Property } from "@/lib/real-estate/types"

interface PropertyDetailPageProps {
  params: {
    id: string
  }
}

export default async function PropertyDetailPage({
  params
}: PropertyDetailPageProps) {
  // In Next.js 15, we need to await the params object
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  
  // Fetch the property data
  const { data: propertyData, success } = await getPropertyById(id)
  
  if (!success || !propertyData) {
    notFound()
  }
  
  // Convert to the expected Property type
  const property: Property = {
    ...propertyData,
    price: Number(propertyData.price),
    createdAt: new Date(propertyData.createdAt),
    updatedAt: new Date(propertyData.updatedAt)
  }

  // Combine main image with gallery images for the full gallery
  const allImages = [property.mainImage, ...property.images].filter(Boolean)

  // Format dates for better display
  const createdDate = new Date(property.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  const updatedDate = new Date(property.updatedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Parse features as a Record to access properties safely
  const features = property.features as Record<string, string>;
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header with breadcrumb */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/admin/properties" className="hover:underline">Properties</Link>
          <span>/</span>
          <span>Property Details</span>
        </div>
        
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{property.name}</h1>
            <p className="text-muted-foreground mt-1">
              View and manage property details
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/properties">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Properties
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/admin/properties/${property.id}/edit`}>
                <PencilIcon className="mr-2 h-4 w-4" />
                Edit Property
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Property details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Gallery and Features */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <PropertyGallery images={allImages} alt={property.name} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <HomeIcon className="h-5 w-5 mr-2 text-primary" />
                <h3 className="text-lg font-medium">Property Features</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {features.bedrooms && (
                  <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                    <BedIcon className="h-6 w-6 mb-2 text-primary" />
                    <span className="text-xl font-semibold">{features.bedrooms}</span>
                    <span className="text-sm text-muted-foreground">Bedrooms</span>
                  </div>
                )}
                
                {features.bathrooms && (
                  <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                    <BathIcon className="h-6 w-6 mb-2 text-primary" />
                    <span className="text-xl font-semibold">{features.bathrooms}</span>
                    <span className="text-sm text-muted-foreground">Bathrooms</span>
                  </div>
                )}
                
                {features.squareFeet && (
                  <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                    <SquareIcon className="h-6 w-6 mb-2 text-primary" />
                    <span className="text-xl font-semibold">{features.squareFeet}</span>
                    <span className="text-sm text-muted-foreground">Square Feet</span>
                  </div>
                )}
                
                {features.yearBuilt && (
                  <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                    <CalendarIcon className="h-6 w-6 mb-2 text-primary" />
                    <span className="text-xl font-semibold">{features.yearBuilt}</span>
                    <span className="text-sm text-muted-foreground">Year Built</span>
                  </div>
                )}
              </div>
              
              {features.additional && (
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Additional Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {features.additional.split(',').map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {feature.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {property.mapUrl && (
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Location Map</h4>
                  <Button variant="outline" asChild className="w-full">
                    <a href={property.mapUrl} target="_blank" rel="noopener noreferrer">
                      <MapPinIcon className="mr-2 h-4 w-4" />
                      View on Google Maps
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <TagIcon className="h-5 w-5 mr-2 text-primary" />
                <h3 className="text-lg font-medium">Description</h3>
              </div>
              <p className="whitespace-pre-line leading-relaxed">{property.description}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Details and Status */}
        <div className="space-y-8">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-lg font-medium mb-4">Property Summary</h3>
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-muted-foreground">Price</span>
                <span className="text-2xl font-bold">{formatCurrency(Number(property.price))}</span>
              </div>
              
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={property.status === "AVAILABLE" ? "secondary" : 
                              property.status === "SOLD" ? "destructive" : 
                              "outline"}>
                  {property.status}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{property.id}</span>
              </div>
              
              <div className="flex items-center space-x-2 pb-4 border-b">
                <ClockIcon className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span>{createdDate}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <span>{updatedDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 