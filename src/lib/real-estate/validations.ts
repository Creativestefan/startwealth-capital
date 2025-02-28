import * as z from "zod"

// Property Validations
export const propertyCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be positive"),
  location: z.string().min(1, "Location is required"),
  mapUrl: z.string().url("Invalid map URL").optional().nullable(),
  features: z.record(z.any()),
  mainImage: z.string().min(1, "Main image is required"),
  images: z.array(z.string()),
  status: z.enum(["AVAILABLE", "PENDING", "SOLD"]).default("AVAILABLE"),
  minInvestment: z.number().positive("Minimum investment must be positive").optional().nullable(),
  maxInvestment: z.number().positive("Maximum investment must be positive").optional().nullable(),
  expectedReturn: z.number().positive("Expected return must be positive").optional().nullable(),
})

export const propertyUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  price: z.number().positive("Price must be positive").optional(),
  location: z.string().min(1, "Location is required").optional(),
  mapUrl: z.string().url("Invalid map URL").optional().nullable(),
  features: z.record(z.any()).optional(),
  mainImage: z.string().min(1, "Main image is required").optional(),
  images: z.array(z.string()).optional(),
  status: z.enum(["AVAILABLE", "PENDING", "SOLD"]).optional(),
  minInvestment: z.number().positive("Minimum investment must be positive").optional().nullable(),
  maxInvestment: z.number().positive("Maximum investment must be positive").optional().nullable(),
  expectedReturn: z.number().positive("Expected return must be positive").optional().nullable(),
})

// Investment Validations
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

// Types
export type PropertyCreateInput = z.infer<typeof propertyCreateSchema>
export type PropertyUpdateInput = z.infer<typeof propertyUpdateSchema>
export type InvestmentCreateInput = z.infer<typeof investmentCreateSchema>
export type InvestmentUpdateInput = z.infer<typeof investmentUpdateSchema>

