import { notFound } from "next/navigation"
import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { Metadata } from "next"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowLeft, User, Coins, Activity } from "lucide-react"
import UserDetail from "@/components/admin/users/user-detail"
import UserInvestments from "@/components/admin/users/user-investments"
import UserActivityTabs from "@/components/admin/users/user-activity-tabs"

export async function generateMetadata({ params }: { params: Promise<{ userId: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const userId = resolvedParams.userId
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true }
  })

  if (!user) {
    return {
      title: "User Not Found | Admin Dashboard",
    }
  }

  return {
    title: `${user.firstName} ${user.lastName} | Admin Dashboard`,
    description: `View and manage user details for ${user.firstName} ${user.lastName}`,
  }
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const resolvedParams = await params
  const userId = resolvedParams.userId
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      kyc: true,
      wallet: true,
    }
  })

  if (!user) {
    notFound()
  }

  return (
    <div className="container py-4 md:py-8 max-w-7xl">
      {/* Header with back button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="space-y-0.5">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">User Profile: {user.firstName} {user.lastName}</h2>
          <p className="text-sm text-muted-foreground">
            View and manage user information, investments, and activity
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
          <Link href="/admin/users/all" className="flex items-center justify-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users List
          </Link>
        </Button>
      </div>
      <Separator className="my-4" />
      
      {/* Mobile view - vertical layout with tabs */}
      <div className="block md:hidden">
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="details" className="flex gap-1 items-center">
              <User className="h-4 w-4" />
              <span className="sm:inline">Details</span>
            </TabsTrigger>
            <TabsTrigger value="investments" className="flex gap-1 items-center">
              <Coins className="h-4 w-4" />
              <span className="sm:inline">Investments</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex gap-1 items-center">
              <Activity className="h-4 w-4" />
              <span className="sm:inline">Activity</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-6 space-y-4">
            <Suspense fallback={<div className="p-8 text-center">Loading user details...</div>}>
              <UserDetail user={user} />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="investments" className="mt-6 space-y-4">
            <Suspense fallback={<div className="p-8 text-center">Loading investments...</div>}>
              <UserInvestments userId={userId} />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="activity" className="mt-6 space-y-4">
            <Suspense fallback={<div className="p-8 text-center">Loading activity...</div>}>
              <UserActivityTabs userId={userId} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Desktop view - vertical stack layout */}
      <div className="hidden md:block">
        <div className="flex flex-col gap-6">
          {/* User details section */}
          <section className="w-full">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">User Information</h2>
            </div>
            <Suspense fallback={<div className="p-8 text-center">Loading user details...</div>}>
              <UserDetail user={user} />
            </Suspense>
          </section>
          
          {/* Investments section */}
          <section>
            <Suspense fallback={<div className="p-8 text-center">Loading investments...</div>}>
              <UserInvestments userId={userId} />
            </Suspense>
          </section>
          
          {/* Activity section */}
          <section>
            <Suspense fallback={<div className="p-8 text-center">Loading activity...</div>}>
              <UserActivityTabs userId={userId} />
            </Suspense>
          </section>
        </div>
      </div>
    </div>
  )
} 