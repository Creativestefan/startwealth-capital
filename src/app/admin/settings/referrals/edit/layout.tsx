import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Edit Referral Settings | Admin Dashboard",
  description: "Update commission rates for the referral program",
}

export default function EditReferralSettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 