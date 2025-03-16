import { getServerSession } from "next-auth"
import { notFound, redirect } from "next/navigation"
import { authConfig } from "@/lib/auth.config"
import { getEquipmentById } from "@/lib/green-energy/actions/equipment"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatDate, formatEquipmentStatus, formatEquipmentType } from "@/lib/green-energy/utils/formatting"
import { EquipmentStatus } from "@prisma/client"
import { ImageCarousel } from "@/components/ui/image-carousel"
import { PurchaseEquipmentButton } from "@/components/green-energy/equipment/purchase-button"

interface EquipmentDetailPageProps {
  params: {
    id: string
  }
}

export default async function EquipmentDetailPage({ params }: EquipmentDetailPageProps) {
  // Await the params object before accessing its properties
  const { id } = await params;
  
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
    redirect("/dashboard?kyc=required")
  }

  const result = await getEquipmentById(id)
  
  if (!result.success || !result.data) {
    notFound()
  }
  
  const equipment = result.data
  
  // Get equipment status information
  const statusInfo = formatEquipmentStatus(equipment.status, equipment.stockQuantity)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/green-energy/equipment">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Equipment
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Equipment Images */}
        <Card>
          <CardContent className="p-0 overflow-hidden rounded-lg">
            <ImageCarousel 
              images={equipment.images || []} 
              alt={equipment.name} 
            />
          </CardContent>
        </Card>
        
        {/* Equipment Details */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{equipment.name}</CardTitle>
              <CardDescription>
                {formatEquipmentType(equipment.type)} - <span className={statusInfo.color}>{statusInfo.label}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{equipment.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-primary">
                      ${equipment.price.toLocaleString()}
                    </span>
                    {equipment.stockQuantity <= 0 && (
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Out of Stock
                      </span>
                    )}
                    {equipment.stockQuantity > 0 && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {equipment.stockQuantity} in Stock
                      </span>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{equipment.description}</p>
                </div>
                
                <Separator />
                
                {/* Features */}
                {equipment.features && equipment.features.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Features</h3>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {equipment.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {equipment.stockQuantity > 0 ? (
                  <PurchaseEquipmentButton 
                    equipmentId={equipment.id}
                    equipmentName={equipment.name}
                    equipmentPrice={equipment.price}
                    isAvailable={equipment.stockQuantity > 0}
                  />
                ) : (
                  <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 text-sm">
                    <p className="font-medium">This item is currently out of stock</p>
                    <p className="mt-1">Please check back later or browse other available equipment.</p>
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground text-center">
                  Listed on {formatDate(equipment.createdAt)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 