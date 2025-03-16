import { Metadata } from "next"
import { EquipmentForm } from "@/components/admin/green-energy/equipment-form"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Add Equipment",
  description: "Add new green energy equipment to the inventory",
}

export default function AddEquipmentPage() {
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
        <h2 className="text-2xl font-bold tracking-tight">Add New Equipment</h2>
        <p className="text-muted-foreground">
          Add new green energy equipment to your inventory.
        </p>
      </div>
      
      <div className="rounded-md border p-6">
        <EquipmentForm />
      </div>
    </div>
  )
} 