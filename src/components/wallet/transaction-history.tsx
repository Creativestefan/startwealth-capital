"use client"

import * as React from "react"
import { useState, useRef } from "react"
import { format } from "date-fns"
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle,
  Search,
  ChevronDown,
  ShoppingCart,
  FileText,
  Download,
  Eye,
  Printer
} from "lucide-react"
import { Wallet, WalletTransaction } from "@/types/wallet"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TransactionStatus } from "@prisma/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface PropertyTransaction {
  id: string
  propertyId: string
  userId: string
  amount: number
  type: "FULL" | "INSTALLMENT"
  status: string
  installments?: number | null
  installmentAmount?: number | null
  nextPaymentDue?: Date | null
  paidInstallments: number
  createdAt: Date | string
  updatedAt: Date | string
  property?: {
    id: string
    name: string
    price: number
  }
}

interface TransactionHistoryProps {
  wallet: Wallet
  propertyTransactions?: PropertyTransaction[]
}

export function TransactionHistory({ wallet, propertyTransactions = [] }: TransactionHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
  const receiptRef = useRef<HTMLDivElement>(null)
  
  // Get user name from session storage or local storage if available
  const [userName, setUserName] = useState<string>("")
  const [userFirstName, setUserFirstName] = useState<string>("")
  const [userLastName, setUserLastName] = useState<string>("")
  
  React.useEffect(() => {
    // Fetch user data from the database using the wallet's userId
    const fetchUserData = async () => {
      if (wallet.userId) {
        try {
          const response = await fetch(`/api/users/${wallet.userId}`);
          if (response.ok) {
            const userData = await response.json();
            if (userData.user) {
              setUserFirstName(userData.user.firstName || "");
              setUserLastName(userData.user.lastName || "");
              setUserName(`${userData.user.firstName || ""} ${userData.user.lastName || ""}`.trim());
            }
          } else {
            console.error("Failed to fetch user data");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    
    fetchUserData();
  }, [wallet.userId])
  
  // Use real transactions from the wallet
  const walletTransactions = wallet.transactions || []
  
  // Convert property transactions to a format compatible with wallet transactions
  const convertedPropertyTransactions: WalletTransaction[] = propertyTransactions.map(pt => ({
    id: pt.id,
    walletId: wallet.id,
    type: "PURCHASE", // New transaction type for property purchases
    amount: Number(pt.amount),
    status: pt.status as TransactionStatus, // Cast the status to TransactionStatus
    cryptoType: "USDT",
    txHash: null,
    createdAt: new Date(pt.createdAt),
    updatedAt: new Date(pt.updatedAt),
    description: pt.property ? `Purchase of ${pt.property.name}` : `Property purchase (${pt.type})`,
    _propertyData: pt // Keep the original property data for reference
  }))
  
  // Combine wallet transactions with converted property transactions
  const allTransactions = [...walletTransactions, ...convertedPropertyTransactions]
  
  // Get pending transactions count
  const pendingTransactionsCount = allTransactions.filter(
    transaction => transaction.status === "PENDING"
  ).length
  
  const filteredTransactions = allTransactions.filter((transaction) => {
    // Apply search filter
    const matchesSearch = 
      searchQuery === "" || 
      transaction.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.txHash?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.cryptoType.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Apply status filter
    const matchesStatus = 
      statusFilter.length === 0 || 
      statusFilter.includes(transaction.status)
    
    // Apply type filter
    const matchesType = 
      typeFilter === "ALL" || 
      transaction.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })
  
  function getStatusIcon(status: string) {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "PENDING":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "PROCESSING":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "CANCELLED":
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
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
      case "PAYOUT":
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

  const generatePDF = async () => {
    if (!receiptRef.current) return;
    
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`transaction-receipt-${selectedTransaction.id}.pdf`);
      
      toast.success("Receipt downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF receipt");
    }
  };

  const printReceipt = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Unable to open print window. Please check your popup settings.");
      return;
    }
    
    const receiptContent = receiptRef.current?.innerHTML || '';
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Transaction Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .receipt-container { max-width: 800px; margin: 0 auto; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 8px; border-bottom: 1px solid #eee; }
            h1, h2, h3 { color: #1e3a8a; }
            .text-center { text-align: center; }
            .mt-8 { margin-top: 32px; }
            .pt-4 { padding-top: 16px; }
            .border-t { border-top: 1px solid #eee; }
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            ${receiptContent}
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const viewReceipt = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsReceiptModalOpen(true);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            View all your wallet transactions
            {pendingTransactionsCount > 0 && (
              <span className="ml-1 text-amber-600 font-medium">
                (You have {pendingTransactionsCount} pending transaction{pendingTransactionsCount !== 1 ? 's' : ''})
              </span>
            )}
          </CardDescription>
          {pendingTransactionsCount > 0 && (
            <p className="text-sm text-amber-600 mt-1">
              Pending transactions will be processed by an admin. This typically takes 1-24 hours.
            </p>
          )}
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
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="sm:w-[150px] justify-between">
                    Status
                    <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuCheckboxItem
                    checked={statusFilter.includes("COMPLETED")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setStatusFilter([...statusFilter, "COMPLETED"])
                      } else {
                        setStatusFilter(statusFilter.filter(s => s !== "COMPLETED"))
                      }
                    }}
                  >
                    Completed
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={statusFilter.includes("PENDING")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setStatusFilter([...statusFilter, "PENDING"])
                      } else {
                        setStatusFilter(statusFilter.filter(s => s !== "PENDING"))
                      }
                    }}
                  >
                    Pending
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={statusFilter.includes("PROCESSING")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setStatusFilter([...statusFilter, "PROCESSING"])
                      } else {
                        setStatusFilter(statusFilter.filter(s => s !== "PROCESSING"))
                      }
                    }}
                  >
                    Processing
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={statusFilter.includes("FAILED")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setStatusFilter([...statusFilter, "FAILED"])
                      } else {
                        setStatusFilter(statusFilter.filter(s => s !== "FAILED"))
                      }
                    }}
                  >
                    Failed
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={statusFilter.includes("CANCELLED")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setStatusFilter([...statusFilter, "CANCELLED"])
                      } else {
                        setStatusFilter(statusFilter.filter(s => s !== "CANCELLED"))
                      }
                    }}
                  >
                    Cancelled
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Select
                value={typeFilter}
                onValueChange={setTypeFilter}
              >
                <SelectTrigger className="sm:w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="DEPOSIT">Deposits</SelectItem>
                  <SelectItem value="WITHDRAWAL">Withdrawals</SelectItem>
                  <SelectItem value="INVESTMENT">Investments</SelectItem>
                  <SelectItem value="RETURN">Returns</SelectItem>
                  <SelectItem value="COMMISSION">Commissions</SelectItem>
                  <SelectItem value="PURCHASE">Purchases</SelectItem>
                </SelectContent>
              </Select>
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
                    <TableHead className="hidden md:table-cell">Transaction ID</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <TableRow 
                        key={transaction.id} 
                        className={transaction.status === "PENDING" ? "bg-amber-50 border-l-4 border-l-amber-400" : ""}
                      >
                        <TableCell className="font-medium">
                          {format(new Date(transaction.createdAt), "MMM d, yyyy")}
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(transaction.createdAt), "h:mm a")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(transaction.type)}
                            <span>
                              {transaction.type === "PURCHASE" 
                                ? "Purchase" 
                                : transaction.type.charAt(0) + transaction.type.slice(1).toLowerCase()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate">
                            {transaction.description || "-"}
                          </div>
                          {transaction.cryptoType && (
                            <div className="text-xs text-muted-foreground">
                              {transaction.cryptoType}
                            </div>
                          )}
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
                            {getStatusIcon(transaction.status)}
                            {getStatusBadge(transaction.status)}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell font-mono text-xs">
                          {transaction.txHash ? (
                            <div className="max-w-[150px] truncate">
                              {transaction.txHash}
                            </div>
                          ) : (
                            transaction.type === "PURCHASE" ? 
                            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">Property Transaction</Badge> :
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {transaction.status === "COMPLETED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewReceipt(transaction)}
                              className="h-8 w-8 p-0"
                            >
                              <span className="sr-only">View receipt</span>
                              <FileText className="h-4 w-4" />
                            </Button>
                          )}
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

      {/* Transaction Receipt Modal */}
      <Dialog open={isReceiptModalOpen} onOpenChange={setIsReceiptModalOpen}>
        <DialogContent className="max-w-md sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Receipt</DialogTitle>
            <DialogDescription>
              View and download your transaction receipt
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div 
              ref={receiptRef} 
              className="bg-white p-6 border rounded-lg shadow-sm max-h-[500px] overflow-y-auto"
            >
              {/* Company Header */}
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <div>
                  <h1 className="text-xl font-bold text-blue-900">StartWealth Capital</h1>
                  <p className="text-sm text-gray-600">123 Finance Street, New York, NY 10001</p>
                  <p className="text-sm text-gray-600">support@startwealthcapital.com</p>
                  <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                </div>
                <div className="text-right">
                  <h2 className="text-lg font-semibold text-blue-900">Transaction Receipt</h2>
                  <p className="text-sm text-gray-600">Receipt #: {selectedTransaction?.id.substring(0, 8)}</p>
                  <p className="text-sm text-gray-600">Date: {selectedTransaction ? format(new Date(selectedTransaction.createdAt), "MMM d, yyyy") : ''}</p>
                </div>
              </div>
              
              {/* User Information */}
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-2 text-blue-900">User Information</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">User:</p>
                    <p className="text-sm font-medium">
                      {userFirstName || ""} {userLastName || ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Wallet ID:</p>
                    <p className="text-sm font-medium">{wallet.id}</p>
                  </div>
                </div>
              </div>
              
              {/* Transaction Details */}
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-2 text-blue-900">Transaction Details</h3>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 text-gray-600">Transaction ID:</td>
                      <td className="py-2 font-medium">{selectedTransaction?.id}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 text-gray-600">Type:</td>
                      <td className="py-2 font-medium">
                        {selectedTransaction?.type === "DEPOSIT" ? "Deposit" : 
                         selectedTransaction?.type === "WITHDRAWAL" ? "Withdrawal" : 
                         selectedTransaction?.type === "INVESTMENT" ? "Investment" : 
                         selectedTransaction?.type === "RETURN" ? "Return" : 
                         selectedTransaction?.type === "COMMISSION" ? "Commission" :
                         selectedTransaction?.type === "PURCHASE" ? "Purchase" : 
                         selectedTransaction?.type}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 text-gray-600">Amount:</td>
                      <td className="py-2 font-medium">{selectedTransaction ? formatCurrency(selectedTransaction.amount) : ''}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 text-gray-600">Status:</td>
                      <td className="py-2 font-medium">{selectedTransaction?.status}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 text-gray-600">Date & Time:</td>
                      <td className="py-2 font-medium">{selectedTransaction ? format(new Date(selectedTransaction.createdAt), "MMM d, yyyy h:mm a") : ''}</td>
                    </tr>
                    {selectedTransaction?.cryptoType && (
                      <tr className="border-b">
                        <td className="py-2 text-gray-600">Cryptocurrency:</td>
                        <td className="py-2 font-medium">{selectedTransaction.cryptoType}</td>
                      </tr>
                    )}
                    {selectedTransaction?.description && (
                      <tr className="border-b">
                        <td className="py-2 text-gray-600">Description:</td>
                        <td className="py-2 font-medium">{selectedTransaction.description}</td>
                      </tr>
                    )}
                    {selectedTransaction?.txHash && (
                      <tr className="border-b">
                        <td className="py-2 text-gray-600">Transaction Hash:</td>
                        <td className="py-2 font-medium break-all">{selectedTransaction.txHash}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Footer */}
              <div className="mt-8 pt-4 border-t text-center">
                <p className="text-sm text-gray-600">Thank you for choosing StartWealth Capital</p>
                <p className="text-xs text-gray-500 mt-1">This is an electronically generated receipt and does not require a signature.</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                onClick={printReceipt}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button
                onClick={generatePDF}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 