import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { MarketingLayout } from '@/components/shared/marketing-layout'
import { realEstateImage, placeholderImage } from '@/lib/marketing-images'
import { Building2, LineChart, Shield, TrendingUp, Home, MapPin, BarChart3 } from 'lucide-react'
import { getProperties } from '@/lib/real-estate/actions/properties'
import { PropertyStatus } from '@prisma/client'

export default async function PropertyInvestmentsPage() {
  // Fetch featured properties from the database
  const propertiesResponse = await getProperties({
    status: PropertyStatus.AVAILABLE
  })
  
  // Get up to 6 properties for display
  const featuredProperties = propertiesResponse.success && propertiesResponse.data ? 
    propertiesResponse.data.slice(0, 6) : []

  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="relative min-h-screen max-h-[900px] flex items-center bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Premium Real Estate Investments
            </h1>
            <p className="text-xl mb-8">
              Access exclusive real estate opportunities with strong appreciation potential and stable rental income across global markets.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button asChild size="lg" className="bg-white hover:bg-white/90 text-primary font-semibold">
                <Link href="/register">Start Investing</Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold border-0">
                <Link href="/contact">Contact Our Team</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative h-80 md:h-96 rounded-lg overflow-hidden shadow-md">
              <Image 
                src={realEstateImage || placeholderImage} 
                alt="Premium Real Estate Investments" 
                fill 
                className="object-cover"
                unoptimized
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6">Real Estate Investment Overview</h2>
              <p className="text-gray-700 mb-4">
                At StratWealth Capital, we provide access to premium real estate investment opportunities that are typically only available to institutional investors. Our properties are carefully selected for their potential to generate both rental income and capital appreciation.
              </p>
              <p className="text-gray-700 mb-6">
                Our team of real estate experts conducts thorough due diligence on each property, analyzing location quality, market trends, tenant profiles, and potential for value-add improvements.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-primary mb-1">8-12%</div>
                  <p className="text-sm text-gray-700">Average Annual Return</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-primary mb-1">$100M+</div>
                  <p className="text-sm text-gray-700">Assets Under Management</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Types Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Real Estate Investment Types</h2>
            <p className="text-gray-700 max-w-3xl mx-auto">
              We offer a diverse range of real estate investment opportunities across different property types and markets.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Commercial Properties</h3>
              <p className="text-gray-700 mb-6">
                Premium office buildings, retail centers, and industrial facilities in major metropolitan areas with strong tenant profiles and long-term leases.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  Class A office buildings in financial districts
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  High-traffic retail locations in urban centers
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  Modern logistics facilities near transportation hubs
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Home className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Residential Developments</h3>
              <p className="text-gray-700 mb-6">
                Multi-family apartment complexes, student housing, and senior living communities in high-growth markets with strong demographic trends.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  Luxury apartment buildings in urban centers
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  Purpose-built student housing near major universities
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  Senior living communities in retirement destinations
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Value-Add Opportunities</h3>
              <p className="text-gray-700 mb-6">
                Properties with potential for significant value enhancement through renovations, repositioning, or improved management strategies.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  Underperforming assets with renovation potential
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  Properties in emerging neighborhoods
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  Distressed assets with turnaround potential
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Featured Investment Properties</h2>
            <p className="text-gray-700 max-w-3xl mx-auto">
              Explore some of our current real estate investment opportunities available to qualified investors.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProperties.length > 0 ? (
              featuredProperties.map((property) => (
                <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative h-48">
                    <Image 
                      src={property.mainImage || placeholderImage} 
                      alt={property.name} 
                      fill 
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold">{property.name}</h3>
                      <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                        {property.status}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-700 text-sm mb-4">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{property.location}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="font-bold text-primary">${property.price.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Property ID</p>
                        <p className="font-bold">{property.id.substring(0, 8)}</p>
                      </div>
                    </div>
                    <Button asChild className="w-full bg-primary text-white hover:bg-primary/90">
                      <Link href={`/real-estate/property/${property.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              // Fallback for when no properties are available
              <div className="col-span-3 flex h-60 items-center justify-center rounded-lg border border-dashed bg-muted/20">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">No properties available at the moment</p>
                  <p className="text-xs text-muted-foreground">Please check back later for new investment opportunities</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-10 text-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold">
              <Link href="/real-estate/properties">View All Properties</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Diversify Your Portfolio?</h2>
            <p className="text-xl mb-8">
              Join thousands of investors who are already growing their wealth through premium real estate investments.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button asChild size="lg" className="bg-white hover:bg-white/90 text-primary font-semibold">
                <Link href="/register">Start Investing</Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold border-0">
                <Link href="/contact">Schedule a Consultation</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
