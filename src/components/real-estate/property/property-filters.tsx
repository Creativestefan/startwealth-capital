"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { PropertyStatus } from "@prisma/client"

interface PropertyFiltersProps {
  filters?: {
    minPrice?: number
    maxPrice?: number
    location?: string
    status?: PropertyStatus
  }
}

export function PropertyFilters({ filters = {} }: PropertyFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [minPrice, setMinPrice] = useState<string>(filters.minPrice?.toString() || "")
  const [maxPrice, setMaxPrice] = useState<string>(filters.maxPrice?.toString() || "")
  const [location, setLocation] = useState<string>(filters.location || "")
  const [status, setStatus] = useState<PropertyStatus>(filters.status || "AVAILABLE")

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())

    // Update or remove minPrice parameter
    if (minPrice) {
      params.set("minPrice", minPrice)
    } else {
      params.delete("minPrice")
    }

    // Update or remove maxPrice parameter
    if (maxPrice) {
      params.set("maxPrice", maxPrice)
    } else {
      params.delete("maxPrice")
    }

    // Update or remove location parameter
    if (location) {
      params.set("location", location)
    } else {
      params.delete("location")
    }

    // Update or remove status parameter
    if (status && status !== "AVAILABLE") {
      params.set("status", status)
    } else {
      params.delete("status")
    }

    router.push(`?${params.toString()}`)
  }

  const clearFilters = () => {
    setMinPrice("")
    setMaxPrice("")
    setLocation("")
    setStatus("AVAILABLE")
    router.push("")
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Input
        type="number"
        placeholder="Min Price"
        className="w-[120px]"
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
      />

      <Input
        type="number"
        placeholder="Max Price"
        className="w-[120px]"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
      />

      <Input
        type="text"
        placeholder="Location"
        className="w-[180px]"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />

      <Select value={status} onValueChange={(value) => setStatus(value as PropertyStatus)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AVAILABLE">Available</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="SOLD">Sold</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" size="sm" onClick={applyFilters}>
        Apply
      </Button>

      <Button variant="ghost" size="sm" onClick={clearFilters}>
        Clear
      </Button>
    </div>
  )
}

