"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { format } from 'date-fns';
import { KycStatus } from "@prisma/client"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Loader2, Eye, Camera } from "lucide-react"

type KycSubmission = {
  id: string
  userId: string
  status: KycStatus
  country: string
  documentType: string
  documentNumber: string | null
  documentImage: string
  submittedAt: Date
  reviewedAt: Date | null
  rejectionReason: string | null
  user: {
    firstName: string
    lastName: string
    email: string
  }
}

export function KycReviewList() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<KycSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<KycSubmission | null>(null)
  const [viewImageOpen, setViewImageOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [reviewLoading, setReviewLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("pending")

  // Fetch KYC submissions
  useEffect(() => {
    async function fetchSubmissions() {
      try {
        setLoading(true)

        const response = await fetch("/api/admin/kyc")
        if (!response.ok) {
          throw new Error("Failed to fetch KYC submissions")
        }

        const data = await response.json()
        setSubmissions(data.submissions)
      } catch (error) {
        console.error("Error fetching KYC submissions:", error)
        toast.error("Failed to load KYC submissions", {
          description: error instanceof Error ? error.message : "An unknown error occurred"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()
  }, [])

  // Filter submissions based on active tab
  const filteredSubmissions = submissions.filter((submission) => {
    if (activeTab === "pending") return submission.status === "PENDING"
    if (activeTab === "approved") return submission.status === "APPROVED"
    if (activeTab === "rejected") return submission.status === "REJECTED"
    return true
  })

  // Handle view document image
  const handleViewImage = (submission: KycSubmission) => {
    setSelectedSubmission(submission)
    setViewImageOpen(true)
  }

  // Handle review dialog open
  const handleReview = (submission: KycSubmission) => {
    setSelectedSubmission(submission)
    setRejectionReason("")
    setReviewOpen(true)
  }

  // Handle approve KYC
  const handleApprove = async () => {
    if (!selectedSubmission) return

    try {
      setReviewLoading(true)

      const response = await fetch(`/api/admin/kyc/${selectedSubmission.id}/approve`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to approve KYC")
      }

      // Update local state
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === selectedSubmission.id
            ? { ...sub, status: "APPROVED", reviewedAt: new Date(), rejectionReason: null }
            : sub
        )
      )

      toast.success("KYC verification approved", {
        description: `${selectedSubmission.user.firstName} ${selectedSubmission.user.lastName}'s KYC has been approved.`
      })
      
      setReviewOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error approving KYC:", error)
      toast.error("Failed to approve KYC", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      })
    } finally {
      setReviewLoading(false)
    }
  }

  // Handle reject KYC
  const handleReject = async () => {
    if (!selectedSubmission || !rejectionReason.trim()) return

    try {
      setReviewLoading(true)

      const response = await fetch(`/api/admin/kyc/${selectedSubmission.id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: rejectionReason }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to reject KYC")
      }

      // Update local state
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === selectedSubmission.id
            ? { ...sub, status: "REJECTED", reviewedAt: new Date(), rejectionReason }
            : sub
        )
      )

      toast.success("KYC verification rejected", {
        description: `${selectedSubmission.user.firstName} ${selectedSubmission.user.lastName}'s KYC has been rejected.`
      })
      
      setReviewOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error rejecting KYC:", error)
      toast.error("Failed to reject KYC", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      })
    } finally {
      setReviewLoading(false)
    }
  }

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading KYC submissions...</span>
      </div>
    )
  }

  return (
    <>
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending
            <Badge variant="secondary" className="ml-2">
              {submissions.filter((s) => s.status === "PENDING").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved
            <Badge variant="secondary" className="ml-2">
              {submissions.filter((s) => s.status === "APPROVED").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected
            <Badge variant="secondary" className="ml-2">
              {submissions.filter((s) => s.status === "REJECTED").length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <KycSubmissionsTable
            submissions={filteredSubmissions}
            onViewImage={handleViewImage}
            onReview={handleReview}
          />
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <KycSubmissionsTable
            submissions={filteredSubmissions}
            onViewImage={handleViewImage}
            onReview={handleReview}
          />
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <KycSubmissionsTable
            submissions={filteredSubmissions}
            onViewImage={handleViewImage}
            onReview={handleReview}
          />
        </TabsContent>
      </Tabs>

      {/* Document Image Dialog */}
      <Dialog open={viewImageOpen} onOpenChange={setViewImageOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Document Image</DialogTitle>
            <DialogDescription>
              {selectedSubmission?.user.firstName} {selectedSubmission?.user.lastName}'s{" "}
              {selectedSubmission?.documentType.replace("_", " ").toLowerCase()}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            {selectedSubmission?.documentImage && 
             selectedSubmission.documentImage !== "placeholder-url" &&
             selectedSubmission.documentImage.startsWith("/") ? (
              <div className="relative w-full h-[400px] border rounded-md overflow-hidden">
                <Image
                  src={selectedSubmission.documentImage}
                  alt="Document"
                  fill
                  className="object-contain"
                  unoptimized={selectedSubmission.documentImage.includes('image-proxy')}
                  onError={() => toast.error("Failed to load document image")}
                />
              </div>
            ) : (
              <div className="w-full h-[400px] border rounded-md overflow-hidden flex items-center justify-center bg-muted">
                <div className="text-center">
                  <Camera className="h-16 w-16 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No valid document image available</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewImageOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review KYC Submission</DialogTitle>
            <DialogDescription>
              {selectedSubmission?.user.firstName} {selectedSubmission?.user.lastName} ({selectedSubmission?.user.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Country</p>
                <p className="text-sm">{selectedSubmission?.country}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Document Type</p>
                <p className="text-sm">{selectedSubmission?.documentType.replace("_", " ")}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Document Number</p>
                <p className="text-sm">{selectedSubmission?.documentNumber || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Submitted At</p>
                <p className="text-sm">
                  {selectedSubmission?.submittedAt
                    ? format(new Date(selectedSubmission.submittedAt), "MMM d, yyyy h:mm a")
                    : "Unknown"}
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button variant="outline" size="sm" onClick={() => handleViewImage(selectedSubmission!)}>
                <Eye className="h-4 w-4 mr-2" /> View Document Image
              </Button>
            </div>

            {selectedSubmission?.status === "PENDING" && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Rejection Reason (required if rejecting)</p>
                <Textarea
                  placeholder="Enter reason for rejection"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter className="flex space-x-2 justify-end">
            {selectedSubmission?.status === "PENDING" && (
              <>
                <Button variant="outline" onClick={() => setReviewOpen(false)} disabled={reviewLoading}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={reviewLoading || !rejectionReason.trim()}
                >
                  {reviewLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Reject
                </Button>
                <Button variant="default" onClick={handleApprove} disabled={reviewLoading}>
                  {reviewLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Approve
                </Button>
              </>
            )}
            {selectedSubmission?.status !== "PENDING" && (
              <Button variant="outline" onClick={() => setReviewOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface KycSubmissionsTableProps {
  submissions: KycSubmission[]
  onViewImage: (submission: KycSubmission) => void
  onReview: (submission: KycSubmission) => void
}

function KycSubmissionsTable({ submissions, onViewImage, onReview }: KycSubmissionsTableProps) {
  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-6 text-muted-foreground">
            No KYC submissions found in this category.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Document Type</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell className="font-medium">
                  {submission.user.firstName} {submission.user.lastName}
                  <div className="text-xs text-muted-foreground">{submission.user.email}</div>
                </TableCell>
                <TableCell>{submission.country}</TableCell>
                <TableCell>{submission.documentType.replace("_", " ")}</TableCell>
                <TableCell>
                  {format(new Date(submission.submittedAt), "MMM d, yyyy")}
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(submission.submittedAt), "h:mm a")}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={submission.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={() => onViewImage(submission)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onReview(submission)}>
                      Review
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: KycStatus }) {
  switch (status) {
    case "PENDING":
      return <Badge variant="outline">Pending</Badge>
    case "APPROVED":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
    case "REJECTED":
      return <Badge variant="destructive">Rejected</Badge>
    default:
      return null
  }
}
