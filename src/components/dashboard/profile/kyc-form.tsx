"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { User } from "next-auth"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Upload, Loader2, RefreshCw } from "lucide-react"
import { countries } from "@/lib/countries"
import { KycStatus } from "@prisma/client"
import { useSession } from "next-auth/react"
import { useRefreshKyc } from "@/hooks/use-refresh-kyc"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]

const kycFormSchema = z.object({
  country: z.string({
    required_error: "Please select your country of residence",
  }),
  documentType: z.enum(["PASSPORT", "DRIVERS_LICENSE", "NATIONAL_ID"], {
    required_error: "Please select a document type",
  }),
  documentNumber: z.string().optional(),
  documentImage: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .pdf files are accepted."
    ),
})

type KycFormValues = z.infer<typeof kycFormSchema>

interface KycFormProps {
  user: User & { kycStatus?: KycStatus }
}

export function KycForm({ user }: KycFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [currentKycStatus, setCurrentKycStatus] = useState<KycStatus | undefined>(user.kycStatus)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const { refreshKycStatus, isRefreshing } = useRefreshKyc()
  const { update } = useSession()

  const form = useForm<KycFormValues>({
    resolver: zodResolver(kycFormSchema),
    defaultValues: {
      country: "",
      documentType: "PASSPORT",
      documentNumber: "",
    },
  })

  // Check for the latest KYC status on component mount
  useEffect(() => {
    const fetchLatestKycStatus = async () => {
      try {
        setIsCheckingStatus(true)
        // Call the session refresh endpoint
        const response = await fetch("/api/auth/session-refresh")
        
        if (!response.ok) {
          throw new Error("Failed to fetch latest KYC status")
        }

        const userData = await response.json()
        
        // Update the local state with the latest KYC status
        if (userData.kycStatus !== currentKycStatus) {
          setCurrentKycStatus(userData.kycStatus)
          
          // Update the session with the latest KYC status
          await update({
            ...userData,
          })
          
          // Refresh the page to reflect the latest KYC status
          router.refresh()
        }
      } catch (error) {
        console.error("Error fetching latest KYC status:", error)
      } finally {
        setIsCheckingStatus(false)
      }
    }

    fetchLatestKycStatus()
  }, [currentKycStatus, router, update])

  const handleRefreshStatus = async () => {
    try {
      setIsCheckingStatus(true)
      const newStatus = await refreshKycStatus()
      if (newStatus && newStatus !== currentKycStatus) {
        setCurrentKycStatus(newStatus as KycStatus)
      }
    } catch (error) {
      console.error("Error refreshing KYC status:", error)
    } finally {
      setIsCheckingStatus(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      form.setValue("documentImage", file, { shouldValidate: true })
      setSelectedFile(file)
    }
  }

  async function onSubmit(values: KycFormValues) {
    setIsSubmitting(true)

    try {
      // Create form data for file upload
      const formData = new FormData()
      formData.append("country", values.country)
      formData.append("documentType", values.documentType)
      if (values.documentNumber) {
        formData.append("documentNumber", values.documentNumber)
      }
      formData.append("documentImage", values.documentImage)

      const response = await fetch("/api/kyc/submit", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit KYC")
      }

      // Update the local KYC status to PENDING
      setCurrentKycStatus("PENDING")

      toast.success("KYC verification submitted", {
        description: "Your verification documents have been submitted for review."
      })
      
      // Refresh the page after a short delay to update the UI with the new KYC status
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (error) {
      console.error("KYC submission error:", error)
      toast.error("Failed to submit KYC verification", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Display different content based on KYC status
  if (currentKycStatus === "APPROVED") {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>KYC Verification</CardTitle>
            <CardDescription>Your identity has been verified</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshStatus}
            disabled={isCheckingStatus}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isCheckingStatus ? 'animate-spin' : ''}`} />
            {isCheckingStatus ? 'Checking...' : 'Refresh Status'}
          </Button>
        </CardHeader>
        <CardContent>
          <Alert className="bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Verification Approved</AlertTitle>
            <AlertDescription className="text-green-700">
              Your KYC verification has been approved. You now have full access to all platform features.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (currentKycStatus === "PENDING") {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>KYC Verification</CardTitle>
            <CardDescription>Your verification is being processed</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshStatus}
            disabled={isCheckingStatus}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isCheckingStatus ? 'animate-spin' : ''}`} />
            {isCheckingStatus ? 'Checking...' : 'Refresh Status'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-yellow-50">
            <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />
            <AlertTitle className="text-yellow-800">Verification Pending</AlertTitle>
            <AlertDescription className="text-yellow-700">
              Your KYC verification is currently being reviewed by our team. This process typically takes 1-2 business
              days. You'll be notified once the review is complete.
            </AlertDescription>
          </Alert>
          
          <div className="rounded-lg border p-4 bg-gray-50">
            <h3 className="text-base font-medium mb-2">What happens next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>Our team will review your submitted documents</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>You'll receive an email notification when your verification is approved or rejected</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>Once approved, you'll have full access to all investment features</span>
              </li>
            </ul>
          </div>
          
          <div className="rounded-lg border p-4 bg-blue-50">
            <h3 className="text-base font-medium mb-2 flex items-center text-blue-800">
              <AlertCircle className="h-4 w-4 mr-2" /> Need assistance?
            </h3>
            <p className="text-sm text-blue-700">
              If you have any questions about your KYC verification process, please contact our 
              support team at <a href="mailto:support@stratwealth.com" className="underline font-medium">
              support@stratwealth.com</a>
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (currentKycStatus === "REJECTED") {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>KYC Verification</CardTitle>
            <CardDescription>Your verification needs attention</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshStatus}
            disabled={isCheckingStatus}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isCheckingStatus ? 'animate-spin' : ''}`} />
            {isCheckingStatus ? 'Checking...' : 'Refresh Status'}
          </Button>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Verification Rejected</AlertTitle>
            <AlertDescription>
              Your KYC verification was rejected. Please submit new verification documents following the guidelines below.
            </AlertDescription>
          </Alert>
          
          <div className="rounded-lg border p-4 bg-gray-50 mb-6">
            <h3 className="text-base font-medium mb-2">Tips for successful verification:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>Ensure your document is clearly visible and not blurry</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>Make sure all four corners of the document are visible</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>Ensure the document is valid and not expired</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>Submit a high-quality image (JPG, PNG) or PDF document</span>
              </li>
            </ul>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country of Residence</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[200px]">
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PASSPORT">Passport</SelectItem>
                        <SelectItem value="DRIVERS_LICENSE">Driver's License</SelectItem>
                        <SelectItem value="NATIONAL_ID">National ID</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="documentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter document number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Providing your document number helps speed up the verification process.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="documentImage"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Upload Document Image</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Input
                          id="documentImage"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                          {...fieldProps}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-32 flex flex-col items-center justify-center gap-2"
                          onClick={() => document.getElementById("documentImage")?.click()}
                        >
                          <Upload className="h-6 w-6" />
                          <span>{selectedFile ? selectedFile.name : "Upload Document"}</span>
                          <span className="text-xs text-muted-foreground">
                            JPG, PNG or PDF (max 5MB)
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Verification"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    )
  }

  // Default form for users without KYC status
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>KYC Verification</CardTitle>
          <CardDescription>Verify your identity to unlock all platform features</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefreshStatus}
          disabled={isCheckingStatus}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isCheckingStatus ? 'animate-spin' : ''}`} />
          {isCheckingStatus ? 'Checking...' : 'Refresh Status'}
        </Button>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Verification Required</AlertTitle>
          <AlertDescription>
            Complete KYC verification to unlock investment opportunities, wallet features, and property purchases.
            This is a regulatory requirement for all users.
          </AlertDescription>
        </Alert>
        
        <div className="rounded-lg border p-4 bg-gray-50 mb-6">
          <h3 className="text-base font-medium mb-2">What you'll need:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
              <span>A valid government-issued ID (passport, driver's license, or national ID)</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
              <span>Clear images or scan of your document (front and back if applicable)</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
              <span>Your document must be valid and not expired</span>
            </li>
          </ul>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country of Residence</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px]">
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PASSPORT">Passport</SelectItem>
                      <SelectItem value="DRIVERS_LICENSE">Driver's License</SelectItem>
                      <SelectItem value="NATIONAL_ID">National ID</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="documentNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter document number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Providing your document number helps speed up the verification process.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="documentImage"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Upload Document Image</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        id="documentImage"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        {...fieldProps}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-32 flex flex-col items-center justify-center gap-2"
                        onClick={() => document.getElementById("documentImage")?.click()}
                      >
                        <Upload className="h-6 w-6" />
                        <span>{selectedFile ? selectedFile.name : "Upload Document"}</span>
                        <span className="text-xs text-muted-foreground">
                          JPG, PNG or PDF (max 5MB)
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Verification"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
