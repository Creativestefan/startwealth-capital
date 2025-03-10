import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="kyc">KYC Verification</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 col-span-3" />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
