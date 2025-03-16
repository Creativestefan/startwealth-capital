"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/green-energy/utils/formatting"
import { EquipmentStatus, EquipmentType } from "@prisma/client"
import { Search, Filter, Tag } from "lucide-react"

/**
 * Equipment Filter component
 */
export function EquipmentFilters({ 
  currentFilters, 
  minPrice, 
  maxPrice 
}: { 
  currentFilters: {
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
  };
  minPrice: number;
  maxPrice: number;
}) {
  // Calculate initial price range
  const initialMinPrice = currentFilters.minPrice || minPrice;
  const initialMaxPrice = currentFilters.maxPrice || maxPrice;
  
  // State to track the current price range
  const [minPriceValue, setMinPriceValue] = useState(initialMinPrice);
  const [maxPriceValue, setMaxPriceValue] = useState(initialMaxPrice);

  // Update hidden form inputs when price range changes
  useEffect(() => {
    const minInput = document.querySelector('input[name="minPrice"]') as HTMLInputElement;
    const maxInput = document.querySelector('input[name="maxPrice"]') as HTMLInputElement;
    if (minInput && maxInput) {
      minInput.value = minPriceValue.toString();
      maxInput.value = maxPriceValue.toString();
    }
  }, [minPriceValue, maxPriceValue]);

  // Handle min price input change
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setMinPriceValue(Math.max(minPrice, Math.min(value, maxPriceValue)));
  };

  // Handle max price input change
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setMaxPriceValue(Math.max(minPriceValue, Math.min(value, maxPrice)));
  };

  return (
    <Card className="shadow-sm border-0 bg-white/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <form className="flex flex-col md:flex-row gap-4 items-end">
          {/* Equipment Type Filter */}
          <div className="flex-1 space-y-2">
            <Label htmlFor="type" className="text-sm font-medium flex items-center gap-1">
              <Filter className="h-4 w-4" />
              Equipment Type
            </Label>
            <Select 
              defaultValue={currentFilters.type || "all"}
              name="type"
            >
              <SelectTrigger id="type" className="h-10 rounded-md border border-input bg-white">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value={EquipmentType.SOLAR_PANEL}>Solar Panel</SelectItem>
                <SelectItem value={EquipmentType.WIND_TURBINE}>Wind Turbine</SelectItem>
                <SelectItem value={EquipmentType.BATTERY_STORAGE}>Battery Storage</SelectItem>
                <SelectItem value={EquipmentType.INVERTER}>Inverter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Availability Filter */}
          <div className="flex-1 space-y-2">
            <Label htmlFor="availability" className="text-sm font-medium flex items-center gap-1">
              <Tag className="h-4 w-4" />
              Availability
            </Label>
            <Select 
              defaultValue={currentFilters.status || "all"}
              name="status"
            >
              <SelectTrigger id="availability" className="h-10 rounded-md border border-input bg-white">
                <SelectValue placeholder="All Items" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="available">In Stock</SelectItem>
                <SelectItem value="sold">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Range Filter */}
          <div className="flex-1 space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1">
              <Search className="h-4 w-4" />
              Price Range
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                className="h-10 bg-white"
                value={minPriceValue}
                onChange={handleMinPriceChange}
                min={minPrice}
                max={maxPriceValue}
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="number"
                placeholder="Max"
                className="h-10 bg-white"
                value={maxPriceValue}
                onChange={handleMaxPriceChange}
                min={minPriceValue}
                max={maxPrice}
              />
              
              {/* Hidden inputs for form submission */}
              <input 
                type="hidden" 
                name="minPrice" 
                value={minPriceValue} 
              />
              <input 
                type="hidden" 
                name="maxPrice" 
                value={maxPriceValue} 
              />
            </div>
          </div>

          {/* Apply Filters Button */}
          <Button type="submit" className="h-10 px-6 bg-primary hover:bg-primary/90 text-white">
            Apply Filters
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 