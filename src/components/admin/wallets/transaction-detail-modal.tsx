"use client"

import { useState, useRef } from "react"
import { format } from "date-fns"
import { toast } from "sonner"
import { Loader2, Download, FileText, Printer } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { approveDeposit, rejectDeposit, approveWithdrawal, rejectWithdrawal } from "@/lib/wallet/admin-actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface TransactionDetailModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: unknown
  onTransactionUpdated: () => void
}

export function TransactionDetailModal({
  isOpen,
  onClose,
  transaction,
  onTransactionUpdated
}: TransactionDetailModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [isRejecting, setIsRejecting] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const receiptRef = useRef<HTMLDivElement>(null)
  
  if (!transaction) return null
  
  const isPending = transaction.status === "PENDING"
  const isDeposit = transaction.type === "DEPOSIT"
  const isWithdrawal = transaction.type === "WITHDRAWAL"
  const isPurchase = transaction.type === "PURCHASE"
  
  function getStatusBadge(status: string) {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case "PROCESSING":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Processing</Badge>
      case "FAILED":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>
      case "CANCELLED":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }
  
  async function handleApprove() {
    setIsProcessing(true)
    try {
      let result
      
      if (isDeposit) {
        result = await approveDeposit(transaction.id)
      } else if (isWithdrawal) {
        result = await approveWithdrawal(transaction.id)
      } else {
        toast.error("Invalid transaction type")
        return
      }
      
      if (result.success) {
        toast.success(`${isDeposit ? 'Deposit' : 'Withdrawal'} approved`, {
          description: `The ${isDeposit ? 'deposit' : 'withdrawal'} has been approved.`
        })
        onTransactionUpdated()
        onClose()
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
  
  async function handleReject() {
    if (!rejectReason) return
    
    setIsProcessing(true)
    try {
      let result
      
      if (isDeposit) {
        result = await rejectDeposit(transaction.id, rejectReason)
      } else if (isWithdrawal) {
        result = await rejectWithdrawal(transaction.id, rejectReason)
      } else {
        toast.error("Invalid transaction type")
        return
      }
      
      if (result.success) {
        toast.success(`${isDeposit ? 'Deposit' : 'Withdrawal'} rejected`, {
          description: `The ${isDeposit ? 'deposit' : 'withdrawal'} has been rejected.`
        })
        onTransactionUpdated()
        onClose()
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
      setIsRejecting(false)
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
      pdf.save(`transaction-receipt-${transaction.id}.pdf`);
      
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
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            View detailed information about this transaction.
          </DialogDescription>
        </DialogHeader>
        
        {!showReceipt ? (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Type</p>
                  <p className="text-sm font-medium">
                    {transaction.type === "DEPOSIT" ? "Deposit" : 
                     transaction.type === "WITHDRAWAL" ? "Withdrawal" : 
                     transaction.type === "INVESTMENT" ? "Investment" : 
                     transaction.type === "RETURN" ? "Return" : 
                     transaction.type === "COMMISSION" ? "Commission" :
                     transaction.type === "PURCHASE" ? "Purchase" : 
                     transaction.type}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(transaction.status)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p className="text-sm font-medium">{formatCurrency(transaction.amount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-sm font-medium">{format(new Date(transaction.createdAt), "MMM d, yyyy h:mm a")}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="text-sm">{transaction.description || "No description"}</p>
              </div>
              
              {transaction.cryptoType && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Cryptocurrency</p>
                  <p className="text-sm font-medium">{transaction.cryptoType}</p>
                </div>
              )}
              
              {transaction.txHash && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Transaction Hash</p>
                  <p className="text-sm font-mono break-all">{transaction.txHash}</p>
                </div>
              )}
              
              {transaction.status === "COMPLETED" && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowReceipt(true)}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    View Receipt
                  </Button>
                </div>
              )}
              
              {isPending && (isDeposit || isWithdrawal) && (
                <>
                  <Separator className="my-2" />
                  
                  {!isRejecting ? (
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsRejecting(true)}
                        disabled={isProcessing}
                      >
                        Reject
                      </Button>
                      <Button
                        onClick={handleApprove}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing
                          </>
                        ) : (
                          `Approve ${isDeposit ? 'Deposit' : 'Withdrawal'}`
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Rejection Reason</p>
                        <Textarea
                          placeholder="Enter reason for rejection"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsRejecting(false)}
                          disabled={isProcessing}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleReject}
                          disabled={isProcessing || !rejectReason}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing
                            </>
                          ) : (
                            "Confirm Rejection"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="py-4">
              <div 
                ref={receiptRef} 
                className="bg-white p-6 border rounded-lg shadow-sm max-h-[500px] overflow-y-auto"
              >
                {/* Company Header */}
                <div className="flex items-center justify-between mb-6 border-b pb-4">
                  <div>
                    <h1 className="text-xl font-bold text-blue-900">StratWealth Capital</h1>
                    <p className="text-sm text-gray-600">123 Finance Street, New York, NY 10001</p>
                    <p className="text-sm text-gray-600">support@stratwealthcapital.com</p>
                    <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-lg font-semibold text-blue-900">Transaction Receipt</h2>
                    <p className="text-sm text-gray-600">Receipt #: {transaction.id.substring(0, 8)}</p>
                    <p className="text-sm text-gray-600">Date: {format(new Date(transaction.createdAt), "MMM d, yyyy")}</p>
                  </div>
                </div>
                
                {/* User Information */}
                <div className="mb-6">
                  <h3 className="text-md font-semibold mb-2 text-blue-900">User Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-600">User:</p>
                      <p className="text-sm font-medium">
                        {(transaction.wallet?.user?.firstName || transaction.walletUser?.firstName || "") + " " + 
                         (transaction.wallet?.user?.lastName || transaction.walletUser?.lastName || "")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Wallet ID:</p>
                      <p className="text-sm font-medium">{transaction.walletId}</p>
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
                        <td className="py-2 font-medium">{transaction.id}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-gray-600">Type:</td>
                        <td className="py-2 font-medium">
                          {transaction.type === "DEPOSIT" ? "Deposit" : 
                           transaction.type === "WITHDRAWAL" ? "Withdrawal" : 
                           transaction.type === "INVESTMENT" ? "Investment" : 
                           transaction.type === "RETURN" ? "Return" : 
                           transaction.type === "COMMISSION" ? "Commission" :
                           transaction.type === "PURCHASE" ? "Purchase" : 
                           transaction.type}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-gray-600">Amount:</td>
                        <td className="py-2 font-medium">{formatCurrency(transaction.amount)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-gray-600">Status:</td>
                        <td className="py-2 font-medium">{transaction.status}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-gray-600">Date & Time:</td>
                        <td className="py-2 font-medium">{format(new Date(transaction.createdAt), "MMM d, yyyy h:mm a")}</td>
                      </tr>
                      {transaction.cryptoType && (
                        <tr className="border-b">
                          <td className="py-2 text-gray-600">Cryptocurrency:</td>
                          <td className="py-2 font-medium">{transaction.cryptoType}</td>
                        </tr>
                      )}
                      {transaction.description && (
                        <tr className="border-b">
                          <td className="py-2 text-gray-600">Description:</td>
                          <td className="py-2 font-medium">{transaction.description}</td>
                        </tr>
                      )}
                      {transaction.txHash && (
                        <tr className="border-b">
                          <td className="py-2 text-gray-600">Transaction Hash:</td>
                          <td className="py-2 font-medium break-all">{transaction.txHash}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Footer */}
                <div className="mt-8 pt-4 border-t text-center">
                  <p className="text-sm text-gray-600">Thank you for choosing StratWealth Capital</p>
                  <p className="text-xs text-gray-500 mt-1">
                    For assistance, contact our support team at{" "}
                    <a
                      href="mailto:support@stratwealthcapital.com"
                      className="text-blue-500 hover:underline"
                    >
                      support@stratwealthcapital.com
                    </a>
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowReceipt(false)}
                >
                  Back to Details
                </Button>
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
          </>
        )}
      </DialogContent>
    </Dialog>
  )
} 