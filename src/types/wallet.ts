export interface Transaction {
    id: string
    walletId: string
    type: "DEPOSIT" | "WITHDRAWAL"
    amount: number
    status: "PENDING" | "COMPLETED" | "FAILED"
    cryptoType: "BTC" | "USDT"
    txHash?: string
    createdAt: Date
    updatedAt: Date
  }
  
  export interface Wallet {
    id: string
    userId: string
    balance: number
    transactions: Transaction[]
    createdAt: Date
    updatedAt: Date
  }
  
  export interface CreateTransactionData {
    type: Transaction["type"]
    amount: number
    cryptoType: Transaction["cryptoType"]
    txHash?: string
  }
  
  