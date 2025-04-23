import { z } from "zod"

// Property creation schema
export const propertyCreateSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  mapUrl: z.string().url().optional(),
  features: z.record(z.any()).optional(),
  mainImage: z.string().optional(),
  images: z.array(z.string()).optional(),
  status: z.enum(["AVAILABLE", "PENDING", "SOLD"]).optional(),
})

// Property update schema (similar to create but all fields optional)
export const propertyUpdateSchema = propertyCreateSchema.partial()

// Property transaction schema
export const propertyTransactionSchema = z.object({
  propertyId: z.string(),
  amount: z.number().positive("Amount must be positive"),
  type: z.enum(["FULL", "INSTALLMENT"]),
  installments: z.number().int().positive().optional(),
})

export const investmentCreateSchema = z.object({
  type: z.enum(["SEMI_ANNUAL", "ANNUAL"]),
  amount: z
    .number()
    .min(300000, "Minimum investment for semi-annual plan is $300,000")
    .max(2000000, "Maximum investment for annual plan is $2,000,000"),
})

export const investmentUpdateSchema = z.object({
  reinvest: z.boolean(),
})

export type PropertyCreateInput = z.infer<typeof propertyCreateSchema>
export type PropertyUpdateInput = z.infer<typeof propertyUpdateSchema>
export type InvestmentCreateInput = z.infer<typeof investmentCreateSchema>
export type InvestmentUpdateInput = z.infer<typeof investmentUpdateSchema>

