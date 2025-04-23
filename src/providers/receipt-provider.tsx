"use client"

import React, { createContext, useContext, useState, useRef } from "react"
import { format } from "date-fns"
import { formatCurrency } from "@/lib/utils"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Printer, Download } from "lucide-react"
import { toast } from "sonner"

interface ReceiptProviderProps {
  children: React.ReactNode
}

interface ReceiptContextType {
  viewReceipt: (transaction: any, userName?: string) => void
  isReceiptModalOpen: boolean
}

const ReceiptContext = createContext<ReceiptContextType | undefined>(undefined)

export function ReceiptProvider({ children }: ReceiptProviderProps) {
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [userName, setUserName] = useState<string>("")
  const receiptRef = useRef<HTMLDivElement>(null)

  const generatePDF = async () => {
    if (!receiptRef.current) return;
    
    try {
      toast.loading("Generating PDF receipt...");
      
      // Use html2canvas to capture the receipt
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff"
      });
      
      // Convert to image data
      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // If content exceeds one page, add additional pages
      if (imgHeight > pdfHeight) {
        let remainingHeight = imgHeight;
        let currentPosition = -pdfHeight;
        
        while (remainingHeight > pdfHeight) {
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, currentPosition, imgWidth, imgHeight);
          remainingHeight -= pdfHeight;
          currentPosition -= pdfHeight;
        }
      }
      
      // Save the PDF
      const fileName = `transaction-receipt-${selectedTransaction?.id?.substring(0, 8) || 'download'}.pdf`;
      pdf.save(fileName);
      
      toast.dismiss();
      toast.success("Receipt downloaded successfully");
    } catch (error) {
      toast.dismiss();
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF receipt. Please try again.");
    }
  };

  const printReceipt = () => {
    if (!receiptRef.current) return;
    
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error("Unable to open print window. Please check your popup settings.");
        return;
      }
      
      // Get the content to print
      const receiptContent = receiptRef.current.innerHTML;
      
      // Create a complete HTML document
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Transaction Receipt</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; margin: 0; }
              .receipt-container { max-width: 800px; margin: 0 auto; }
              table { width: 100%; border-collapse: collapse; }
              td { padding: 8px; border-bottom: 1px solid #eee; }
              h1, h2, h3 { color: #1e3a8a; }
              .text-center { text-align: center; }
              .mt-8 { margin-top: 32px; }
              .pt-4 { padding-top: 16px; }
              .border-t { border-top: 1px solid #eee; }
              @media print {
                body { -webkit-print-color-adjust: exact; color-adjust: exact; }
                button { display: none !important; }
              }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              ${receiptContent}
            </div>
          </body>
        </html>
      `);
      
      // Important: wait for content to load before printing
      printWindow.document.close();
      
      printWindow.onload = function() {
        try {
          printWindow.focus();
          printWindow.print();
          // Don't close the window automatically to allow the user to interact with the print dialog
        } catch (error) {
          console.error("Error during printing:", error);
          toast.error("Error printing receipt");
        }
      };
    } catch (error) {
      console.error("Error preparing print window:", error);
      toast.error("Failed to prepare print window");
    }
  };

  const viewReceipt = (transaction: any, userName?: string) => {
    setSelectedTransaction(transaction);
    if (userName) {
      setUserName(userName);
    }
    setIsReceiptModalOpen(true);
  };

  return (
    <ReceiptContext.Provider value={{ viewReceipt, isReceiptModalOpen }}>
      {children}
      
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
                  <h1 className="text-xl font-bold text-blue-900">StratWealth Capital</h1>
                  <p className="text-sm text-gray-600">123 Finance Street, New York, NY 10001</p>
                  <div className="mt-4 text-sm text-gray-500">
                    <p>If you have any questions, please contact our support team at{" "}
                      <a
                        href="mailto:support@stratwealthcapital.com"
                        className="text-blue-500 hover:underline"
                      >
                        support@stratwealthcapital.com
                      </a>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-lg font-semibold text-blue-900">Transaction Receipt</h2>
                  <p className="text-sm text-gray-600">Receipt #: {selectedTransaction?.id.substring(0, 8)}</p>
                  <p className="text-sm text-gray-600">Date: {selectedTransaction ? format(new Date(selectedTransaction.createdAt || selectedTransaction.updatedAt || new Date()), "MMM d, yyyy") : ''}</p>
                </div>
              </div>
              
              {/* User Information */}
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-2 text-blue-900">User Information</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">User:</p>
                    <p className="text-sm font-medium">
                      {userName || (selectedTransaction?.user?.firstName && selectedTransaction?.user?.lastName ? 
                        `${selectedTransaction.user.firstName} ${selectedTransaction.user.lastName}` : 
                        "User")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Transaction Type:</p>
                    <p className="text-sm font-medium">
                      {selectedTransaction?.property ? "Property Purchase" : 
                       selectedTransaction?.type === "DEPOSIT" ? "Deposit" : 
                       selectedTransaction?.type === "WITHDRAWAL" ? "Withdrawal" : 
                       selectedTransaction?.type === "INVESTMENT" ? "Investment" : 
                       selectedTransaction?.type === "RETURN" ? "Return" : 
                       selectedTransaction?.type === "COMMISSION" ? "Commission" :
                       selectedTransaction?.type === "PURCHASE" ? "Purchase" : 
                       selectedTransaction?.type || "Transaction"}
                    </p>
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
                    {selectedTransaction?.property && (
                      <>
                        <tr className="border-b">
                          <td className="py-2 text-gray-600">Property:</td>
                          <td className="py-2 font-medium">{selectedTransaction.property.name}</td>
                        </tr>
                        {selectedTransaction.property.location && (
                          <tr className="border-b">
                            <td className="py-2 text-gray-600">Property Location:</td>
                            <td className="py-2 font-medium">{selectedTransaction.property.location}</td>
                          </tr>
                        )}
                      </>
                    )}
                    <tr className="border-b">
                      <td className="py-2 text-gray-600">Amount:</td>
                      <td className="py-2 font-medium">{selectedTransaction ? formatCurrency(selectedTransaction.amount || selectedTransaction.totalAmount) : ''}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 text-gray-600">Status:</td>
                      <td className="py-2 font-medium">{selectedTransaction?.status}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 text-gray-600">Date & Time:</td>
                      <td className="py-2 font-medium">{selectedTransaction ? format(new Date(selectedTransaction.createdAt || selectedTransaction.updatedAt || new Date()), "MMM d, yyyy h:mm a") : ''}</td>
                    </tr>
                    {selectedTransaction?.type && (
                      <tr className="border-b">
                        <td className="py-2 text-gray-600">Payment Type:</td>
                        <td className="py-2 font-medium">
                          {selectedTransaction.installments && selectedTransaction.installments > 1
                            ? `Installment (${selectedTransaction.installments} payments)`
                            : "Full Payment"}
                        </td>
                      </tr>
                    )}
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
                <p className="text-sm text-gray-600">Thank you for choosing StratWealth Capital.</p>
                <p className="text-xs text-gray-500 mt-1">This is an electronically generated receipt and does not require a signature.</p>
                <p className="text-xs text-gray-500 mt-1">© {new Date().getFullYear()} StratWealth Capital. All rights reserved.</p>
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
    </ReceiptContext.Provider>
  )
}

export function useReceipt() {
  const context = useContext(ReceiptContext)
  if (context === undefined) {
    throw new Error("useReceipt must be used within a ReceiptProvider")
  }
  return context
} 