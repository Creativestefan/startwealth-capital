import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeftIcon, BarChart3Icon, TrendingUpIcon, HomeIcon, DollarSignIcon } from "lucide-react"
import { getPropertyStats } from "@/lib/real-estate/actions/properties"

export default async function PropertyAnalyticsPage() {
  // Fetch property statistics
  const { data: stats, success } = await getPropertyStats()
  
  // Default values in case the API call fails
  const propertyStats = success ? stats : {
    totalProperties: 0,
    availableProperties: 0,
    soldProperties: 0,
    totalValue: 0,
    averagePrice: 0,
    recentSales: []
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header with breadcrumb */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/admin/properties" className="hover:underline">Properties</Link>
          <span>/</span>
          <span>Analytics</span>
        </div>
        
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <BarChart3Icon className="mr-2 h-6 w-6 text-primary" />
              Property Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              Overview and statistics for all properties
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/properties">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Properties
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <HomeIcon className="h-5 w-5 text-primary mr-2" />
              <span className="text-2xl font-bold">{propertyStats.totalProperties}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <HomeIcon className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-2xl font-bold">{propertyStats.availableProperties}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sold Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <HomeIcon className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-2xl font-bold">{propertyStats.soldProperties}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSignIcon className="h-5 w-5 text-primary mr-2" />
              <span className="text-2xl font-bold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0
                }).format(propertyStats.averagePrice)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total Value Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUpIcon className="h-5 w-5 mr-2 text-primary" />
            Total Property Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0
            }).format(propertyStats.totalValue)}
          </div>
          <p className="text-muted-foreground mt-2">
            Combined value of all properties in the system
          </p>
        </CardContent>
      </Card>

      {/* Placeholder for charts and more detailed analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Property Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            <div className="text-muted-foreground text-center">
              <BarChart3Icon className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p>Chart visualization will be implemented here</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            <div className="text-muted-foreground text-center">
              <TrendingUpIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p>Chart visualization will be implemented here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 