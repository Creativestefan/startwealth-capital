import type { WalletTransactionType, WalletTransactionStatus } from "@prisma/client"

export interface WalletTransaction {
  id: string
  walletId: string
  type: WalletTransactionType
  amount: number
  status: WalletTransactionStatus
  cryptoType: string
  txHash?: string
  createdAt: Date
  updatedAt: Date
}

export interface Wallet {
  id: string
  userId: string
  balance: number
  transactions: WalletTransaction[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateTransactionData {
  type: WalletTransactionType
  amount: number
  cryptoType: string
  txHash?: string
}

