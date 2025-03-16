import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function KycRequired() {
  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">KYC Verification Required</CardTitle>
          <CardDescription>
            You need to complete KYC verification to access wallet features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Restricted</AlertTitle>
            <AlertDescription>
              Your wallet access is currently restricted because you haven&apos;t completed KYC verification.
              Complete the verification process to deposit, withdraw, and invest funds.
            </AlertDescription>
          </Alert>
          
          <div className="rounded-lg border p-4">
            <h3 className="font-medium mb-2">Why KYC is required:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>To comply with financial regulations</li>
              <li>To prevent fraud and ensure security</li>
              <li>To protect your investments and transactions</li>
              <li>To enable full platform functionality</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/profile/kyc">Complete KYC Verification</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 