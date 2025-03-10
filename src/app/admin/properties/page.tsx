import { Suspense } from "react"
import Link from "next/link"
import { getAdminProperties } from "@/lib/real-estate/actions/properties"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PropertyStatusBadge } from "@/components/admin/properties/property-status-badge"
import { PropertyTable } from "@/components/admin/properties/property-table"
import { PlusIcon, HomeIcon, CheckCircleIcon, TagIcon, FilterIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils"
import type { Property } from "@/lib/real-estate/types"

function PropertiesLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-8 w-64 animate-pulse rounded bg-muted"></div>
        <div className="h-10 w-32 animate-pulse rounded bg-muted"></div>
      </div>
      <div className="h-96 animate-pulse rounded-lg bg-muted"></div>
    </div>
  )
}

export default async function AdminPropertiesPage() {
  const { data: propertiesData = [], success } = await getAdminProperties()
  
  // Convert properties to the expected type
  const properties: Property[] = propertiesData.map(p => ({
    ...p,
    price: Number(p.price),
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt)
  }))
  
  // Calculate total property value
  const totalValue = properties.reduce((sum, property) => sum + property.price, 0);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <HomeIcon className="mr-2 h-6 w-6 text-primary" />
            Properties Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all properties in your portfolio
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/properties/new">
            <PlusIcon className="mr-2 h-5 w-5" />
            Add New Property
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription>Total Properties</CardDescription>
            <CardTitle className="text-3xl">{properties.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Properties in your portfolio
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900/30">
          <CardHeader className="pb-2">
            <CardDescription>Available Properties</CardDescription>
            <CardTitle className="text-3xl text-green-600 dark:text-green-400">
              {properties.filter(p => p.status === "AVAILABLE").length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground flex items-center">
              <CheckCircleIcon className="h-4 w-4 mr-1 text-green-500" />
              Ready for investment
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900/30">
          <CardHeader className="pb-2">
            <CardDescription>Sold Properties</CardDescription>
            <CardTitle className="text-3xl text-blue-600 dark:text-blue-400">
              {properties.filter(p => p.status === "SOLD").length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Successfully sold properties
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/30">
          <CardHeader className="pb-2">
            <CardDescription>Total Portfolio Value</CardDescription>
            <CardTitle className="text-3xl text-amber-600 dark:text-amber-400">
              {formatCurrency(totalValue)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground flex items-center">
              <TagIcon className="h-4 w-4 mr-1 text-amber-500" />
              Combined property value
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
          <TabsList className="bg-muted/60">
            <TabsTrigger value="all">All Properties</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="sold">Sold</TabsTrigger>
          </TabsList>
          
          <div className="relative w-full sm:w-auto">
            <FilterIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search properties..." 
              className="pl-9 w-full sm:w-[250px]" 
            />
          </div>
        </div>
        
        <TabsContent value="all" className="m-0">
          <Suspense fallback={<PropertiesLoading />}>
            <PropertyTable properties={properties} />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="available" className="m-0">
          <Suspense fallback={<PropertiesLoading />}>
            <PropertyTable properties={properties.filter(p => p.status === "AVAILABLE")} />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="pending" className="m-0">
          <Suspense fallback={<PropertiesLoading />}>
            <PropertyTable properties={properties.filter(p => p.status === "PENDING")} />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="sold" className="m-0">
          <Suspense fallback={<PropertiesLoading />}>
            <PropertyTable properties={properties.filter(p => p.status === "SOLD")} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
} 