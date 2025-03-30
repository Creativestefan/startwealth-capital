import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { MarketingLayout } from '@/components/shared/marketing-layout'
import { greenEnergyImage, placeholderImage } from '@/lib/marketing-images'
import { BatteryCharging, Wind, Sun, Leaf, BarChart3, Zap } from 'lucide-react'
import { getAllEquipment } from '@/lib/green-energy/actions/equipment'
import { EquipmentStatus } from '@prisma/client'
import type { SerializedEquipment } from '@/lib/green-energy/types'

// Force dynamic rendering to ensure we get fresh data on each request
export const dynamic = 'force-dynamic';

export default async function GreenEnergyInvestmentsPage() {
  let featuredEquipment: SerializedEquipment[] = [];
  
  try {
    const equipmentResponse = await getAllEquipment()
    featuredEquipment = equipmentResponse.success && equipmentResponse.data ? 
      equipmentResponse.data
        .filter(equipment => equipment.status === EquipmentStatus.AVAILABLE)
        .slice(0, 6) : []
  } catch (error) {
    console.error('Error fetching equipment:', error)
  }

  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="relative min-h-screen max-h-[900px] flex items-center bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Green Energy Investments
            </h1>
            <p className="text-xl mb-8">
              Invest in a sustainable future with our curated portfolio of renewable energy projects and equipment.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button asChild size="lg" className="bg-white hover:bg-white/90 text-primary font-semibold">
                <Link href="/register">Start Investing</Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="bg-green-500 hover:bg-green-600 text-white font-semibold border-0">
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
                src={greenEnergyImage || placeholderImage} 
                alt="Green Energy Solutions" 
                fill 
                className="object-cover"
                unoptimized
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6">Green Energy Investment Overview</h2>
              <p className="text-gray-700 mb-4">
                StratWealth Capital offers innovative ways to invest in the growing green energy sector, from solar and wind projects to energy-efficient equipment and infrastructure.
              </p>
              <p className="text-gray-700 mb-6">
                Our green energy portfolio is designed to provide attractive returns while contributing to a more sustainable and environmentally friendly future.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-primary mb-1">12-18%</div>
                  <p className="text-sm text-gray-700">Average Annual Return</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-primary mb-1">$50M+</div>
                  <p className="text-sm text-gray-700">Green Energy Assets</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Types Section */}
      <section className="py-20 bg-gradient-to-r from-green-50 to-teal-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Green Energy Solutions</h2>
            <p className="text-gray-700 max-w-3xl mx-auto">
              We offer a diverse range of green energy investment opportunities to suit different investor preferences and goals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Sun className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Solar Energy</h3>
              <p className="text-gray-700 mb-6">
                Invest in solar farms and panels that generate clean electricity from the sun's rays, providing steady returns from energy production.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  Utility-scale solar farms
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  Commercial rooftop installations
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  Target return: 12-16% annually
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Wind className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Wind Energy</h3>
              <p className="text-gray-700 mb-6">
                Participate in wind farm projects that harness the power of wind to generate renewable electricity with minimal environmental impact.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  Onshore wind farms
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  Small-scale turbine installations
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  Target return: 14-18% annually
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <BatteryCharging className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Energy Storage</h3>
              <p className="text-gray-700 mb-6">
                Invest in cutting-edge battery storage solutions that help balance energy supply and demand, making renewable energy more reliable.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  Grid-scale battery systems
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  Residential energy storage
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  Target return: 15-20% annually
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Equipment Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Featured Green Energy Equipment</h2>
            <p className="text-gray-700 max-w-3xl mx-auto">
              Explore our selection of high-quality green energy equipment available for purchase and investment.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredEquipment.length > 0 ? (
              featuredEquipment.map((equipment) => {
                // Parse the features and images from JSON
                const features = typeof equipment.features === 'string' ? 
                  JSON.parse(equipment.features) : equipment.features;
                const images = typeof equipment.images === 'string' ? 
                  JSON.parse(equipment.images) : equipment.images;
                const mainImage = images && images.length > 0 ? images[0] : placeholderImage;
                
                return (
                  <div key={equipment.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="relative h-48">
                      <Image 
                        src={mainImage || placeholderImage} 
                        alt={equipment.name} 
                        fill 
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">{equipment.name}</h3>
                        <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                          {equipment.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                        {equipment.description}
                      </p>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <p className="text-sm text-gray-500">Price</p>
                          <p className="font-bold text-primary">${Number(equipment.price).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Stock</p>
                          <p className="font-bold">{equipment.stockQuantity} units</p>
                        </div>
                      </div>
                      <Button asChild className="w-full bg-primary text-white hover:bg-primary/90">
                        <Link href={`/green-energy-investments/equipment/${equipment.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                )
              })
            ) : (
              // Fallback for when no equipment is available
              <div className="col-span-3 flex h-60 items-center justify-center rounded-lg border border-dashed bg-muted/20">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">No equipment available at the moment</p>
                  <p className="text-xs text-muted-foreground">Please check back later for new equipment offerings</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-10 text-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold">
              <Link href="/green-energy-investments/equipment">View All Equipment</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-gradient-to-r from-green-50 to-teal-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Environmental Impact</h2>
// eslint-disable-next-line react/no-unescaped-entities
              <p className="text-gray-700 mb-6">
                When you invest in green energy with StratWealth Capital, you're not just earning returns – you're also making a positive impact on the environment and helping to combat climate change.
              </p>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">CO₂ Emissions Avoided</span>
                    <span className="font-bold text-primary">125,000+ tons</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-gradient-to-r from-green-600 to-teal-600 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Clean Energy Generated</span>
                    <span className="font-bold text-primary">250+ GWh</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-gradient-to-r from-green-600 to-teal-600 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Households Powered</span>
                    <span className="font-bold text-primary">75,000+</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-gradient-to-r from-green-600 to-teal-600 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">15+</div>
                <p className="text-gray-700">Green Energy Projects</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">100MW+</div>
                <p className="text-gray-700">Total Capacity</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">15%</div>
                <p className="text-gray-700">Average Return</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sun className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">5+</div>
                <p className="text-gray-700">Years of Operation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Start Your Green Energy Investment Journey</h2>
            <p className="text-xl mb-8">
              Join StratWealth Capital today and be part of the renewable energy revolution while earning attractive returns.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button asChild size="lg" className="bg-white hover:bg-white/90 text-primary font-semibold">
                <Link href="/register">Start Investing</Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="bg-green-500 hover:bg-green-600 text-white font-semibold border-0">
                <Link href="/contact">Schedule a Consultation</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
