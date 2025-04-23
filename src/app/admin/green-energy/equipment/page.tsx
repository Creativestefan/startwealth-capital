export const dynamic = 'force-dynamic';
import { Metadata } from "next"
import { getAllEquipment } from "@/lib/green-energy/actions/equipment"
import { EquipmentTable } from "@/components/admin/green-energy/equipment-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Equipment Management",
  description: "Manage green energy equipment inventory",
}

export default async function EquipmentPage() {
  const result = await getAllEquipment()
  
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Equipment Management</h2>
          <p className="text-muted-foreground">
            Manage your green energy equipment inventory
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/green-energy/equipment/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Equipment
          </Link>
        </Button>
      </div>
      
      {result.success && result.data ? (
        <EquipmentTable equipment={result.data} />
      ) : (
        <div className="flex h-[400px] w-full items-center justify-center rounded-md border border-dashed p-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <h3 className="text-xl font-semibold">No equipment found</h3>
            <p className="text-sm text-muted-foreground">
              {result.error || "No equipment has been added yet."}
            </p>
            <Button asChild className="mt-4">
              <Link href="/admin/green-energy/equipment/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Equipment
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 