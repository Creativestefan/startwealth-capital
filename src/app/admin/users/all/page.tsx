import { Suspense } from "react"
import { Metadata } from "next"
import { Separator } from "@/components/ui/separator"
import UsersList from "@/components/admin/users/users-list"

export const metadata: Metadata = {
  title: "Regular User Management | Admin Dashboard",
  description: "View and manage regular users on the platform",
}

export default async function AdminUsersPage() {
  return (
    <div className="container py-8 max-w-7xl">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Regular User Management</h2>
        <p className="text-muted-foreground">
          View and manage regular users registered on the platform
        </p>
      </div>
      <Separator className="my-6" />
      <Suspense fallback={<div>Loading users...</div>}>
        <UsersList />
      </Suspense>
    </div>
  )
} 