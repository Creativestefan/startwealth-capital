"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { 
  Activity, 
  Clock, 
  Filter, 
  Search, 
  DollarSign, 
  LogIn, 
  ArrowDown, 
  ArrowUp, 
  Laptop, 
  Smartphone, 
  Building, 
  Leaf, 
  TrendingUp,
  MapPin,
  Calendar,
  User,
  FileText,
  LogOut
} from "lucide-react"
import { toast } from "sonner"
import { useReceipt } from "@/providers/receipt-provider"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"

// Interface for login activities
interface LoginActivity {
  id: string
  timestamp: string
  ipAddress: string
  deviceInfo: string
  browser: string
  location?: string
  status: string
  metadata?: Record<string, any>
}

// Interface for investment activities
interface InvestmentActivity {
  id: string
  timestamp: string
  amount: number
  type: "real_estate" | "green_energy" | "market"
  investmentId: string
  name: string
  status: string
  expectedReturn?: number
  duration?: string
  metadata?: Record<string, any>
}

// Interface for withdrawal activities
interface WithdrawalActivity {
  id: string
  timestamp: string
  amount: number
  bankAccount: string
  reference: string
  status: string
  metadata?: Record<string, any>
}

// Interface for transaction activities
interface TransactionActivity {
  id: string
  timestamp: string
  amount: number
  type: "deposit" | "dividend" | "referral" | "fee" | "real_estate" | "green_energy" | "market" | string
  description: string
  status: string
  sourceType?: string
  sourceId?: string
  metadata?: Record<string, any>
}

// Add a new function to handle revoking user sessions
const revokeUserSession = async (userId: string, sessionId: string) => {
  try {
    const response = await fetch(`/api/admin/users/${userId}/revoke-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    });

    if (!response.ok) {
      throw new Error('Failed to revoke session');
    }

    // Return the result
    return await response.json();
  } catch (error) {
    console.error('Error revoking session:', error);
    throw error;
  }
};

export default function UserActivityTabs({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState("login")
  const [loginPage, setLoginPage] = useState(1)
  const [investmentPage, setInvestmentPage] = useState(1)
  const [withdrawalPage, setWithdrawalPage] = useState(1)
  const [transactionPage, setTransactionPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [transactionType, setTransactionType] = useState("all")
  const { viewReceipt } = useReceipt()
  const queryClient = useQueryClient()

  // Login activities query
  const { 
    data: loginData, 
    isLoading: isLoginLoading, 
    isError: isLoginError 
  } = useQuery<{
    activities: LoginActivity[]
    total: number
    pages: number
  }>({
    queryKey: ["user-login-activities", userId, loginPage, searchQuery],
    queryFn: async () => {
      let url = `/api/admin/users/${userId}/logins?page=${loginPage}&limit=10`
      
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`
      }
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error("Failed to fetch login activities")
      }
      
      return response.json()
    },
    enabled: activeTab === "login"
  })
  
  // Investment activities query
  const { 
    data: investmentData, 
    isLoading: isInvestmentLoading, 
    isError: isInvestmentError 
  } = useQuery<{
    activities: InvestmentActivity[]
    total: number
    pages: number
  }>({
    queryKey: ["user-investment-activities", userId, investmentPage, searchQuery],
    queryFn: async () => {
      let url = `/api/admin/users/${userId}/investment-activities?page=${investmentPage}&limit=10`
      
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`
      }
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error("Failed to fetch investment activities")
      }
      
      return response.json()
    },
    enabled: activeTab === "investment"
  })
  
  // Withdrawal activities query
  const { 
    data: withdrawalData, 
    isLoading: isWithdrawalLoading, 
    isError: isWithdrawalError 
  } = useQuery<{
    activities: WithdrawalActivity[]
    total: number
    pages: number
  }>({
    queryKey: ["user-withdrawal-activities", userId, withdrawalPage, searchQuery],
    queryFn: async () => {
      let url = `/api/admin/users/${userId}/withdrawal-activities?page=${withdrawalPage}&limit=10`
      
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`
      }
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error("Failed to fetch withdrawal activities")
      }
      
      return response.json()
    },
    enabled: activeTab === "withdrawal"
  })
  
  // Transaction activities query
  const { 
    data: transactionData, 
    isLoading: isTransactionLoading, 
    isError: isTransactionError 
  } = useQuery<{
    activities: TransactionActivity[]
    total: number
    pages: number
  }>({
    queryKey: ["user-transaction-activities", userId, transactionPage, searchQuery, transactionType],
    queryFn: async () => {
      let url = `/api/admin/users/${userId}/transaction-activities?page=${transactionPage}&limit=10`
      
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`
      }
      
      if (transactionType && transactionType !== "all") {
        url += `&transactionType=${encodeURIComponent(transactionType)}`
      }
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error("Failed to fetch transaction activities")
      }
      
      return response.json()
    },
    enabled: activeTab === "transaction"
  })
  
  // Handle search input
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // The useQuery hook will automatically refetch with the updated searchQuery
  }
  
  const getStatusBadge = (status: string) => {
    const lowerStatus = status.toLowerCase();
    
    switch (lowerStatus) {
      case "success":
      case "completed":
      case "accepted":
        return <Badge className="bg-green-500 hover:bg-green-600">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
        
      case "pending":
      case "processing":
      case "out_for_delivery":
        return <Badge variant="outline" className="text-amber-500 border-amber-500 hover:bg-amber-50">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
        
      case "failed":
      case "cancelled":
      case "rejected":
        return <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
        
      case "active":
        return <Badge className="bg-blue-500 hover:bg-blue-600">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
        
      case "matured":
        return <Badge className="bg-purple-500 hover:bg-purple-600">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
        
      default:
        return <Badge variant="secondary" className="bg-gray-200 text-gray-700 hover:bg-gray-300">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    }
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }
  
  const getInvestmentTypeIcon = (type: string) => {
    switch (type) {
      case "real_estate":
        return <Building className="h-4 w-4 text-blue-500" />
      case "green_energy":
        return <Leaf className="h-4 w-4 text-green-500" />
      case "market":
        return <TrendingUp className="h-4 w-4 text-purple-500" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }
  
  const getDeviceIcon = (deviceInfo: string) => {
    if (deviceInfo.toLowerCase().includes("mobile") || 
        deviceInfo.toLowerCase().includes("iphone") || 
        deviceInfo.toLowerCase().includes("android")) {
      return <Smartphone className="h-4 w-4 text-blue-500" />
    }
    return <Laptop className="h-4 w-4 text-blue-500" />
  }
  
  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowUp className="h-4 w-4 text-green-500" />
      case "dividend":
        return <DollarSign className="h-4 w-4 text-teal-500" />
      case "referral":
        return <User className="h-4 w-4 text-blue-500" />
      case "fee":
        return <ArrowDown className="h-4 w-4 text-red-500" />
      case "real_estate":
        return <Building className="h-4 w-4 text-blue-500" />
      case "green_energy":
        return <Leaf className="h-4 w-4 text-green-500" />
      case "market":
        return <TrendingUp className="h-4 w-4 text-purple-500" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const isLoading = isLoginLoading || isInvestmentLoading || isWithdrawalLoading || isTransactionLoading
  const isError = isLoginError || isInvestmentError || isWithdrawalError || isTransactionError
  
  // Common function to get user name from the page
  const getUserNameFromPage = () => {
    const userElement = document.querySelector('#user-info-display');
    let firstName = "";
    let lastName = "";
    
    if (userElement) {
      const nameElement = userElement.querySelector('h1');
      if (nameElement && nameElement.textContent) {
        const nameParts = nameElement.textContent.trim().split(' ');
        if (nameParts.length >= 2) {
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(' ');
        } else if (nameParts.length === 1) {
          firstName = nameParts[0];
        }
      }
    }
    
    return { firstName, lastName };
  };

  // Handle receipt view
  const handleViewReceipt = (transaction: TransactionActivity) => {
    // Get user info from the page
    const { firstName, lastName } = getUserNameFromPage();
    
    // Use the found name or fallback to metadata
    const userName = (firstName && lastName) ? 
      `${firstName} ${lastName}` : 
      transaction.metadata?.userName || 
      `${transaction.metadata?.firstName || ''} ${transaction.metadata?.lastName || ''}`.trim() || 
      "User";
    
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
      property: transaction.metadata?.propertyName ? {
        name: transaction.metadata.propertyName,
        location: transaction.metadata.propertyLocation
      } : null,
      // Additional metadata for various transaction types
      ...(transaction.sourceType === 'property' && {
        installments: transaction.metadata?.installments,
        totalAmount: transaction.amount
      }),
      ...(transaction.sourceType === 'equipment' && {
        equipmentName: transaction.metadata?.equipmentName,
        equipmentType: transaction.metadata?.equipmentType,
        quantity: transaction.metadata?.quantity,
        totalAmount: transaction.amount
      }),
      ...(transaction.sourceType === 'market' && {
        planName: transaction.metadata?.planName,
        expectedReturn: transaction.metadata?.expectedReturn,
        durationMonths: transaction.metadata?.durationMonths
      }),
      // Pass user info directly
      user: {
        firstName: firstName || transaction.metadata?.firstName || '',
        lastName: lastName || transaction.metadata?.lastName || ''
      }
    };
    
    viewReceipt(receiptTransaction, userName);
  };
  
  // Handle receipt view for withdrawals
  const handleWithdrawalReceipt = (withdrawal: WithdrawalActivity) => {
    // Get user info from the page
    const { firstName, lastName } = getUserNameFromPage();
    
    // Use the found name or fallback to metadata
    const userName = (firstName && lastName) ? 
      `${firstName} ${lastName}` : 
      withdrawal.metadata?.userName || 
      `${withdrawal.metadata?.firstName || ''} ${withdrawal.metadata?.lastName || ''}`.trim() || 
      "User";
    
    // Create receipt-ready withdrawal object
    const receiptTransaction = {
      id: withdrawal.id,
      type: withdrawal.metadata?.type || "WITHDRAWAL",
      amount: withdrawal.amount,
      status: withdrawal.status.toUpperCase(),
      createdAt: new Date(withdrawal.timestamp),
      description: `Withdrawal to ${withdrawal.bankAccount}`,
      cryptoType: withdrawal.metadata?.cryptoType || "USD",
      txHash: withdrawal.metadata?.txHash || withdrawal.reference,
      totalAmount: withdrawal.amount,
      walletId: withdrawal.metadata?.walletId,
      // Pass user info directly
      user: {
        firstName: firstName || withdrawal.metadata?.firstName || '',
        lastName: lastName || withdrawal.metadata?.lastName || ''
      }
    };
    
    viewReceipt(receiptTransaction, userName);
  };
  
  // Handle receipt view for investments
  const handleInvestmentReceipt = (investment: InvestmentActivity) => {
    // Get user info from the page
    const { firstName, lastName } = getUserNameFromPage();
    
    // Use the found name or fallback to metadata
    const userName = (firstName && lastName) ? 
      `${firstName} ${lastName}` : 
      investment.metadata?.userName || 
      `${investment.metadata?.firstName || ''} ${investment.metadata?.lastName || ''}`.trim() || 
      "User";
    
    // Create receipt-ready investment object
    const receiptTransaction = {
      id: investment.id,
      type: "INVESTMENT",
      amount: investment.amount,
      status: investment.status.toUpperCase(),
      createdAt: new Date(investment.timestamp),
      description: `Investment in ${investment.name}`,
      investmentType: investment.type,
      totalAmount: investment.amount,
      property: investment.type === "real_estate" ? { name: investment.name } : null,
      expectedReturn: investment.expectedReturn,
      duration: investment.duration,
      planName: investment.name,
      // Pass user info directly
      user: {
        firstName: firstName || investment.metadata?.firstName || '',
        lastName: lastName || investment.metadata?.lastName || ''
      }
    };
    
    viewReceipt(receiptTransaction, userName);
  };
  
  // Handle receipt view for logins
  const handleLoginReceipt = (login: LoginActivity) => {
    // Get user info from the page
    const { firstName, lastName } = getUserNameFromPage();
    
    // Use the found name or fallback to metadata
    const userName = (firstName && lastName) ? 
      `${firstName} ${lastName}` : 
      login.metadata?.userName || 
      `${login.metadata?.firstName || ''} ${login.metadata?.lastName || ''}`.trim() || 
      "User";
    
    // Create receipt-ready login object
    const receiptTransaction = {
      id: login.id,
      type: "LOGIN",
      status: login.status.toUpperCase(),
      createdAt: new Date(login.timestamp),
      description: `Login from ${login.deviceInfo} - ${login.browser}`,
      metadata: {
        ipAddress: login.ipAddress,
        deviceInfo: login.deviceInfo,
        browser: login.browser,
        location: login.location || "Unknown"
      },
      // Pass user info directly
      user: {
        firstName: firstName || login.metadata?.firstName || '',
        lastName: lastName || login.metadata?.lastName || ''
      }
    };
    
    viewReceipt(receiptTransaction, userName);
  };
  
  // Add a function to handle logout/session revocation
  const handleSessionLogout = async (login: LoginActivity) => {
    if (!login.metadata?.sessionId) {
      toast.error("No session ID available for this login. Cannot log user out.");
      return;
    }
    
    try {
      // Show loading toast
      toast.loading("Revoking user session...");
      
      // Call the API to revoke the session
      const result = await revokeUserSession(userId, login.metadata.sessionId);
      
      // Show success message
      toast.success("User has been logged out from the device.");
      
      // Refresh the login data by refetching the query
      queryClient.invalidateQueries({
        queryKey: ["user-login-activities", userId]
      });
      
    } catch (error) {
      // Show error message
      toast.error("Failed to log user out. Please try again.");
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[250px] mb-2" />
          <Skeleton className="h-4 w-[350px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Activity</CardTitle>
          <CardDescription>Error loading activity data</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <p className="text-muted-foreground">Failed to load user activity</p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="mr-2 h-5 w-5 text-muted-foreground" />
          User Activity
        </CardTitle>
        <CardDescription>
          Detailed history of user actions and transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="login">Logins</TabsTrigger>
              <TabsTrigger value="investment">Investments</TabsTrigger>
              <TabsTrigger value="withdrawal">Withdrawals</TabsTrigger>
              <TabsTrigger value="transaction">Transactions</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <form onSubmit={handleSearch} className="flex-1 md:w-auto">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search activities..."
                    className="pl-8 w-full md:w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </div>
          </div>
          
          {/* LOGIN TAB CONTENT */}
          <TabsContent value="login" className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Browser</TableHead>
                    <TableHead className="hidden md:table-cell">Location</TableHead>
                    <TableHead className="hidden md:table-cell">Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loginData?.activities && loginData.activities.length > 0 ? (
                    loginData.activities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          <div className="flex items-center">
                            {getDeviceIcon(activity.deviceInfo)}
                            <span className="ml-2">{activity.deviceInfo}</span>
                          </div>
                        </TableCell>
                        <TableCell>{activity.ipAddress}</TableCell>
                        <TableCell>{activity.browser}</TableCell>
                        <TableCell className="hidden md:table-cell">{activity.location || 'Unknown'}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatDate(activity.timestamp)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(activity.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSessionLogout(activity)}
                            className="h-8 w-8 p-0"
                            title="Log user out from this device"
                          >
                            <span className="sr-only">Log out user</span>
                            <LogOut className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No login activities found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {loginData?.pages && loginData.pages > 1 && (
              <Pagination
                currentPage={loginPage}
                totalPages={loginData.pages}
                onPageChange={setLoginPage}
              />
            )}
          </TabsContent>
          
          {/* INVESTMENT TAB CONTENT */}
          <TabsContent value="investment" className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Investment</TableHead>
                    <TableHead className="hidden md:table-cell">Amount</TableHead>
                    <TableHead className="hidden md:table-cell">Expected Return</TableHead>
                    <TableHead className="hidden md:table-cell">Duration</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investmentData?.activities && investmentData.activities.length > 0 ? (
                    investmentData.activities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          <div className="flex items-center">
                            {getInvestmentTypeIcon(activity.type)}
                            <span className="ml-2 capitalize">
                              {activity.type.replace('_', ' ')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{activity.name}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatAmount(activity.amount)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {activity.expectedReturn ? `${activity.expectedReturn}%` : 'N/A'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {activity.duration || 'N/A'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatDate(activity.timestamp)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(activity.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleInvestmentReceipt(activity)}
                            className="h-8 w-8 p-0"
                            title="View receipt"
                          >
                            <span className="sr-only">View receipt</span>
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No investment activities found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {investmentData?.pages && investmentData.pages > 1 && (
              <Pagination
                currentPage={investmentPage}
                totalPages={investmentData.pages}
                onPageChange={setInvestmentPage}
              />
            )}
          </TabsContent>
          
          {/* WITHDRAWAL TAB CONTENT */}
          <TabsContent value="withdrawal" className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead>Bank Account</TableHead>
                    <TableHead className="hidden md:table-cell">Reference</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawalData?.activities && withdrawalData.activities.length > 0 ? (
                    withdrawalData.activities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          <div className="flex items-center font-medium">
                            <ArrowDown className="mr-2 h-4 w-4 text-red-500" />
                            {formatAmount(activity.amount)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{activity.bankAccount}</span>
                            {activity.metadata?.cryptoType && (
                              <span className="text-xs text-muted-foreground">{activity.metadata.cryptoType}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell font-mono text-xs">
                          {activity.reference}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatDate(activity.timestamp)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(activity.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleWithdrawalReceipt(activity)}
                            className="h-8 w-8 p-0"
                            title="View receipt"
                          >
                            <span className="sr-only">View receipt</span>
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No withdrawal activities found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {withdrawalData?.pages && withdrawalData.pages > 1 && (
              <Pagination
                currentPage={withdrawalPage}
                totalPages={withdrawalData.pages}
                onPageChange={setWithdrawalPage}
              />
            )}
          </TabsContent>
          
          {/* TRANSACTION TAB CONTENT */}
          <TabsContent value="transaction" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Transaction History</h3>
              <Select
                value={transactionType || "all"}
                onValueChange={(value) => setTransactionType(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="wallet">Wallet Transactions</SelectItem>
                  <SelectItem value="property">Real Estate</SelectItem>
                  <SelectItem value="equipment">Green Energy</SelectItem>
                  <SelectItem value="market">Market Investments</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="hidden md:table-cell">Amount</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionData?.activities && transactionData.activities.length > 0 ? (
                    transactionData.activities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          <div className="flex items-center">
                            {getTransactionTypeIcon(activity.type)}
                            <span className="ml-2 capitalize">
                              {activity.type.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{activity.description}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatAmount(activity.amount)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatDate(activity.timestamp)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(activity.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewReceipt(activity)}
                            className="h-8 w-8 p-0"
                            title="View receipt"
                          >
                            <span className="sr-only">View receipt</span>
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No transaction activities found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {transactionData?.pages && transactionData.pages > 1 && (
              <Pagination
                currentPage={transactionPage}
                totalPages={transactionData.pages}
                onPageChange={setTransactionPage}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 