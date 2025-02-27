"use client"

import * as React from "react"
import { KycModal } from "@/components/dashboard/kyc-modal"
import type { KycStatus } from "@prisma/client"

interface DashboardContentProps {
  kycStatus?: KycStatus
}

export function DashboardContent({ kycStatus }: DashboardContentProps) {
  const [showKycModal, setShowKycModal] = React.useState(kycStatus !== "APPROVED")

  return (
    <div>
      {/* Your dashboard content */}
      <KycModal open={showKycModal} onOpenChange={setShowKycModal} />
    </div>
  )
}

