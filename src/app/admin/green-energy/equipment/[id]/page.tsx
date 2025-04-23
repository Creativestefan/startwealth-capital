export const dynamic = 'force-dynamic';
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getEquipmentById } from "@/lib/green-energy/actions/equipment"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Pencil, Package, DollarSign, Calendar, Info } from "lucide-react"
import Link from "next/link"
import { ImageCarousel } from "@/components/ui/image-carousel"
import { 
  formatCurrency, 
  formatDate, 
  formatEquipmentType 
} from "@/lib/green-energy/utils/formatting"

export const metadata: Metadata = {
  title: "Equipment Details",
  description: "View green energy equipment details",
}

interface EquipmentDetailsPageProps {
  params: {
    id: string
  }
}

export default async function EquipmentDetailsPage({ params }: EquipmentDetailsPageProps) {
  // Await the params object before accessing its properties
  const { id } = await params;
  
  const result = await getEquipmentById(id)
  
  if (!result.success || !result.data) {
    notFound()
  }
  
  const equipment = result.data
  // Determine status based on stock quantity instead of database status
  const status = equipment.stockQuantity > 0 
    ? { label: 'In Stock', color: 'green' } 
    : { label: 'Out of Stock', color: 'red' };
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/green-energy/equipment">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Equipment
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/admin/green-energy/equipment/${equipment.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Equipment
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Equipment Images with Carousel */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-0">
            <CardTitle>Images</CardTitle>
            <CardDescription>Equipment visual representation</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {equipment.images && (equipment.images as string[]).length > 0 ? (
              <ImageCarousel 
                images={equipment.images as string[]} 
                alt={equipment.name} 
                className="rounded-md shadow-sm"
              />
            ) : (
              <div className="flex h-64 items-center justify-center rounded-md border border-dashed">
                <p className="text-sm text-muted-foreground">No images available</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Equipment Details */}
        <div className="flex flex-col gap-6">
          <Card className="shadow-sm hover:shadow transition-shadow duration-200">
            <CardHeader className="pb-2 bg-muted/30">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Info className="h-5 w-5 text-primary" />
                Equipment Details
              </CardTitle>
              <CardDescription>Basic information</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                <p className="text-xl font-semibold text-primary">{equipment.name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-4">
                <div className="flex items-start gap-2">
                  <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                    <p className="font-medium">{formatEquipmentType(equipment.type)}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Price</h3>
                    <p className="font-medium">{formatCurrency(equipment.price)}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <Badge 
                    className="mt-1 text-sm px-3 py-1"
                    variant={status.color === "green" ? "default" : 
                            status.color === "yellow" ? "secondary" : 
                            status.color === "red" ? "destructive" : "outline"}
                  >
                    {status.label}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Stock</h3>
                  <p className="font-medium mt-1">
                    <span className="text-lg">{equipment.stockQuantity}</span> units
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2 pt-2 border-t">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                  <p>{formatDate(equipment.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm hover:shadow transition-shadow duration-200">
            <CardHeader className="pb-2 bg-muted/30">
              <CardTitle className="text-xl">Description</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="whitespace-pre-wrap leading-relaxed">{equipment.description}</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Features */}
      <Card className="shadow-sm hover:shadow transition-shadow duration-200">
        <CardHeader className="pb-2 bg-muted/30">
          <CardTitle className="text-xl">Features</CardTitle>
          <CardDescription>Key features and specifications</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {equipment.features && (equipment.features as string[]).length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              {(equipment.features as string[]).map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <span className="text-xs text-primary font-medium">{index + 1}</span>
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No features listed</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 