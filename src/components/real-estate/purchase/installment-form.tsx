"use client"

import { Input } from "@/components/ui/input"
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import { PriceTag } from "../shared/price-tag"

interface InstallmentFormProps {
  amount: number
  installments: number
  onInstallmentsChange: (value: number) => void
}

export function InstallmentForm({ amount, installments, onInstallmentsChange }: InstallmentFormProps) {
  const installmentAmount = amount / installments

  return (
    <div className="space-y-4">
      <FormField
        name="installments"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Number of Installments</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={2}
                max={12}
                {...field}
                onChange={(e) => onInstallmentsChange(Number.parseInt(e.target.value))}
              />
            </FormControl>
            <FormDescription>Between 2 and 12 installments</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="rounded-md bg-muted p-3">
        <div className="text-sm font-medium">Payment Summary</div>
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Monthly Payment</span>
            <PriceTag amount={installmentAmount} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Amount</span>
            <PriceTag amount={amount} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Payment Frequency</span>
            <span className="font-medium">Monthly</span>
          </div>
        </div>
      </div>
    </div>
  )
}

