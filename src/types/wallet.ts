import type { TransactionType, TransactionStatus } from "@prisma/client"

/**
 * Wallet interface representing a user's wallet
 */
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

/**
 * Wallet transaction interface
 */
export interface WalletTransaction {
  id: string
  walletId: string
  type: TransactionType | "PURCHASE" // Allow PURCHASE type for display purposes
  amount: number
  status: TransactionStatus // Use TransactionStatus directly
  cryptoType: string
  txHash?: string | null
  description?: string | null
  createdAt: Date
  updatedAt: Date
  _propertyData?: any // Optional property to store related property transaction data
}

/**
 * Input for creating a deposit request
 */
export interface WalletDepositInput {
  amount: number
  cryptoType: string
  txHash: string
}

/**
 * Input for creating a withdrawal request
 * Withdrawals are internal transfers to the user's investment accounts
 */
export interface WalletWithdrawalInput {
  amount: number
  cryptoType: string
  address: string
}

/**
 * Input for creating a payout request
 * Payouts are external transfers to the user's personal crypto wallets
 */
export interface WalletPayoutInput {
  amount: number
  cryptoType: string
  address: string
  reason?: string
}

