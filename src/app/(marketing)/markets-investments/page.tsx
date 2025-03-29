import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { MarketingLayout } from '@/components/shared/marketing-layout'
import { marketsImage, placeholderImage } from '@/lib/marketing-images'
import { BarChart3, TrendingUp, LineChart, PieChart, DollarSign, Percent } from 'lucide-react'
import { getInvestmentPlans } from '@/lib/real-estate/actions/investments'
import { InvestmentStatus } from '@prisma/client'

// Force dynamic rendering to ensure we get fresh data on each request
export const dynamic = 'force-dynamic';

export default async function MarketsInvestmentsPage() {
  let featuredPlans = [];
  
  try {
    const plansResponse = await getInvestmentPlans()
    featuredPlans = plansResponse.success && plansResponse.data ? 
      plansResponse.data
        .filter((plan: any) => plan.status === InvestmentStatus.ACTIVE)
        .slice(0, 6) : []
  } catch (error) {
    console.error('Error fetching investment plans:', error)
  }

  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="relative min-h-screen max-h-[900px] flex items-center bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Financial Markets Investments
            </h1>
            <p className="text-xl mb-8">
              Diversify your portfolio with our curated selection of financial market investment plans.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button asChild size="lg" className="bg-white hover:bg-white/90 text-primary font-semibold">
                <Link href="/register">Start Investing</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10 font-semibold">
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
                src={marketsImage || placeholderImage} 
                alt="Financial Markets Investments" 
                fill 
                className="object-cover"
                unoptimized
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6">Markets Investment Overview</h2>
              <p className="text-gray-700 mb-4">
                StratWealth Capital offers sophisticated investment strategies across global financial markets, designed to generate attractive risk-adjusted returns regardless of market conditions.
              </p>
              <p className="text-gray-700 mb-6">
                Our team of experienced portfolio managers employs a disciplined investment process, combining fundamental analysis, technical indicators, and macroeconomic insights to identify opportunities and manage risk.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-primary mb-1">10-15%</div>
                  <p className="text-sm text-gray-700">Average Annual Return</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-primary mb-1">$75M+</div>
                  <p className="text-sm text-gray-700">Assets Under Management</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Strategies Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Market Investment Strategies</h2>
            <p className="text-gray-700 max-w-3xl mx-auto">
              We offer a range of investment strategies to meet different risk profiles and return objectives.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Global Equity Portfolio</h3>
              <p className="text-gray-700 mb-6">
                A diversified portfolio of high-quality companies across developed and emerging markets, focused on long-term capital appreciation.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  Focus on companies with sustainable competitive advantages
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  Diversification across sectors and geographies
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  Target return: 12-18% annually
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Percent className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Income & Preservation</h3>
              <p className="text-gray-700 mb-6">
                A balanced portfolio designed to generate steady income while preserving capital through investments in bonds, dividend stocks, and alternatives.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  High-quality corporate and government bonds
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  Dividend-paying blue-chip stocks
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  Target return: 7-10% annually
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Growth & Innovation</h3>
              <p className="text-gray-700 mb-6">
                A high-growth portfolio focused on innovative companies and sectors with disruptive technologies and business models.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  Investments in technology, healthcare, and clean energy
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  Mix of established leaders and emerging disruptors
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  Target return: 15-25% annually
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Process Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Investment Process</h2>
            <p className="text-gray-700 max-w-3xl mx-auto">
              We follow a disciplined, research-driven approach to portfolio construction and management.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-xl font-bold text-primary">1</div>
              </div>
              <h3 className="text-lg font-bold mb-2">Macro Analysis</h3>
              <p className="text-gray-700">
                We analyze global economic trends, monetary policy, and geopolitical factors to identify favorable investment environments.
              </p>
            </div>
            
            <div className="text-center bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-xl font-bold text-primary">2</div>
              </div>
              <h3 className="text-lg font-bold mb-2">Security Selection</h3>
              <p className="text-gray-700">
                Our analysts conduct thorough fundamental research to identify undervalued securities with strong growth potential.
              </p>
            </div>
            
            <div className="text-center bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-xl font-bold text-primary">3</div>
              </div>
              <h3 className="text-lg font-bold mb-2">Portfolio Construction</h3>
              <p className="text-gray-700">
                We build diversified portfolios with optimal asset allocation based on risk/return objectives and market conditions.
              </p>
            </div>
            
            <div className="text-center bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-xl font-bold text-primary">4</div>
              </div>
              <h3 className="text-lg font-bold mb-2">Active Management</h3>
              <p className="text-gray-700">
                We continuously monitor and adjust portfolios based on changing market conditions and new opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Investments Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Featured Investment Plans</h2>
            <p className="text-gray-700 max-w-3xl mx-auto">
              Explore some of our current market investment opportunities available to qualified investors.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredPlans.length > 0 ? (
              featuredPlans.map((plan: any) => (
                <div key={plan.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative h-48">
                    <Image 
                      src={plan.image || placeholderImage} 
                      alt={plan.name} 
                      fill 
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                      <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                        {plan.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                      {plan.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-gray-500">Return Rate</p>
                        <p className="font-bold text-primary">{Number(plan.returnRate).toFixed(2)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Risk Level</p>
                        <p className="font-bold">{plan.riskLevel}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-gray-500">Min Investment</p>
                        <p className="font-bold">${Number(plan.minAmount).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-bold">{plan.durationMonths} months</p>
                      </div>
                    </div>
                    <Button asChild className="w-full bg-primary text-white hover:bg-primary/90">
                      <Link href={`/markets/investments/plans/${plan.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              // Fallback for when no investment plans are available
              <div className="col-span-3 flex h-60 items-center justify-center rounded-lg border border-dashed bg-muted/20">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">No investment plans available at the moment</p>
                  <p className="text-xs text-muted-foreground">Please check back later for new investment opportunities</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-10 text-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold">
              <Link href="/markets/investments/plans">View All Investment Plans</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Performance Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Performance Track Record</h2>
              <p className="text-gray-700 mb-6">
                Our market investment strategies have consistently outperformed their benchmarks over multiple market cycles. We focus on generating alpha through superior security selection and tactical asset allocation.
              </p>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Global Equity Portfolio</span>
                    <span className="font-bold text-primary">+16.8% (5-year annualized)</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Income & Preservation</span>
                    <span className="font-bold text-primary">+9.2% (5-year annualized)</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Growth & Innovation</span>
                    <span className="font-bold text-primary">+22.5% (5-year annualized)</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LineChart className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">85%</div>
                <p className="text-gray-700">Outperformance vs. Benchmarks</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">12.5%</div>
                <p className="text-gray-700">Average Annual Return</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PieChart className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">$75M+</div>
                <p className="text-gray-700">Assets Under Management</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">8+</div>
                <p className="text-gray-700">Years of Track Record</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Start Building Your Investment Portfolio</h2>
            <p className="text-xl mb-8">
              Join StratWealth Capital today and gain access to our professionally managed market investment strategies.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button asChild size="lg" className="bg-white hover:bg-white/90 text-primary font-semibold">
                <Link href="/register">Start Investing</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10 font-semibold">
                <Link href="/contact">Schedule a Consultation</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
