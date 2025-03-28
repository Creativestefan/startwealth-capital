"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  FileText, 
  Search, 
  ArrowDown, 
  ArrowUp, 
  TrendingUp,
  Home,
  Leaf,
  BarChart
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Pagination } from "@/components/ui/pagination"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { useReceipt } from "@/providers/receipt-provider"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"

// Transaction types
interface Transaction {
  id: string
  type: string
  amount: number
  status: string
  timestamp: string
  description: string
  metadata?: any
  sourceType?: string
  sourceId?: string
}

interface FetchTransactionsResponse {
  activities: Transaction[]
  total: number
  pages: number
  page: number
  limit: number
}

// Fetch all transactions from API
async function fetchTransactions(page = 1, limit = 10, type?: string, search?: string): Promise<FetchTransactionsResponse> {
  let url = `/api/admin/transactions?page=${page}&limit=${limit}`
  if (type) url += `&type=${type}`
  if (search) url += `&search=${encodeURIComponent(search)}`
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Failed to fetch transactions")
  }
  return response.json()
}

// Fetch deposit/withdrawal transactions
async function fetchWalletTransactions(page = 1, limit = 10, type: string, search?: string): Promise<FetchTransactionsResponse> {
  let url = `/api/admin/wallet-transactions?page=${page}&limit=${limit}&type=${type}`
  if (search) url += `&search=${encodeURIComponent(search)}`
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${type} transactions`)
  }
  return response.json()
}

// Format date helper
function formatDate(dateString: string): string {
  return format(new Date(dateString), "MMM d, yyyy h:mm a")
}

export default function AllTransactionsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  
  // Pagination states
  const [allPage, setAllPage] = useState(1)
  const [purchasePage, setPurchasePage] = useState(1)
  const [investmentPage, setInvestmentPage] = useState(1)
  const [depositPage, setDepositPage] = useState(1)
  const [withdrawalPage, setWithdrawalPage] = useState(1)
  
  const { viewReceipt } = useReceipt()
  const router = useRouter()
  
  // Fetch all transactions
  const { 
    data: allTransactions,
    isLoading: allLoading,
    isError: allError
  } = useQuery({
    queryKey: ["allTransactions", allPage, searchQuery],
    queryFn: () => fetchTransactions(allPage, 10, undefined, searchQuery),
    enabled: activeTab === "all"
  })
  
  // Fetch purchase transactions
  const { 
    data: purchaseTransactions,
    isLoading: purchaseLoading,
    isError: purchaseError
  } = useQuery({
    queryKey: ["purchaseTransactions", purchasePage, searchQuery],
    queryFn: () => fetchTransactions(purchasePage, 10, "PURCHASE", searchQuery),
    enabled: activeTab === "purchase"
  })
  
  // Fetch investment transactions
  const { 
    data: investmentTransactions,
    isLoading: investmentLoading,
    isError: investmentError
  } = useQuery({
    queryKey: ["investmentTransactions", investmentPage, searchQuery],
    queryFn: () => fetchTransactions(investmentPage, 10, "INVESTMENT", searchQuery),
    enabled: activeTab === "investment"
  })
  
  // Fetch deposit transactions
  const { 
    data: depositTransactions,
    isLoading: depositLoading,
    isError: depositError
  } = useQuery({
    queryKey: ["depositTransactions", depositPage, searchQuery],
    queryFn: () => fetchWalletTransactions(depositPage, 10, "DEPOSIT", searchQuery),
    enabled: activeTab === "deposit"
  })
  
  // Fetch withdrawal transactions
  const { 
    data: withdrawalTransactions,
    isLoading: withdrawalLoading,
    isError: withdrawalError
  } = useQuery({
    queryKey: ["withdrawalTransactions", withdrawalPage, searchQuery],
    queryFn: () => fetchWalletTransactions(withdrawalPage, 10, "WITHDRAWAL", searchQuery),
    enabled: activeTab === "withdrawal"
  })
  
  // View transaction details
  const viewTransactionDetails = (tx: Transaction) => {
    // Based on transaction type, navigate to appropriate page
    let url = `/admin/transactions/all`
    
    if (tx.sourceType === 'property' || tx.type === 'PURCHASE') {
      url = `/admin/properties/transactions/${tx.id}`
    } else if (tx.sourceType === 'equipment' || tx.sourceType === 'green_energy') {
      url = `/admin/green-energy/transactions/${tx.id}`
    } else if (tx.sourceType === 'market') {
      url = `/admin/markets/transactions/${tx.id}`
    } else if (tx.type === 'DEPOSIT' || tx.type === 'WITHDRAWAL') {
      const userId = tx.metadata?.userId
      if (userId) {
        // For wallet transactions, navigate to user wallet details
        url = `/admin/users/wallets/${userId}`
      } else {
        // Fallback to transactions page
        url = `/admin/transactions/all?type=${tx.type.toLowerCase()}`
      }
    }
    
    router.push(url)
  }
  
  // Handle view receipt
  const handleViewReceipt = (transaction: Transaction) => {
    // Create receipt-ready transaction object
    const receiptTransaction = {
      id: transaction.id,
      type: transaction.type.toUpperCase(),
      amount: transaction.amount,
      status: transaction.status.toUpperCase(),
      createdAt: new Date(transaction.timestamp),
      description: transaction.description,
      cryptoType: transaction.metadata?.cryptoType || "USD",
      txHash: transaction.metadata?.txHash,
      
      // Property data
      property: transaction.metadata?.propertyName ? {
        name: transaction.metadata.propertyName,
        location: transaction.metadata.propertyLocation
      } : null,
      
      // Additional metadata for property transactions
      ...(transaction.sourceType === 'property' && {
        installments: transaction.metadata?.installments,
        totalAmount: transaction.amount
      }),
      
      // Additional metadata for equipment transactions
      ...(transaction.sourceType === 'equipment' && {
        equipmentName: transaction.metadata?.equipmentName,
        equipmentType: transaction.metadata?.equipmentType,
        quantity: transaction.metadata?.quantity,
        totalAmount: transaction.amount
      }),
      
      // Additional metadata for market transactions
      ...(transaction.sourceType === 'market' && {
        planName: transaction.metadata?.planName,
        expectedReturn: transaction.metadata?.expectedReturn,
        durationMonths: transaction.metadata?.durationMonths
      }),
      
      // User info
      user: {
        firstName: transaction.metadata?.firstName || transaction.metadata?.userName?.split(' ')[0] || '',
        lastName: transaction.metadata?.lastName || 
          (transaction.metadata?.userName?.split(' ').length > 1 
            ? transaction.metadata?.userName?.split(' ').slice(1).join(' ') 
            : '')
      }
    };
    
    // Get user name
    const userName = transaction.metadata?.userName || 
      `${transaction.metadata?.firstName || ''} ${transaction.metadata?.lastName || ''}`.trim() || 
      "User";
    
    // Call the viewReceipt function from the ReceiptProvider
    viewReceipt(receiptTransaction, userName);
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      completed: "bg-green-100 text-green-800 border-green-300",
      failed: "bg-red-100 text-red-800 border-red-300",
      processing: "bg-blue-100 text-blue-800 border-blue-300",
      cancelled: "bg-gray-100 text-gray-800 border-gray-300",
      active: "bg-blue-100 text-blue-800 border-blue-300",
      rejected: "bg-red-100 text-red-800 border-red-300",
      approved: "bg-green-100 text-green-800 border-green-300",
    }
    
    const statusClass = variants[status.toLowerCase()] || variants.pending
    
    return (
      <Badge variant="outline" className={`${statusClass} capitalize`}>
        {status.toLowerCase()}
      </Badge>
    )
  }
  
  // Get transaction icon
  const getTransactionIcon = (type: string, sourceType?: string) => {
    if (sourceType === 'property' || type === 'PURCHASE') {
      return <Home className="h-4 w-4 text-pink-500" />
    } else if (sourceType === 'equipment' || sourceType === 'green_energy') {
      return <Leaf className="h-4 w-4 text-emerald-500" />
    } else if (sourceType === 'market') {
      return <BarChart className="h-4 w-4 text-orange-500" />
    } else if (type === 'DEPOSIT') {
      return <ArrowDown className="h-4 w-4 text-green-500" />
    } else if (type === 'WITHDRAWAL') {
      return <ArrowUp className="h-4 w-4 text-red-500" />
    } else if (type === 'INVESTMENT') {
      return <TrendingUp className="h-4 w-4 text-blue-500" />
    }
    
    return <TrendingUp className="h-4 w-4" />
  }
  
  return (
    <div className="container py-8 max-w-7xl">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">All Transactions</h2>
        <p className="text-muted-foreground">
          View and manage all system transactions
        </p>
      </div>
      
      <Separator className="my-6" />
      
      {/* Search */}
      <div className="relative w-full max-w-sm mb-6">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>View all financial activities across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="purchase">Purchases</TabsTrigger>
              <TabsTrigger value="investment">Investments</TabsTrigger>
              <TabsTrigger value="deposit">Deposits</TabsTrigger>
              <TabsTrigger value="withdrawal">Withdrawals</TabsTrigger>
            </TabsList>
            
            {/* ALL TRANSACTIONS TAB */}
            <TabsContent value="all">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          Loading transactions...
                        </TableCell>
                      </TableRow>
                    ) : allError ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-red-500">
                          Error loading transactions
                        </TableCell>
                      </TableRow>
                    ) : allTransactions?.activities?.length ? (
                      allTransactions.activities.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTransactionIcon(tx.type, tx.sourceType)}
                              <span className="capitalize">{tx.type.toLowerCase()}</span>
                            </div>
                          </TableCell>
                          <TableCell>{tx.description}</TableCell>
                          <TableCell>{formatCurrency(tx.amount)}</TableCell>
                          <TableCell>{getStatusBadge(tx.status)}</TableCell>
                          <TableCell>{formatDate(tx.timestamp)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleViewReceipt(tx)}
                                title="View Receipt"
                              >
                                <FileText className="h-4 w-4" />
                                <span className="sr-only">View Receipt</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => viewTransactionDetails(tx)}
                              >
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {allTransactions?.pages && allTransactions.pages > 1 && (
                <div className="flex justify-center mt-4">
                  <Pagination
                    currentPage={allPage}
                    totalPages={allTransactions.pages}
                    onPageChange={setAllPage}
                  />
                </div>
              )}
            </TabsContent>
            
            {/* PURCHASE TRANSACTIONS TAB */}
            <TabsContent value="purchase">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          Loading purchase transactions...
                        </TableCell>
                      </TableRow>
                    ) : purchaseError ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-red-500">
                          Error loading purchase transactions
                        </TableCell>
                      </TableRow>
                    ) : purchaseTransactions?.activities?.length ? (
                      purchaseTransactions.activities.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Home className="h-4 w-4 text-pink-500" />
                              <span className="capitalize">Purchase</span>
                            </div>
                          </TableCell>
                          <TableCell>{tx.description}</TableCell>
                          <TableCell>{formatCurrency(tx.amount)}</TableCell>
                          <TableCell>{getStatusBadge(tx.status)}</TableCell>
                          <TableCell>{formatDate(tx.timestamp)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleViewReceipt(tx)}
                                title="View Receipt"
                              >
                                <FileText className="h-4 w-4" />
                                <span className="sr-only">View Receipt</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => viewTransactionDetails(tx)}
                              >
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No purchase transactions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {purchaseTransactions?.pages && purchaseTransactions.pages > 1 && (
                <div className="flex justify-center mt-4">
                  <Pagination
                    currentPage={purchasePage}
                    totalPages={purchaseTransactions.pages}
                    onPageChange={setPurchasePage}
                  />
                </div>
              )}
            </TabsContent>
            
            {/* INVESTMENT TRANSACTIONS TAB */}
            <TabsContent value="investment">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investmentLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          Loading investment transactions...
                        </TableCell>
                      </TableRow>
                    ) : investmentError ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-red-500">
                          Error loading investment transactions
                        </TableCell>
                      </TableRow>
                    ) : investmentTransactions?.activities?.length ? (
                      investmentTransactions.activities.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTransactionIcon(tx.type, tx.sourceType)}
                              <span className="capitalize">Investment</span>
                            </div>
                          </TableCell>
                          <TableCell>{tx.description}</TableCell>
                          <TableCell>{formatCurrency(tx.amount)}</TableCell>
                          <TableCell>{getStatusBadge(tx.status)}</TableCell>
                          <TableCell>{formatDate(tx.timestamp)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleViewReceipt(tx)}
                                title="View Receipt"
                              >
                                <FileText className="h-4 w-4" />
                                <span className="sr-only">View Receipt</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => viewTransactionDetails(tx)}
                              >
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No investment transactions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {investmentTransactions?.pages && investmentTransactions.pages > 1 && (
                <div className="flex justify-center mt-4">
                  <Pagination
                    currentPage={investmentPage}
                    totalPages={investmentTransactions.pages}
                    onPageChange={setInvestmentPage}
                  />
                </div>
              )}
            </TabsContent>
            
            {/* DEPOSIT TRANSACTIONS TAB */}
            <TabsContent value="deposit">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Amount</TableHead>
                      <TableHead>Crypto Type</TableHead>
                      <TableHead>Transaction Hash</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {depositLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          Loading deposit transactions...
                        </TableCell>
                      </TableRow>
                    ) : depositError ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-red-500">
                          Error loading deposit transactions
                        </TableCell>
                      </TableRow>
                    ) : depositTransactions?.activities?.length ? (
                      depositTransactions.activities.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <ArrowDown className="mr-2 h-4 w-4 text-green-500" />
                              {formatCurrency(tx.amount)}
                            </div>
                          </TableCell>
                          <TableCell>{tx.metadata?.cryptoType || "USDT"}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {tx.metadata?.txHash 
                              ? tx.metadata.txHash.length > 15 
                                ? (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="cursor-help">
                                          {`${tx.metadata.txHash.substring(0, 8)}...${tx.metadata.txHash.substring(tx.metadata.txHash.length - 6)}`}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-xs break-all font-mono">
                                        <p>{tx.metadata.txHash}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )
                                : tx.metadata.txHash
                              : tx.id.substring(0, 10)}
                          </TableCell>
                          <TableCell>{getStatusBadge(tx.status)}</TableCell>
                          <TableCell>{formatDate(tx.timestamp)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleViewReceipt(tx)}
                                title="View Receipt"
                              >
                                <FileText className="h-4 w-4" />
                                <span className="sr-only">View Receipt</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => viewTransactionDetails(tx)}
                              >
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No deposit transactions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {depositTransactions?.pages && depositTransactions.pages > 1 && (
                <div className="flex justify-center mt-4">
                  <Pagination
                    currentPage={depositPage}
                    totalPages={depositTransactions.pages}
                    onPageChange={setDepositPage}
                  />
                </div>
              )}
            </TabsContent>
            
            {/* WITHDRAWAL TRANSACTIONS TAB */}
            <TabsContent value="withdrawal">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Amount</TableHead>
                      <TableHead>Withdrawal Method</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawalLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          Loading withdrawal transactions...
                        </TableCell>
                      </TableRow>
                    ) : withdrawalError ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-red-500">
                          Error loading withdrawal transactions
                        </TableCell>
                      </TableRow>
                    ) : withdrawalTransactions?.activities?.length ? (
                      withdrawalTransactions.activities.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <ArrowUp className="mr-2 h-4 w-4 text-red-500" />
                              {formatCurrency(tx.amount)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {tx.metadata?.cryptoType ? (
                              <div>
                                <span>{tx.metadata.cryptoType}</span>
                                <span className="block text-xs text-muted-foreground">
                                  Crypto Withdrawal
                                </span>
                              </div>
                            ) : (
                              "Bank Transfer"
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {tx.metadata?.txHash 
                              ? tx.metadata.txHash.length > 15 
                                ? (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="cursor-help">
                                          {`${tx.metadata.txHash.substring(0, 8)}...${tx.metadata.txHash.substring(tx.metadata.txHash.length - 6)}`}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-xs break-all font-mono">
                                        <p>{tx.metadata.txHash}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )
                                : tx.metadata.txHash
                              : tx.id.substring(0, 10)}
                          </TableCell>
                          <TableCell>{getStatusBadge(tx.status)}</TableCell>
                          <TableCell>{formatDate(tx.timestamp)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleViewReceipt(tx)}
                                title="View Receipt"
                              >
                                <FileText className="h-4 w-4" />
                                <span className="sr-only">View Receipt</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => viewTransactionDetails(tx)}
                              >
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No withdrawal transactions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {withdrawalTransactions?.pages && withdrawalTransactions.pages > 1 && (
                <div className="flex justify-center mt-4">
                  <Pagination
                    currentPage={withdrawalPage}
                    totalPages={withdrawalTransactions.pages}
                    onPageChange={setWithdrawalPage}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 