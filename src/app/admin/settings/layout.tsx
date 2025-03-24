import { ReactNode } from "react"
import { requireAdmin } from "@/lib/auth-utils"
import { Card } from "@/components/ui/card"

// Server component for the layout
export default async function AdminSettingsLayout({
  children,
}: {
  children: ReactNode
}) {
  // Ensure user is an admin
  await requireAdmin()
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground">
          Manage system settings and configurations
        </p>
      </div>
      
      <Card className="mt-4 p-6">
        {children}
      </Card>
    </div>
  )
} 