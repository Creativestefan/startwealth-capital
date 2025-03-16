"use client"

import { useState } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Eye, 
  Package 
} from "lucide-react"
import { 
  formatCurrency, 
  formatDate, 
  formatEquipmentStatus, 
  formatEquipmentType 
} from "@/lib/green-energy/utils/formatting"
import { SerializedEquipment } from "@/lib/green-energy/types"
import { deleteEquipment } from "@/lib/green-energy/actions/equipment"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface EquipmentTableProps {
  equipment: SerializedEquipment[]
}

export function EquipmentTable({ equipment }: EquipmentTableProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this equipment? This action cannot be undone.")) {
      setIsDeleting(id)
      
      try {
        const result = await deleteEquipment(id)
        
        if (result.success) {
          alert("Equipment deleted successfully")
          router.refresh()
        } else {
          alert(result.error || "Failed to delete equipment")
        }
      } catch (error) {
        alert("An unexpected error occurred")
      } finally {
        setIsDeleting(null)
      }
    }
  }

  if (!equipment.length) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-md border border-dashed p-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <Package className="h-10 w-10 text-muted-foreground" />
          <h3 className="text-xl font-semibold">No equipment found</h3>
          <p className="text-sm text-muted-foreground">
            Add some equipment to get started.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipment.map((item) => {
            const status = item.stockQuantity > 0 
              ? { label: 'In Stock', color: 'green' } 
              : { label: 'Out of Stock', color: 'red' };
            
            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{formatEquipmentType(item.type)}</TableCell>
                <TableCell>{formatCurrency(item.price)}</TableCell>
                <TableCell>{item.stockQuantity}</TableCell>
                <TableCell>
                  <Badge variant={status.color === "green" ? "default" : 
                                status.color === "yellow" ? "secondary" : 
                                status.color === "red" ? "destructive" : "outline"}>
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(item.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/green-energy/equipment/${item.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/green-energy/equipment/${item.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(item.id)}
                        disabled={isDeleting === item.id}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {isDeleting === item.id ? "Deleting..." : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
} 