import { getServerSession } from "next-auth"
import { notFound, redirect } from "next/navigation"
import { authConfig } from "@/lib/auth.config"
import { getEquipmentTransactionById, updateEquipmentTransactionStatus, updateEquipmentTransactionDeliveryPin } from "@/lib/green-energy/actions/equipment"
import { formatCurrency, formatDate } from "@/lib/green-energy/utils/formatting"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, Package, MapPin, Calendar, Clock, KeyIcon, CheckCircle, AlertCircle, Clock3 } from "lucide-react"
import Link from "next/link"
import { TransactionStatus } from "@prisma/client"
import { ImageCarousel } from "@/components/ui/image-carousel"
import { Badge } from "@/components/ui/badge"

interface EquipmentTransactionDetailPageProps {
  params: {
    id: string
  }
}

// Function to generate a random 6-character alphanumeric PIN in all capital letters
function generateDeliveryPIN(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export default async function EquipmentTransactionDetailPage({ params }: EquipmentTransactionDetailPageProps) {
  // Await the params object before accessing its properties
  const { id } = await params;
  
  const session = await getServerSession(authConfig)

  if (!session || !session.user) {
    redirect("/login")
  }

  // Ensure email is verified
  if (!session.user.emailVerified) {
    redirect(`/verify-email?email=${session.user.email}`)
  }

  // Check KYC status
  if (!session.user.kycStatus || session.user.kycStatus === "PENDING") {
    redirect("/dashboard?kyc=required")
  }

  // Get transaction details
  const result = await getEquipmentTransactionById(id)
  
  if (!result.success || !result.data) {
    notFound()
  }
  
  let transaction = result.data
  
  // Ensure equipment data exists
  if (!transaction.equipment) {
    notFound()
  }

  // Generate a delivery PIN if one doesn't exist and the order is accepted or beyond
  if (!transaction.deliveryPin && 
      ["ACCEPTED", "PROCESSING", "OUT_FOR_DELIVERY"].includes(transaction.status)) {
    const deliveryPin = generateDeliveryPIN();
    
    // Update the transaction with the new delivery PIN
    try {
      const updateResult = await updateEquipmentTransactionDeliveryPin(id, deliveryPin);
      
      if (updateResult.success && updateResult.data) {
        transaction = updateResult.data;
      } else {
        // Fallback: manually set the PIN in the transaction object if the update fails
        console.error("Failed to update delivery PIN in database");
        transaction.deliveryPin = deliveryPin;
      }
    } catch (error) {
      console.error("Failed to update delivery PIN:", error);
      // Fallback: manually set the PIN
      transaction.deliveryPin = deliveryPin;
    }
  }

  // Generate mock status updates based on the current status
  const statusUpdates = generateStatusUpdates(transaction);
  
  // Safely access equipment properties
  const equipmentName = transaction.equipment?.name || "Equipment";
  const equipmentImages = transaction.equipment?.images || [];
  const equipmentDescription = transaction.equipment?.description || "";
  const equipmentFeatures = transaction.equipment?.features || [];
  
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/green-energy/portfolio">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to My Equipment
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Equipment Images */}
        <Card>
          <CardContent className="p-0 overflow-hidden rounded-lg">
            {equipmentImages && Array.isArray(equipmentImages) && equipmentImages.length > 0 ? (
              <ImageCarousel 
                images={equipmentImages} 
                alt={equipmentName} 
              />
            ) : (
              <div className="aspect-video bg-muted flex items-center justify-center">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Equipment Details */}
        <Card>
          <CardHeader>
            <CardTitle>{equipmentName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Purchase Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Purchase Date:</div>
                <div>{formatDate(transaction.createdAt)}</div>
                
                <div className="text-muted-foreground">Amount Paid:</div>
                <div>{formatCurrency(transaction.totalAmount)}</div>
                
                <div className="text-muted-foreground">Quantity:</div>
                <div>{transaction.quantity} {transaction.quantity > 1 ? "units" : "unit"}</div>
                
                <div className="text-muted-foreground">Status:</div>
                <div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    transaction.status === TransactionStatus.PENDING 
                      ? "bg-amber-100 text-amber-800" 
                      : transaction.status === TransactionStatus.COMPLETED
                      ? "bg-green-100 text-green-800"
                      : transaction.status === TransactionStatus.PROCESSING
                      ? "bg-blue-100 text-blue-800"
                      : transaction.status === TransactionStatus.ACCEPTED
                      ? "bg-indigo-100 text-indigo-800"
                      : transaction.status === TransactionStatus.OUT_FOR_DELIVERY
                      ? "bg-purple-100 text-purple-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {formatStatus(transaction.status)}
                  </span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Delivery PIN (Highlighted) - Show for accepted, processing, and out for delivery statuses */}
            {transaction.deliveryPin && 
             ["ACCEPTED", "PROCESSING", "OUT_FOR_DELIVERY", "COMPLETED"].includes(transaction.status) && (
              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <div className="flex items-start gap-3">
                  <KeyIcon className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-primary">Delivery PIN</div>
                    <div className="text-xl font-mono font-bold text-primary tracking-wider mt-1">{transaction.deliveryPin}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Share this PIN with the delivery person to confirm your delivery
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div>
            
              <div className="space-y-2">
                {transaction.deliveryDate && (
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">
                        {transaction.status === TransactionStatus.COMPLETED ? "Delivered On" : "Expected Delivery"}
                      </div>
                      <div className="text-sm text-muted-foreground">{formatDate(transaction.deliveryDate)}</div>
                    </div>
                  </div>
                )}
                
                {transaction.deliveryAddress && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Delivery Address</div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.deliveryAddress.street}, {transaction.deliveryAddress.city}<br />
                        {transaction.deliveryAddress.state}, {transaction.deliveryAddress.postalCode}<br />
                        {transaction.deliveryAddress.country}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-1">Equipment Specifications</h3>
              <p className="text-sm text-muted-foreground mb-2">{equipmentDescription}</p>
              
              {equipmentFeatures && Array.isArray(equipmentFeatures) && equipmentFeatures.length > 0 && (
                <div className="mt-2">
                  <div className="text-sm font-medium mb-1">Features</div>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {equipmentFeatures.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Order Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Order Timeline</CardTitle>
          <CardDescription>Track the progress of your order</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <ol className="relative border-l border-gray-200">
              {statusUpdates.map((update, index) => (
                <li key={index} className="mb-6 ml-6">
                  <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ring-white ${
                    update.completed 
                      ? "bg-green-100" 
                      : update.current 
                      ? "bg-blue-100" 
                      : "bg-gray-100"
                  }`}>
                    {update.completed ? (
                      <CheckCircle className="w-3.5 h-3.5 text-green-800" />
                    ) : update.current ? (
                      <Clock3 className="w-3.5 h-3.5 text-blue-800" />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-gray-300" />
                    )}
                  </span>
                  <div className={`${update.completed || update.current ? "" : "opacity-50"}`}>
                    <h3 className="flex items-center text-sm font-semibold">
                      {update.status}
                      {update.current && (
                        <Badge variant="outline" className="ml-2 text-xs">Current</Badge>
                      )}
                    </h3>
                    <time className="block text-xs font-normal text-gray-500">
                      {update.date ? formatDate(update.date) : "Pending"}
                    </time>
                    <p className="text-sm font-normal text-gray-500 mt-1">
                      {update.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function to format status for display
function formatStatus(status: TransactionStatus): string {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

// Helper function to generate status updates based on current transaction status
function generateStatusUpdates(transaction: any) {
  const statuses = [
    {
      status: "Order Placed",
      description: "Your order has been received and is being processed.",
      completed: true,
      current: transaction.status === TransactionStatus.PENDING,
      date: transaction.createdAt
    },
    {
      status: "Order Confirmed",
      description: "Your payment has been confirmed and your order is being prepared.",
      completed: ["ACCEPTED", "PROCESSING", "OUT_FOR_DELIVERY", "COMPLETED"].includes(transaction.status),
      current: transaction.status === TransactionStatus.ACCEPTED,
      date: ["ACCEPTED", "PROCESSING", "OUT_FOR_DELIVERY", "COMPLETED"].includes(transaction.status) 
        ? new Date(new Date(transaction.createdAt).getTime() + 1 * 24 * 60 * 60 * 1000) 
        : null
    },
    {
      status: "Processing",
      description: "Your order is being processed and prepared for shipping.",
      completed: ["PROCESSING", "OUT_FOR_DELIVERY", "COMPLETED"].includes(transaction.status),
      current: transaction.status === TransactionStatus.PROCESSING,
      date: ["PROCESSING", "OUT_FOR_DELIVERY", "COMPLETED"].includes(transaction.status) 
        ? new Date(new Date(transaction.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000) 
        : null
    },
    {
      status: "Out for Delivery",
      description: "Your order has been shipped and is out for delivery.",
      completed: ["OUT_FOR_DELIVERY", "COMPLETED"].includes(transaction.status),
      current: transaction.status === TransactionStatus.OUT_FOR_DELIVERY,
      date: ["OUT_FOR_DELIVERY", "COMPLETED"].includes(transaction.status) 
        ? new Date(new Date(transaction.createdAt).getTime() + 5 * 24 * 60 * 60 * 1000) 
        : null
    },
    {
      status: "Delivered",
      description: "Your order has been delivered successfully.",
      completed: transaction.status === TransactionStatus.COMPLETED,
      current: transaction.status === TransactionStatus.COMPLETED,
      date: transaction.status === TransactionStatus.COMPLETED 
        ? transaction.deliveryDate || new Date(new Date(transaction.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000)
        : null
    }
  ];

  // Handle cancelled orders
  if (transaction.status === TransactionStatus.CANCELLED || transaction.status === TransactionStatus.FAILED) {
    return [
      {
        status: "Order Placed",
        description: "Your order has been received and is being processed.",
        completed: true,
        current: false,
        date: transaction.createdAt
      },
      {
        status: transaction.status === TransactionStatus.CANCELLED ? "Order Cancelled" : "Order Failed",
        description: transaction.status === TransactionStatus.CANCELLED 
          ? "Your order has been cancelled." 
          : "There was an issue processing your order.",
        completed: false,
        current: true,
        date: transaction.updatedAt
      }
    ];
  }

  return statuses;
} 