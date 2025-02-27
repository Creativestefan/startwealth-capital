import type { KycStatus } from "@prisma/client"

export interface KycDocument {
  id: string
  userId: string
  status: KycStatus
  country: string
  documentType: string
  documentNumber?: string
  documentImage: string
  submittedAt: Date
  reviewedAt?: Date
  rejectionReason?: string
}

export interface KycFormData {
  country: string
  documentType: string
  documentNumber?: string
  documentImage: File
}

export type DocumentType = "PASSPORT" | "DRIVING_LICENSE" | "NATIONAL_ID"

