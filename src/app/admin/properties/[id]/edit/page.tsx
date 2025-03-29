export const dynamic = 'force-dynamic';
import { notFound } from "next/navigation"
import Link from "next/link"
import { getPropertyById } from "@/lib/real-estate/actions/properties"
import { PropertyForm } from "@/components/admin/properties/property-form"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon, HomeIcon } from "lucide-react"
import type { Property } from "@/lib/real-estate/types"

interface EditPropertyPageProps {
  params: {
    id: string
  }
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const id = params?.id
  const { data: propertyData, success } = await getPropertyById(id)

  if (!success || !propertyData) {
    notFound()
  }

  // Ensure the property conforms to the expected Property type
  const property: Property = {
    ...propertyData,
    price: Number(propertyData.price),
    createdAt: new Date(propertyData.createdAt),
    updatedAt: new Date(propertyData.updatedAt)
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header with breadcrumb */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/admin/properties" className="hover:underline">Properties</Link>
          <span>/</span>
          <Link href={`/admin/properties/${property.id}`} className="hover:underline">{property.name}</Link>
          <span>/</span>
          <span>Edit</span>
        </div>
        
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <HomeIcon className="mr-2 h-6 w-6 text-primary" />
              Edit Property
            </h1>
            <p className="text-muted-foreground mt-1">
              Update the details of {property.name}
            </p>
          </div>
          
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/properties/${property.id}`}>
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Property
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Property Form */}
      <PropertyForm property={property} mode="edit" />
    </div>
  )
} 