import * as z from "zod"
import { EquipmentStatus, EquipmentType, GreenEnergyInvestmentType } from "@prisma/client"

// Equipment Validations
export const equipmentCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  features: z.array(z.string()).min(1, "At least one feature is required"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  price: z.number().positive("Price must be positive"),
  type: z.nativeEnum(EquipmentType, {
    errorMap: () => ({ message: "Please select a valid equipment type" }),
  }),
  stockQuantity: z.number().int().nonnegative("Stock quantity must be non-negative"),
})

export const equipmentUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  features: z.array(z.string()).min(1, "At least one feature is required").optional(),
  images: z.array(z.string()).min(1, "At least one image is required").optional(),
  price: z.number().positive("Price must be positive").optional(),
  type: z.nativeEnum(EquipmentType, {
    errorMap: () => ({ message: "Please select a valid equipment type" }),
  }).optional(),
  stockQuantity: z.number().int().nonnegative("Stock quantity must be non-negative").optional(),
  status: z.nativeEnum(EquipmentStatus).optional(),
})

// Equipment Purchase Validation
export const equipmentPurchaseSchema = z.object({
  quantity: z.number().int().positive("Quantity must be at least 1"),
  deliveryAddress: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
  }),
})

// Green Energy Investment Validations
export const greenEnergyInvestmentCreateSchema = z.object({
  type: z.nativeEnum(GreenEnergyInvestmentType, {
    errorMap: () => ({ message: "Please select a valid investment type" }),
  }),
  amount: z
    .number()
    .min(300000, "Minimum investment for semi-annual plan is $300,000")
    .max(2000000, "Maximum investment for annual plan is $2,000,000"),
  reinvest: z.boolean().default(false),
})

export const greenEnergyInvestmentUpdateSchema = z.object({
  reinvest: z.boolean(),
})

// Green Energy Plan Validations
export const greenEnergyPlanCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  type: z.nativeEnum(GreenEnergyInvestmentType, {
    errorMap: () => ({ message: "Please select a valid investment type" }),
  }),
  minAmount: z.number().positive("Minimum amount must be positive"),
  maxAmount: z.number().positive("Maximum amount must be positive"),
  returnRate: z.number().positive("Return rate must be positive"),
  durationMonths: z.number().int().positive("Duration must be positive"),
  image: z.string().optional(),
}).refine(data => data.minAmount < data.maxAmount, {
  message: "Minimum amount must be less than maximum amount",
  path: ["minAmount"],
})

export const greenEnergyPlanUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  type: z.nativeEnum(GreenEnergyInvestmentType, {
    errorMap: () => ({ message: "Please select a valid investment type" }),
  }).optional(),
  minAmount: z.number().positive("Minimum amount must be positive").optional(),
  maxAmount: z.number().positive("Maximum amount must be positive").optional(),
  returnRate: z.number().positive("Return rate must be positive").optional(),
  durationMonths: z.number().int().positive("Duration must be positive").optional(),
  image: z.string().optional(),
})

// Types
export type EquipmentCreateInput = z.infer<typeof equipmentCreateSchema>
export type EquipmentUpdateInput = z.infer<typeof equipmentUpdateSchema>
export type EquipmentPurchaseInput = z.infer<typeof equipmentPurchaseSchema>
export type GreenEnergyInvestmentCreateInput = z.infer<typeof greenEnergyInvestmentCreateSchema>
export type GreenEnergyInvestmentUpdateInput = z.infer<typeof greenEnergyInvestmentUpdateSchema>
export type GreenEnergyPlanCreateInput = z.infer<typeof greenEnergyPlanCreateSchema>
export type GreenEnergyPlanUpdateInput = z.infer<typeof greenEnergyPlanUpdateSchema> 