"use client"

import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PropertyStatus } from "@prisma/client"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Filter } from "lucide-react"

interface PropertyFiltersProps {
  filters: {
    minPrice?: number
    maxPrice?: number
    location?: string
    status?: PropertyStatus
  }
}

export function PropertyFilters({ filters }: PropertyFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  
  const [minPrice, setMinPrice] = useState(filters.minPrice?.toString() || "")
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice?.toString() || "")
  const [location, setLocation] = useState(filters.location || "")
  const [status, setStatus] = useState<PropertyStatus | undefined>(filters.status)
  
  function applyFilters() {
    const params = new URLSearchParams()
    
    if (minPrice) params.append("minPrice", minPrice)
    if (maxPrice) params.append("maxPrice", maxPrice)
    if (location) params.append("location", location)
    if (status) params.append("status", status)
    
    router.push(`${pathname}?${params.toString()}`)
  }
  
  function clearFilters() {
    setMinPrice("")
    setMaxPrice("")
    setLocation("")
    setStatus(undefined)
    router.push(pathname)
  }
  
  const FilterForm = () => (
    <>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <div className="space-y-2">
          <Input
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            type="number"
            className="h-9"
          />
        </div>
        <div className="space-y-2">
          <Input
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            type="number"
            className="h-9"
          />
        </div>
        <div className="space-y-2">
          <Input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="space-y-2">
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as PropertyStatus)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Sold" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AVAILABLE">Available</SelectItem>
              <SelectItem value="SOLD">Sold</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="h-9"
        >
          Clear
        </Button>
        <Button
          onClick={applyFilters}
          size="sm"
          className="h-9"
        >
          Apply
        </Button>
      </div>
    </>
  )
  
  // Mobile view with bottom sheet
  const MobileFilters = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-xl">
        <SheetHeader className="mb-4">
          <SheetTitle>Filter Properties</SheetTitle>
        </SheetHeader>
        <FilterForm />
      </SheetContent>
    </Sheet>
  )
  
  // Desktop view
  const DesktopFilters = () => (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <FilterForm />
    </div>
  )
  
  return (
    <>
      {/* Mobile view */}
      <div className="md:hidden">
        <MobileFilters />
      </div>
      
      {/* Desktop view */}
      <div className="hidden md:block">
        <DesktopFilters />
      </div>
    </>
  )
}

