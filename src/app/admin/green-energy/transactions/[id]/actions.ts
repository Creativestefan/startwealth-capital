'use server'

import { TransactionStatus } from "@prisma/client"
import { updateEquipmentTransactionStatus as updateStatus } from "@/lib/green-energy/actions/equipment"
import { revalidatePath } from "next/cache"

export async function acceptOrder(transactionId: string) {
  const result = await updateStatus(transactionId, TransactionStatus.ACCEPTED)
  revalidatePath(`/admin/green-energy/transactions/${transactionId}`)
  return result
}

export async function markAsProcessing(transactionId: string) {
  const result = await updateStatus(transactionId, TransactionStatus.PROCESSING)
  revalidatePath(`/admin/green-energy/transactions/${transactionId}`)
  return result
}

export async function markAsOutForDelivery(transactionId: string, trackingNumber?: string) {
  const result = await updateStatus(transactionId, TransactionStatus.OUT_FOR_DELIVERY, trackingNumber)
  revalidatePath(`/admin/green-energy/transactions/${transactionId}`)
  return result
}

export async function markAsCompleted(transactionId: string) {
  const result = await updateStatus(transactionId, TransactionStatus.COMPLETED)
  revalidatePath(`/admin/green-energy/transactions/${transactionId}`)
  return result
}

export async function cancelOrder(transactionId: string) {
  const result = await updateStatus(transactionId, TransactionStatus.CANCELLED)
  revalidatePath(`/admin/green-energy/transactions/${transactionId}`)
  return result
} 