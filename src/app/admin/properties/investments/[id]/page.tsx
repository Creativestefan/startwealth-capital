import { notFound } from "next/navigation"
import Link from "next/link"
import { getInvestmentById } from "@/lib/real-estate/actions/investments"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { 
  ArrowLeftIcon,
  CalendarIcon, 
  DollarSignIcon, 
  PercentIcon, 
  ClockIcon,
  UserIcon,
  MailIcon,
  CheckCircleIcon,
  XCircleIcon
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface InvestmentDetailPageProps {
  params: {
    id: string
  }
}

export default async function InvestmentDetailPage({ 
  params 
}: InvestmentDetailPageProps) {
  // In Next.js 15, we need to await the params object
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  const { data: investment, success } = await getInvestmentById(id)

  if (!success || !investment) {
    notFound()
  }

  // Format the dates
  const startDate = new Date(investment.startDate).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const endDate = new Date(investment.endDate).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const createdDate = new Date(investment.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Format user name
  const formatUserName = (user: any) => {
    if (!user) return "Unknown User";
    
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    
    if (firstName) {
      return firstName;
    }
    
    if (lastName) {
      return lastName;
    }
    
    return user.email || "Unknown User";
  };

  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Active</Badge>
      case "MATURED":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Matured</Badge>
      case "WITHDRAWN":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Withdrawn</Badge>
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Function to get investment type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "SEMI_ANNUAL":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Semi-Annual</Badge>
      case "ANNUAL":
        return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">Annual</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header with breadcrumb */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/admin/properties" className="hover:underline">Properties</Link>
          <span>/</span>
          <Link href="/admin/properties/transactions" className="hover:underline">Transactions</Link>
          <span>/</span>
          <span>Investment Details</span>
        </div>
        
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <DollarSignIcon className="mr-2 h-6 w-6 text-primary" />
              Investment Details
            </h1>
            <p className="text-muted-foreground mt-1">
              Detailed information about this investment
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/properties/transactions">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Transactions
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Investment details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Investment Information</CardTitle>
            <CardDescription>Details about this investment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Investment ID</h3>
                <p className="mt-1 font-mono text-sm">{investment.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <div className="mt-1">{getStatusBadge(investment.status)}</div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                <div className="mt-1">{getTypeBadge(investment.type)}</div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Created On</h3>
                <p className="mt-1">{createdDate}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Amount Invested</h3>
                <p className="mt-1 text-lg font-semibold">{formatCurrency(Number(investment.amount))}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Expected Return</h3>
                <p className="mt-1 text-lg font-semibold text-green-600">{formatCurrency(Number(investment.expectedReturn))}</p>
              </div>
              {investment.actualReturn !== null && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Actual Return</h3>
                  <p className="mt-1 text-lg font-semibold text-green-600">{formatCurrency(Number(investment.actualReturn))}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Auto Reinvest</h3>
                <p className="mt-1 flex items-center">
                  {investment.reinvest ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                      Yes
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-4 w-4 text-red-500 mr-1" />
                      No
                    </>
                  )}
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Start Date</h3>
                <p className="mt-1">{startDate}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">End Date</h3>
                <p className="mt-1">{investment.status === "ACTIVE" ? "Active" : endDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* User info */}
        <Card>
          <CardHeader>
            <CardTitle>Investor Information</CardTitle>
            <CardDescription>Details about the investor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {investment.user ? (
              <>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                  <p className="mt-1 flex items-center">
                    <UserIcon className="h-4 w-4 text-muted-foreground mr-2" />
                    {formatUserName(investment.user)}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <p className="mt-1 flex items-center">
                    <MailIcon className="h-4 w-4 text-muted-foreground mr-2" />
                    {investment.user.email}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">User ID</h3>
                  <p className="mt-1 font-mono text-xs">{investment.userId}</p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">User information not available</p>
            )}
            
            <Separator />
            
            <div className="pt-2">
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href={`/admin/users/${investment.userId}`}>
                  View User Profile
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 