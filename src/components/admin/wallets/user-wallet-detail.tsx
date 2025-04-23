"use client"

import { useState } from "react"
import { format } from "date-fns"
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle,
  Search,
  Plus,
  Minus,
  Eye,
  ShoppingCart
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { 
  approveDeposit, 
  rejectDeposit, 
  approveWithdrawal, 
  rejectWithdrawal,
  fundUserWallet,
  deductFromUserWallet
} from "@/lib/wallet/admin-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { TransactionDetailModal } from "./transaction-detail-modal"

interface UserWalletDetailProps {
  wallet: {
    wallet: {
      id: string;
      userId: string;
      balance: number;
      btcAddress?: string | null;
      usdtAddress?: string | null;
      user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
      };
      transactions: unknown[];
    };
    propertyTransactions: unknown[];
  }
}

export function UserWalletDetail({ wallet }: UserWalletDetailProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [fundAmount, setFundAmount] = useState("")
  const [fundReason, setFundReason] = useState("")
  const [deductAmount, setDeductAmount] = useState("")
  const [deductReason, setDeductReason] = useState("")
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  
  const transactions = wallet.wallet.transactions || []
  
  const filteredTransactions = transactions.filter((transaction: unknown) => {
    const matchesSearch = 
      searchQuery === "" || 
      transaction.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.txHash?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.cryptoType.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })
  
  async function handleApproveDeposit(transactionId: string) {
    setIsProcessing(true)
    try {
      const result = await approveDeposit(transactionId)
      if (result.success) {
        toast.success("Deposit approved", {
          description: "The deposit has been approved and the user's balance has been updated."
        })
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        toast.error("Error", {
          description: result.error
        })
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred."
      })
    } finally {
      setIsProcessing(false)
    }
  }
  
  async function handleRejectDeposit() {
    if (!selectedTransaction || !rejectReason) return
    
    setIsProcessing(true)
    try {
      const result = await rejectDeposit(selectedTransaction.id, rejectReason)
      if (result.success) {
        toast.success("Deposit rejected", {
          description: "The deposit has been rejected."
        })
        setIsRejecting(false)
        setRejectReason("")
        setSelectedTransaction(null)
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        toast.error("Error", {
          description: result.error
        })
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred."
      })
    } finally {
      setIsProcessing(false)
    }
  }
  
  async function handleApproveWithdrawal(transactionId: string) {
    setIsProcessing(true)
    try {
      const result = await approveWithdrawal(transactionId)
      if (result.success) {
        toast.success("Withdrawal approved", {
          description: "The withdrawal has been approved."
        })
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        toast.error("Error", {
          description: result.error
        })
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred."
      })
    } finally {
      setIsProcessing(false)
    }
  }
  
  async function handleRejectWithdrawal() {
    if (!selectedTransaction || !rejectReason) return
    
    setIsProcessing(true)
    try {
      const result = await rejectWithdrawal(selectedTransaction.id, rejectReason)
      if (result.success) {
        toast.success("Withdrawal rejected", {
          description: "The withdrawal has been rejected and the funds have been returned to the user's wallet."
        })
        setIsRejecting(false)
        setRejectReason("")
        setSelectedTransaction(null)
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        toast.error("Error", {
          description: result.error
        })
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred."
      })
    } finally {
      setIsProcessing(false)
    }
  }
  
  async function handleFundWallet() {
    if (!fundAmount || !fundReason) return
    
    const amount = parseFloat(fundAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount", {
        description: "Please enter a valid amount greater than 0."
      })
      return
    }
    
    setIsProcessing(true)
    try {
      const result = await fundUserWallet(wallet.wallet.userId, amount, fundReason)
      if (result.success) {
        toast.success("Wallet funded", {
          description: `Successfully added ${formatCurrency(amount)} to the user's wallet.`
        })
        setFundAmount("")
        setFundReason("")
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        toast.error("Error", {
          description: result.error
        })
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred."
      })
    } finally {
      setIsProcessing(false)
    }
  }
  
  async function handleDeductFromWallet() {
    if (!deductAmount || !deductReason) return
    
    const amount = parseFloat(deductAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount", {
        description: "Please enter a valid amount greater than 0."
      })
      return
    }
    
    setIsProcessing(true)
    try {
      const result = await deductFromUserWallet(wallet.wallet.userId, amount, deductReason)
      if (result.success) {
        toast.success("Amount deducted", {
          description: `Successfully deducted ${formatCurrency(amount)} from the user's wallet.`
        })
        setDeductAmount("")
        setDeductReason("")
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        toast.error("Error", {
          description: result.error
        })
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred."
      })
    } finally {
      setIsProcessing(false)
    }
  }
  
  function getStatusBadge(status: string) {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>
      case "PENDING":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>
      case "PROCESSING":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>
      case "FAILED":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>
      case "CANCELLED":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }
  
  function getTypeIcon(type: string) {
    switch (type) {
      case "DEPOSIT":
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />
      case "WITHDRAWAL":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />
      case "INVESTMENT":
        return <ArrowUpRight className="h-4 w-4 text-blue-500" />
      case "RETURN":
        return <ArrowDownLeft className="h-4 w-4 text-purple-500" />
      case "COMMISSION":
        return <ArrowDownLeft className="h-4 w-4 text-amber-500" />
      case "PURCHASE":
        return <ShoppingCart className="h-4 w-4 text-indigo-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }
  
  function handleViewTransaction(transaction: unknown) {
    setSelectedTransaction(transaction)
    setIsTransactionModalOpen(true)
  }
  
  function handleTransactionUpdated() {
    // Refresh the page to show updated data
    window.location.reload()
  }
  
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Balance
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(wallet.wallet.balance)}</div>
            <p className="text-xs text-muted-foreground">
              User ID: {wallet.wallet.userId}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              BTC Address
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-sm truncate">{wallet.wallet.btcAddress || "Not set"}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              USDT Address
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-sm truncate">{wallet.wallet.usdtAddress || "Not set"}</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="fund">Fund Wallet</TabsTrigger>
          <TabsTrigger value="deduct">Deduct Funds</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                View and manage all transactions for this wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search transactions..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No transactions found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTransactions.map((transaction: unknown) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-medium">
                              {format(new Date(transaction.createdAt), "MMM d, yyyy")}
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(transaction.createdAt), "h:mm a")}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getTypeIcon(transaction.type)}
                                <span>{transaction.type.charAt(0) + transaction.type.slice(1).toLowerCase()}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[200px] truncate">
                                {transaction.description || "-"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {transaction.cryptoType}
                              </div>
                            </TableCell>
                            <TableCell className={
                              transaction.type === "DEPOSIT" || transaction.type === "RETURN" || transaction.type === "COMMISSION"
                                ? "text-green-600"
                                : "text-red-600"
                            }>
                              {transaction.type === "DEPOSIT" || transaction.type === "RETURN" || transaction.type === "COMMISSION"
                                ? "+" + formatCurrency(transaction.amount)
                                : "-" + formatCurrency(transaction.amount)
                              }
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(transaction.status)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewTransaction(transaction)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="fund" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Fund User Wallet</CardTitle>
              <CardDescription>
                Add funds to the user's wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Amount (USD)
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Reason
                  </label>
                  <Textarea
                    placeholder="Enter reason for funding"
                    value={fundReason}
                    onChange={(e) => setFundReason(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleFundWallet} 
                disabled={isProcessing || !fundAmount || !fundReason}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Fund Wallet
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="deduct" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Deduct Funds</CardTitle>
              <CardDescription>
                Deduct funds from the user's wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Amount (USD)
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={deductAmount}
                    onChange={(e) => setDeductAmount(e.target.value)}
                    min="0"
                    step="0.01"
                    max={wallet.wallet.balance}
                  />
                  <p className="text-xs text-muted-foreground">
                    Available balance: {formatCurrency(wallet.wallet.balance)}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Reason
                  </label>
                  <Textarea
                    placeholder="Enter reason for deduction"
                    value={deductReason}
                    onChange={(e) => setDeductReason(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleDeductFromWallet} 
                disabled={isProcessing || !deductAmount || !deductReason}
                className="w-full"
                variant="destructive"
              >
                <Minus className="mr-2 h-4 w-4" />
                Deduct Funds
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        transaction={selectedTransaction}
        onTransactionUpdated={handleTransactionUpdated}
      />
      
      <Dialog open={isRejecting} onOpenChange={setIsRejecting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {selectedTransaction?.type === "DEPOSIT" ? "Deposit" : "Withdrawal"}</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this {selectedTransaction?.type === "DEPOSIT" ? "deposit" : "withdrawal"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Reason
              </label>
              <Textarea
                placeholder="Enter rejection reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsRejecting(false)
                setRejectReason("")
                setSelectedTransaction(null)
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (selectedTransaction?.type === "DEPOSIT") {
                  handleRejectDeposit()
                } else {
                  handleRejectWithdrawal()
                }
              }}
              disabled={isProcessing || !rejectReason}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 