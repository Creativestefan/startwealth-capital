export const dynamic = 'force-dynamic';
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getEquipmentById } from "@/lib/green-energy/actions/equipment"
import { EquipmentForm } from "@/components/admin/green-energy/equipment-form"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Edit Equipment",
  description: "Edit green energy equipment details",
}

interface EditEquipmentPageProps {
  params: {
    id: string
  }
}

export default async function EditEquipmentPage({ params }: EditEquipmentPageProps) {
  // Await the params object before accessing its properties
  const { id } = await params;
  
  const result = await getEquipmentById(id)
  
  if (!result.success || !result.data) {
    notFound()
  }
  
  const equipment = result.data
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/green-energy/equipment">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Equipment
          </Link>
        </Button>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Edit Equipment</h2>
        <p className="text-muted-foreground">
          Update the details of {equipment.name}.
        </p>
      </div>
      
      <div className="rounded-md border p-6">
        <EquipmentForm equipment={equipment} isEditing />
      </div>
    </div>
  )
} 