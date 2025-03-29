export const dynamic = 'force-dynamic';
import { redirect } from "next/navigation"

export default function GreenEnergyDashboardPage() {
  redirect("/admin/green-energy/equipment")
} 