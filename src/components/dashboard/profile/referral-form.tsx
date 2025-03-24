"use client"

import { useState, useEffect } from "react"
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
  Lock 
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

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const referralLink = referralCode ? `${baseUrl}/register?ref=${referralCode}` : ''

  useEffect(() => {
    async function fetchReferralData() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/users/referrals')
        
        if (!response.ok) {
          throw new Error('Failed to fetch referral data')
        }
        
        const data = await response.json()
        setReferralCode(data.referralCode)
        setReferrals(data.referrals || [])
        setCommissions(data.commissions || [])
        setTotalEarned(data.totalEarned || 0)
        setTotalPending(data.totalPending || 0)
      } catch (error) {
        console.error('Error fetching referral data:', error)
        setError(error instanceof Error ? error.message : 'An unknown error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchReferralData()
  }, [])

  const copyToClipboard = () => {
    if (!referralLink) return
    
    navigator.clipboard.writeText(referralLink)
      .then(() => {
        toast.success("Link copied!", {
          description: "Referral link copied to clipboard"
        })
      })
      .catch(() => {
        toast.error("Copy failed", {
          description: "Unable to copy referral link"
        })
      })
  }

  // If user hasn't completed KYC, show a message
  if (user.kycStatus !== "APPROVED") {
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

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Referral Program</CardTitle>
          <CardDescription>
            Invite friends and earn commission on their investments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-[200px] w-full mt-6" />
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
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
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}. Please try again later or contact support.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Successful state
  return (
    <Card>
      <CardHeader>
        <CardTitle>Referral Program</CardTitle>
        <CardDescription>
          Invite friends and earn commission on their investments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Referral Link Section */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Your Referral Link</h3>
          <div className="flex gap-2">
            <Input 
              value={referralLink} 
              readOnly 
              className="flex-1"
            />
            <Button onClick={copyToClipboard} variant="outline" size="icon">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Share this link with friends to earn commission on their investments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Earned</p>
                  <h3 className="text-2xl font-bold">${totalEarned.toFixed(2)}</h3>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Commission</p>
                  <h3 className="text-2xl font-bold">${totalPending.toFixed(2)}</h3>
                </div>
                <Sparkles className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referrals Table */}
        <div className="rounded-md border">
          <Table>
            <TableCaption>List of people you've referred</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals.length > 0 ? (
                referrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell className="font-medium">
                      {referral.firstName} {referral.lastName}
                    </TableCell>
                    <TableCell>
                      {new Date(referral.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={referral.status === 'ACTIVE' ? 'default' : 'outline'}
                      >
                        {referral.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No referrals yet. Share your link to start earning!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Commissions Table */}
        <div className="rounded-md border">
          <Table>
            <TableCaption>Your commission history</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.length > 0 ? (
                commissions.map((commission) => (
                  <TableRow key={commission.id}>
                    <TableCell className="font-medium">
                      ${Number(commission.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>{commission.transactionType}</TableCell>
                    <TableCell>
                      {new Date(commission.createdAt).toLocaleDateString()}
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
                      >
                        {commission.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No commissions yet. Refer friends to earn!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
} 