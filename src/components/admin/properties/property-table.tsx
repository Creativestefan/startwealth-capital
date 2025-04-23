"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { PropertyStatusBadge } from "./property-status-badge"
import { deleteProperty } from "@/lib/real-estate/actions/properties"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { MoreHorizontalIcon, PencilIcon, TrashIcon, EyeIcon } from "lucide-react"
import type { Property } from "@/lib/real-estate/types"

interface PropertyTableProps {
  properties: Property[]
}

export function PropertyTable({ properties }: PropertyTableProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      setIsDeleting(id)
      
      try {
        const response = await deleteProperty(id)
        
        if (response.success) {
          toast.success("Property deleted successfully")
          router.refresh()
        } else {
          toast.error(response.error || "Failed to delete property")
        }
      } catch (error) {
        toast.error("An error occurred while deleting the property")
        console.error(error)
      } finally {
        setIsDeleting(null)
      }
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No properties found
              </TableCell>
            </TableRow>
          ) : (
            properties.map((property) => (
              <TableRow key={property.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-md">
                      <Image
                        src={property.mainImage || "/placeholder.jpg"}
                        alt={property.name}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="font-medium">{property.name}</span>
                  </div>
                </TableCell>
                <TableCell>{property.location}</TableCell>
                <TableCell>{formatCurrency(Number(property.price))}</TableCell>
                <TableCell>
                  <PropertyStatusBadge status={property.status} />
                </TableCell>
                <TableCell>
                  {property.createdAt 
                    ? new Date(property.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontalIcon className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/properties/${property.id}`}>
                          <EyeIcon className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/properties/${property.id}/edit`}>
                          <PencilIcon className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(property.id)}
                        disabled={isDeleting === property.id}
                        className="text-destructive focus:text-destructive"
                      >
                        <TrashIcon className="mr-2 h-4 w-4" />
                        {isDeleting === property.id ? "Deleting..." : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
} 