export const dynamic = 'force-dynamic';
import { notFound } from "next/navigation"
import Link from "next/link"
import { getInvestmentPlanById } from "@/lib/real-estate/actions/investments"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { 
  PencilIcon, 
  TrendingUpIcon, 
  CalendarIcon, 
  DollarSignIcon, 
  PercentIcon, 
  ClockIcon, 
  ArrowLeftIcon,
  ImageIcon
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface InvestmentPlanDetailPageProps {
  params: {
    id: string
  }
}

export default async function InvestmentPlanDetailPage({ 
  params 
}: InvestmentPlanDetailPageProps) {
  // In Next.js 15, we need to await the params object
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  const { data: plan, success } = await getInvestmentPlanById(id)

  if (!success || !plan) {
    notFound()
  }

  // Format the date
  const createdDate = new Date(plan.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header with breadcrumb */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/admin/properties" className="hover:underline">Properties</Link>
          <span>/</span>
          <Link href="/admin/properties/plans" className="hover:underline">Investment Plans</Link>
          <span>/</span>
          <span>Plan Details</span>
        </div>
        
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <TrendingUpIcon className="mr-2 h-6 w-6 text-primary" />
              {plan.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Investment plan details and information
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/properties/plans">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Plans
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/admin/properties/plans/${id}/edit`}>
                <PencilIcon className="mr-2 h-4 w-4" />
                Edit Plan
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Plan details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Plan Information</CardTitle>
            <CardDescription>Details about this investment plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Description</h3>
              <p className="mt-2 text-muted-foreground">{plan.description}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Plan Type</h3>
              <Badge variant="outline" className="mt-2">
                {plan.type === "SEMI_ANNUAL" ? "Semi-Annual" : "Annual"}
              </Badge>
            </div>
            
            {plan.image && (
              <div>
                <h3 className="text-lg font-medium">Plan Image</h3>
                <div className="mt-2 relative aspect-video rounded-md overflow-hidden border">
                  {/* eslint-disable @next/next/no-img-element */}
<img 
                    src={plan.image} 
                    alt={plan.name}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.currentTarget.src = "";
                      e.currentTarget.classList.add("bg-muted");
                      e.currentTarget.parentElement?.classList.add("flex", "items-center", "justify-center");
                      const icon = document.createElement("div");
                      icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
                      e.currentTarget.parentElement?.appendChild(icon);
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSignIcon className="h-5 w-5 text-muted-foreground mr-2" />
                  <span>Minimum Investment</span>
                </div>
                <span className="font-medium">{formatCurrency(plan.minAmount)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSignIcon className="h-5 w-5 text-muted-foreground mr-2" />
                  <span>Maximum Investment</span>
                </div>
                <span className="font-medium">{formatCurrency(plan.maxAmount)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <PercentIcon className="h-5 w-5 text-muted-foreground mr-2" />
                  <span>Return Rate</span>
                </div>
                <Badge variant="secondary" className="text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400">
                  {(plan.returnRate * 100).toFixed(1)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-muted-foreground mr-2" />
                  <span>Created On</span>
                </div>
                <span className="font-medium">{createdDate}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-muted-foreground mr-2" />
                  <span>Contract Duration</span>
                </div>
                <span className="font-medium">
                  {plan.type === "SEMI_ANNUAL" ? "6 months" : "12 months"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 