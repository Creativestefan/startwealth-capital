"use client"

import { useState, useEffect, useRef } from "react"
import { User } from "next-auth"
import { KycStatus } from "@prisma/client"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  AlertCircle, 
  CheckCircle, 
  Copy, 
  Sparkles, 
  Lock,
  Loader2 
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface ReferralFormProps {
  user: User & { kycStatus?: KycStatus }
}

export function ReferralForm({ user }: ReferralFormProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [referrals, setReferrals] = useState<any[]>([])
  const [commissions, setCommissions] = useState<any[]>([])
  const [totalEarned, setTotalEarned] = useState(0)
  const [totalPending, setTotalPending] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [currentKycStatus, setCurrentKycStatus] = useState<KycStatus | undefined>(user.kycStatus)
  const [isCheckingKyc, setIsCheckingKyc] = useState(user.kycStatus !== "APPROVED")
  const isMounted = useRef(true)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const referralLink = referralCode ? `${baseUrl}/register?ref=${referralCode}` : ''

  // Check for the latest KYC status on component mount, but only if needed
  useEffect(() => {
    // If user is already approved, no need to check
    if (user.kycStatus === "APPROVED") {
      setIsCheckingKyc(false);
      return;
    }

    // Add a timeout to prevent infinite loading state
    const timeoutId = setTimeout(() => {
      if (isCheckingKyc && isMounted.current) {
        setIsCheckingKyc(false);
        console.log('KYC check timed out - falling back to current value');
      }
    }, 3000); // 3 second timeout

    const fetchLatestKycStatus = async () => {
      // Skip if component is unmounted
      if (!isMounted.current) return
      
      try {
        // Call the session refresh endpoint
        const response = await fetch("/api/auth/session-refresh")
        
        if (!response.ok) {
          throw new Error("Failed to fetch latest KYC status")
        }

        const userData = await response.json()
        
        // Only update if component is still mounted
        if (isMounted.current) {
          // Only update if the status has changed to avoid unnecessary rerenders
          if (userData.kycStatus !== currentKycStatus) {
            setCurrentKycStatus(userData.kycStatus)
          }
          
          // Set isCheckingKyc to false when done
          setIsCheckingKyc(false)
        }
      } catch (error) {
        console.error("Error fetching latest KYC status:", error)
        if (isMounted.current) {
          setIsCheckingKyc(false)
        }
      }
    }

    // Only fetch if we need to check KYC status
    if (isCheckingKyc) {
      fetchLatestKycStatus()
    }
    
    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    // Only fetch referral data if KYC is approved and we're not still checking
    if (currentKycStatus !== "APPROVED" || isCheckingKyc) {
      // Set loading to false if KYC is not approved
      if (currentKycStatus !== "APPROVED") {
        setIsLoading(false);
      }
      return;
    }
    
    // Only fetch data once when the component is mounted with approved status or when status changes to approved
    async function fetchReferralData() {
      if (!isMounted.current) return;
      
      try {
        setIsLoading(true);
        const response = await fetch('/api/users/referrals');
        
        if (!response.ok) {
          throw new Error('Failed to fetch referral data');
        }
        
        const data = await response.json();
        
        if (isMounted.current) {
          setReferralCode(data.referralCode);
          setReferrals(data.referrals || []);
          setCommissions(data.commissions || []);
          setTotalEarned(data.totalEarned || 0);
          setTotalPending(data.totalPending || 0);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching referral data:', error);
        if (isMounted.current) {
          setError(error instanceof Error ? error.message : 'An unknown error occurred');
          setIsLoading(false);
        }
      }
    }

    fetchReferralData();
    // Only react to changes in these specific values
  }, [currentKycStatus, isCheckingKyc]);

  const copyToClipboard = (text: string, type: 'link' | 'code' = 'link') => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success(`${type === 'link' ? 'Link' : 'Code'} copied!`, {
          description: `Referral ${type} copied to clipboard`
        })
      })
      .catch(() => {
        toast.error("Copy failed", {
          description: `Unable to copy referral ${type}`
        })
      })
  }

  // If still checking KYC status but not showing the full loading state
  if (isCheckingKyc) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Referral Program</CardTitle>
          <CardDescription>
            Preparing your referral dashboard...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">Loading your referral program...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If user hasn't completed KYC, show a message
  if (currentKycStatus !== "APPROVED") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Referral Program</CardTitle>
          <CardDescription>
            Invite friends and earn commission on their investments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <Lock className="h-4 w-4" />
            <AlertTitle>KYC Required</AlertTitle>
            <AlertDescription>
              You need to complete KYC verification before accessing the referral program.
              Please go to the KYC Verification tab to complete this process.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Successful state - KYC is approved, so show the referral program
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Referral Program</CardTitle>
        <CardDescription>
          Invite friends and earn commission on their investments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Referral Link Section */}
        <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
          <h3 className="text-base font-medium">Share Your Referral</h3>
          
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Your Referral Link</h4>
            <div className="flex gap-2">
              <Input 
                value={referralLink} 
                readOnly 
                className="flex-1 bg-white"
                disabled={isLoading}
                placeholder={isLoading ? "Loading your referral link..." : ""}
              />
              <Button 
                onClick={() => copyToClipboard(referralLink, 'link')} 
                variant="outline" 
                size="icon" 
                title="Copy referral link"
                disabled={isLoading || !referralLink}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Share this link with friends to earn commission on their investments
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Your Referral Code</h4>
            <div className="flex gap-2">
              <Input 
                value={referralCode || ""} 
                readOnly 
                className="flex-1 bg-white"
                disabled={isLoading}
                placeholder={isLoading ? "Loading your referral code..." : ""}
              />
              <Button 
                onClick={() => copyToClipboard(referralCode || "", 'code')} 
                variant="outline" 
                size="icon" 
                title="Copy referral code"
                disabled={isLoading || !referralCode}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Share this code with friends to use during registration
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div>
          <h3 className="text-base font-medium mb-3">Your Earnings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-white border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Earned</p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-24 mt-1" />
                    ) : (
                      <h3 className="text-2xl font-bold">${totalEarned.toFixed(2)}</h3>
                    )}
                  </div>
                  <div className="rounded-full bg-green-100 p-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-50 to-white border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Commission</p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-24 mt-1" />
                    ) : (
                      <h3 className="text-2xl font-bold">${totalPending.toFixed(2)}</h3>
                    )}
                  </div>
                  <div className="rounded-full bg-amber-100 p-2">
                    <Sparkles className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Referral Activity Section */}
        <div>
          <h3 className="text-base font-medium mb-3">Referral Activity</h3>
          
          {/* Show error message if there is one */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Data</AlertTitle>
              <AlertDescription>
                {error}. Please try again later or contact support.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Referrals Table */}
          <div className="rounded-md border shadow-sm mb-6">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading state for referrals table
                  Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={`loading-referral-${index}`}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : referrals.length > 0 ? (
                  // Loaded state with data
                  referrals.map((referral) => (
                    <TableRow key={referral.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {referral.firstName} {referral.lastName}
                      </TableCell>
                      <TableCell>
                        {new Date(referral.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={referral.status === 'ACTIVE' ? 'default' : 'outline'}
                          className={referral.status === 'ACTIVE' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                        >
                          {referral.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  // Empty state
                  <TableRow>
                    <TableCell colSpan={3} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3 py-4">
                        <div className="rounded-full bg-gray-100 p-3">
                          <Copy className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-lg font-medium">No referrals yet. Share your link to start earning!</p>
                        <p className="text-sm text-muted-foreground max-w-md">
                          Copy your referral link above and share it with friends to earn commission when they invest.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableCaption>List of people you've referred</TableCaption>
            </Table>
          </div>

          {/* Commissions Table */}
          <div className="rounded-md border shadow-sm">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold">Amount</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading state for commissions table
                  Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={`loading-commission-${index}`}>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : commissions.length > 0 ? (
                  // Loaded state with data
                  commissions.map((commission) => (
                    <TableRow key={commission.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        ${Number(commission.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>{commission.transactionType}</TableCell>
                      <TableCell>
                        {new Date(commission.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            commission.status === 'PAID' 
                              ? 'default' 
                              : commission.status === 'PENDING' 
                              ? 'outline'
                              : 'destructive'
                          }
                          className={
                            commission.status === 'PAID' 
                              ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                              : commission.status === 'PENDING'
                              ? 'bg-yellow-50 text-yellow-800 hover:bg-yellow-50'
                              : ''
                          }
                        >
                          {commission.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  // Empty state
                  <TableRow>
                    <TableCell colSpan={4} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3 py-4">
                        <div className="rounded-full bg-gray-100 p-3">
                          <Sparkles className="h-6 w-6 text-amber-500" />
                        </div>
                        <p className="text-lg font-medium">No commissions yet. Refer friends to earn!</p>
                        <p className="text-sm text-muted-foreground max-w-md">
                          When your referrals invest, you'll earn commission that will appear here.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableCaption>Your commission history</TableCaption>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 