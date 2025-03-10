import { PropertyForm } from "@/components/admin/properties/property-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon, PlusCircleIcon } from "lucide-react"

export default function NewPropertyPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header with breadcrumb */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/admin/properties" className="hover:underline">Properties</Link>
          <span>/</span>
          <span>New Property</span>
        </div>
        
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <PlusCircleIcon className="mr-2 h-6 w-6 text-primary" />
              Create New Property
            </h1>
            <p className="text-muted-foreground mt-1">
              Add a new property to the platform for users to invest in.
            </p>
          </div>
          
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/properties">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Properties
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Property Form */}
      <PropertyForm mode="create" />
    </div>
  )
} 