import { VerifyForm } from "@/components/auth/verify-email-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Verify Email | StartWealth Capital",
  description: "Verify your email address",
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <VerifyForm />
      </div>
    </div>
  )
}

