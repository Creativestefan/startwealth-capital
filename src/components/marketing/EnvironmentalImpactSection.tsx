import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface EnvironmentalImpactSectionProps {
  title: string
  description: string
  buttonText?: string
  buttonLink?: string
}

export function EnvironmentalImpactSection({
  title,
  description,
  buttonText,
  buttonLink,
}: EnvironmentalImpactSectionProps) {
  return (
    <section className="py-16 bg-green-50 dark:bg-green-950/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{title}</h2>
          <p className="text-lg text-muted-foreground mb-8">{description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">500,000+</h3>
              <p className="text-muted-foreground text-center">Tons of CO2 emissions reduced through our green energy investments</p>
            </div>
            
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">100+</h3>
              <p className="text-muted-foreground text-center">Sustainable development projects funded across the globe</p>
            </div>
            
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">$50M+</h3>
              <p className="text-muted-foreground text-center">Invested in renewable energy and sustainable infrastructure</p>
            </div>
          </div>
          
          {buttonText && buttonLink && (
            <div className="mt-8">
              <Button asChild variant="secondary" size="lg">
                <Link href={buttonLink}>{buttonText}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
