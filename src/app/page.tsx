export const dynamic = 'force-dynamic';

import React from 'react'
import { MarketingLayout } from '@/components/shared/marketing-layout'
import { HeroSection } from '@/components/marketing/HeroSection'
import { ServicesSection } from '@/components/marketing/ServicesSection'
import { WhyChooseUsSection } from '@/components/marketing/WhyChooseUsSection'
import { EnvironmentalImpactSection } from '@/components/marketing/EnvironmentalImpactSection'
import { TestimonialsSection } from '@/components/marketing/TestimonialsSection'
import { CTASection } from '@/components/marketing/CTASection'
import {
  partnerLogo1,
  partnerLogo2,
  partnerLogo3,
  partnerLogo4,
  partnerLogo5
} from '@/lib/marketing-images'

export default function MarketingPage() {
  return (
    <MarketingLayout>
      {/* Hero Section */}
      <HeroSection 
        title="Sustainable Investments for a Profitable Future"
        description="Invest in high-yield real estate, green energy projects, and financial markets with StratWealth Capital, your gateway to sustainable wealth creation."
        primaryButtonText="Start Investing Now"
        primaryButtonLink="/register"
        secondaryButtonText="Learn More"
        secondaryButtonLink="/about"
      />

      {/* Trusted Partners Section */}
      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-xl font-medium text-muted-foreground mb-8">Trusted by Industry Leaders</h2>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {[partnerLogo1, partnerLogo2, partnerLogo3, partnerLogo4, partnerLogo5].map((logo, index) => (
              <div key={index} className="w-32 h-16 relative grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
                {/* eslint-disable @next/next/no-img-element */}
<img src={logo} alt={`Partner ${index + 1}`} className="object-contain w-full h-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Opportunities Section */}
      <ServicesSection 
        title="Our Investment Opportunities"
        description="Discover diverse investment options designed to generate attractive returns while supporting sustainable development and innovation."
      />

      {/* Why Choose Us Section */}
      <WhyChooseUsSection 
        title="Why Choose StratWealth Capital"
        description="We combine sustainable investing principles with robust financial strategies to provide our investors with superior returns and peace of mind."
      />

      {/* Environmental Impact Section */}
      <EnvironmentalImpactSection 
        title="Our Environmental Impact"
        description="Our investments have helped reduce carbon emissions by over 500,000 tons while providing sustainable returns to our investors."
        buttonText="Learn More"
        buttonLink="/about"
      />

      {/* Testimonials Section */}
      <TestimonialsSection 
        title="What Our Investors Say"
        description="Hear from our community of investors about their experience with StratWealth Capital."
      />

      {/* CTA Section */}
      <CTASection 
        title="Ready to Start Your Investment Journey?"
        description="Join thousands of investors who are already growing their wealth sustainably with StratWealth Capital. Create your account today and access our full range of investment opportunities."
        primaryButtonText="Create Account"
        primaryButtonLink="/register"
        secondaryButtonText="Login"
        secondaryButtonLink="/login"
      />
    </MarketingLayout>
  )
}
