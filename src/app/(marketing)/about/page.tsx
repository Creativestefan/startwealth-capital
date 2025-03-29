import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Building2, Leaf, LineChart, Shield, Users, Award, Globe } from 'lucide-react'
import { MarketingLayout } from '@/components/shared/marketing-layout'
import {
  companyImage,
  teamMember1,
  teamMember2,
  teamMember3,
  globalImpactImage,
  placeholderImage
} from '@/lib/marketing-images'

export default function AboutPage() {
  return (
    <MarketingLayout>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-screen max-h-[900px] flex items-center bg-gradient-to-r from-secondary to-primary text-white py-20">
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                About 
                <span className="text-primary"> StratWealth</span> Capital
              </h1>
              <p className="text-xl text-gray-200 mb-8">
                A leading investment platform focused on sustainable wealth creation through diverse asset classes.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="relative h-80 md:h-96 rounded-lg overflow-hidden shadow-md">
                <Image 
                  src={companyImage || placeholderImage} 
                  alt="StratWealth Capital Company" 
                  fill 
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                <p className="text-gray-700 mb-4">
                  Founded in 2018, StratWealth Capital was established with a clear mission: to democratize access to premium investment opportunities while promoting sustainable development.
                </p>
                <p className="text-gray-700 mb-4">
                  What began as a small team of financial experts and sustainability advocates has grown into a comprehensive investment platform managing over $250 million in assets across three major categories: real estate, green energy, and financial markets.
                </p>
                <p className="text-gray-700">
                  Our approach combines rigorous financial analysis with strict environmental and social governance criteria, ensuring that our investors can grow their wealth while contributing to a more sustainable future.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="py-20 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
              <p className="text-gray-700 max-w-3xl mx-auto">
                These principles guide every investment decision and interaction at StratWealth Capital.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">Integrity</h3>
                <p className="text-gray-700">
                  We maintain the highest standards of honesty and transparency in all our operations, providing clear information about investment performance, risks, and fees.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Leaf className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">Sustainability</h3>
                <p className="text-gray-700">
                  We believe that financial returns and positive environmental impact can go hand in hand, and we prioritize investments that contribute to a more sustainable world.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">Client Focus</h3>
                <p className="text-gray-700">
                  Our investors are at the heart of everything we do. We're committed to understanding their goals and providing personalized investment solutions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Leadership Team Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Our Leadership Team</h2>
// eslint-disable-next-line react/no-unescaped-entities
              <p className="text-gray-700 max-w-3xl mx-auto">
                Meet the experienced professionals guiding StratWealth Capital's investment strategy and operations.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Team Member 1 */}
              <div className="text-center bg-white p-8 rounded-lg shadow-md">
                <div className="w-40 h-40 rounded-full mx-auto mb-6 relative overflow-hidden">
                  <Image 
                    src={teamMember1 || placeholderImage} 
                    alt="Jonathan Reynolds" 
                    fill 
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <h3 className="text-xl font-bold mb-1">Jonathan Reynolds</h3>
                <p className="text-primary mb-4">Chief Executive Officer</p>
                <p className="text-gray-700">
                  Former investment banker with 20+ years of experience in sustainable finance and asset management.
                </p>
              </div>
              
              {/* Team Member 2 */}
              <div className="text-center bg-white p-8 rounded-lg shadow-md">
                <div className="w-40 h-40 rounded-full mx-auto mb-6 relative overflow-hidden">
                  <Image 
                    src={teamMember2 || placeholderImage} 
                    alt="Sophia Chen" 
                    fill 
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <h3 className="text-xl font-bold mb-1">Sophia Chen</h3>
                <p className="text-primary mb-4">Chief Investment Officer</p>
                <p className="text-gray-700">
                  Seasoned portfolio manager specializing in ESG investments and alternative asset classes.
                </p>
              </div>
              
              {/* Team Member 3 */}
              <div className="text-center bg-white p-8 rounded-lg shadow-md">
                <div className="w-40 h-40 rounded-full mx-auto mb-6 relative overflow-hidden">
                  <Image 
                    src={teamMember3 || placeholderImage} 
                    alt="Marcus Williams" 
                    fill 
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <h3 className="text-xl font-bold mb-1">Marcus Williams</h3>
                <p className="text-primary mb-4">Head of Sustainability</p>
                <p className="text-gray-700">
                  Environmental scientist and financial analyst ensuring our investments meet rigorous ESG criteria.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Global Impact Section */}
        <section className="py-20 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Global Impact</h2>
                <p className="text-gray-700 mb-6">
                  At StratWealth Capital, we measure our success not just by financial returns, but by the positive impact our investments have on communities and the environment worldwide.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="text-3xl font-bold text-primary mb-2">50+</div>
                    <p className="text-gray-700">Renewable Energy Projects</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="text-3xl font-bold text-primary mb-2">$100M+</div>
                    <p className="text-gray-700">Sustainable Real Estate</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="text-3xl font-bold text-primary mb-2">12</div>
                    <p className="text-gray-700">Countries with Active Investments</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="text-3xl font-bold text-primary mb-2">5,000+</div>
                    <p className="text-gray-700">Jobs Created</p>
                  </div>
                </div>
              </div>
              <div className="relative h-80 md:h-96 rounded-lg overflow-hidden shadow-md">
                <Image 
                  src={globalImpactImage || placeholderImage} 
                  alt="Global Impact" 
                  fill 
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </section>

        {/* Recognition Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Awards & Recognition</h2>
              <p className="text-gray-700 max-w-3xl mx-auto">
                Our commitment to excellence has been recognized by leading industry organizations.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <Award className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Best Sustainable Investment Platform</h3>
                <p className="text-primary mb-2">Financial Innovation Awards 2024</p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <Award className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Top 10 Green Investment Companies</h3>
                <p className="text-primary mb-2">Sustainable Finance Review 2023</p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <Award className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Excellence in Investment Management</h3>
                <p className="text-primary mb-2">Global Finance Awards 2022</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20 overflow-hidden bg-gradient-to-r from-blue-600 to-green-600 text-white">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Our Investment Community</h2>
              <p className="text-xl mb-8">
                Start your journey with StratWealth Capital today and be part of a growing community of investors making a difference.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Button asChild size="lg" className="bg-white hover:bg-white/90 text-primary font-semibold">
                  <Link href="/register">Create Account</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10 font-semibold">
                  <Link href="/contact">Contact Our Team</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </MarketingLayout>
  )
}
