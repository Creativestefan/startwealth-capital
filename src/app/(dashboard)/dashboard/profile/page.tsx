import { redirect } from "next/navigation"

export default function DashboardProfilePage({ searchParams }: { searchParams: { tab?: string } }) {
  // Get the tab from the URL query parameters
  const tab = searchParams.tab || "account"
  
  // Redirect to the appropriate profile page
  if (tab === "kyc") {
    redirect("/profile/kyc")
  } else if (tab === "password") {
    redirect("/profile/password") 
  } else if (tab === "referrals") {
    redirect("/profile/referrals")
  } else {
    // Default to account tab
    redirect("/profile/account")
  }
} 