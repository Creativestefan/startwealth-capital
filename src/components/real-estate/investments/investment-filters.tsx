"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface InvestmentFiltersProps {
  filters?: {
    type?: string
    minAmount?: number
    maxAmount?: number
  }
}

export function InvestmentFilters({ filters = {} }: InvestmentFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [type, setType] = useState<string | undefined>(filters.type)
  const [minAmount, setMinAmount] = useState<string>(filters.minAmount?.toString() || "")
  const [maxAmount, setMaxAmount] = useState<string>(filters.maxAmount?.toString() || "")

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())

    // Update or remove type parameter
    if (type) {
      params.set("type", type)
    } else {
      params.delete("type")
    }

    // Update or remove minAmount parameter
    if (minAmount) {
      params.set("minAmount", minAmount)
    } else {
      params.delete("minAmount")
    }

    // Update or remove maxAmount parameter
    if (maxAmount) {
      params.set("maxAmount", maxAmount)
    } else {
      params.delete("maxAmount")
    }

    router.push(`?${params.toString()}`)
  }

  const clearFilters = () => {
    setType(undefined)
    setMinAmount("")
    setMaxAmount("")
    router.push("")
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Select value={type} onValueChange={setType}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Investment Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="SEMI_ANNUAL">Semi-Annual</SelectItem>
          <SelectItem value="ANNUAL">Annual</SelectItem>
        </SelectContent>
      </Select>

      <Input
        type="number"
        placeholder="Min Amount"
        className="w-[120px]"
        value={minAmount}
        onChange={(e) => setMinAmount(e.target.value)}
      />

      <Input
        type="number"
        placeholder="Max Amount"
        className="w-[120px]"
        value={maxAmount}
        onChange={(e) => setMaxAmount(e.target.value)}
      />

      <Button variant="outline" size="sm" onClick={applyFilters}>
        Apply
      </Button>

      <Button variant="ghost" size="sm" onClick={clearFilters}>
        Clear
      </Button>
    </div>
  )
}

