import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { heroBackground } from '@/lib/marketing-images'

interface HeroSectionProps {
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  backgroundImage?: string;
}

export const HeroSection = ({
  title,
  description,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
  backgroundImage = heroBackground
}: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen max-h-[900px] flex items-center bg-gradient-to-r from-secondary to-primary text-white">
      <div className="absolute inset-0 bg-black/30 z-0">
        {/* Add background image with Next.js Image component */}
        <Image 
          src={backgroundImage} 
          alt="StratWealth Capital Investment Background"
          fill
          className="object-cover mix-blend-overlay opacity-50"
          priority
          unoptimized
        />
      </div>
      <div className="container mx-auto px-4 relative z-10 py-20">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {title}
          </h1>
          <p className="text-xl mb-8">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium">
              <Link href={primaryButtonLink}>{primaryButtonText}</Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="bg-white/10 hover:bg-white/30 text-white hover:text-white border border-white/50">
              <Link href={secondaryButtonLink}>{secondaryButtonText}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
