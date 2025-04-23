"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FormItem, FormLabel, FormControl } from "@/components/ui/form"

interface PaymentOptionsProps {
  value: "FULL" | "INSTALLMENT"
  onChange: (value: "FULL" | "INSTALLMENT") => void
}

export function PaymentOptions({ value, onChange }: PaymentOptionsProps) {
  return (
    <RadioGroup value={value} onValueChange={onChange} className="flex flex-col space-y-1">
      <FormItem className="flex items-center space-x-3 space-y-0">
        <FormControl>
          <RadioGroupItem value="FULL" />
        </FormControl>
        <FormLabel className="font-normal">Full Payment</FormLabel>
      </FormItem>
      <FormItem className="flex items-center space-x-3 space-y-0">
        <FormControl>
          <RadioGroupItem value="INSTALLMENT" />
        </FormControl>
        <FormLabel className="font-normal">Installment Plan</FormLabel>
      </FormItem>
    </RadioGroup>
  )
}

