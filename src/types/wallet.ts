import type { TransactionType, TransactionStatus } from "@prisma/client"

export interface Wallet {
  id: string
  userId: string
  balance: number
  btcAddress?: string | null
  usdtAddress?: string | null
  createdAt: Date
  updatedAt: Date
  transactions?: WalletTransaction[]
}

export interface WalletTransaction {
  id: string
  walletId: string
  type: TransactionType // Use TransactionType directly
  amount: number
  status: TransactionStatus // Use TransactionStatus directly
  cryptoType: string
  txHash?: string | null
  description?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface WalletDepositInput {
  amount: number
  cryptoType: string
  txHash: string
}

export interface WalletWithdrawalInput {
  amount: number
  cryptoType: string
  address: string
}

