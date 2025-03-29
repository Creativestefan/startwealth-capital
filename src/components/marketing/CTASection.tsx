import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ctaBackgroundImage, placeholderImage } from '@/lib/marketing-images'

interface CTASectionProps {
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  backgroundImage?: string;
  stats?: {
    value: string;
    label: string;
  }[];
}

export const CTASection = ({
  title = "Ready to Start Your Investment Journey?",
  description = "Join thousands of investors who are already growing their wealth sustainably with StratWealth Capital. Create your account today and access our full range of investment opportunities.",
  primaryButtonText = "Create Account",
  primaryButtonLink = "/register",
  secondaryButtonText = "Login",
  secondaryButtonLink = "/login",
  backgroundImage = ctaBackgroundImage || placeholderImage,
  stats = [
    { value: "$250M+", label: "Assets Under Management" },
    { value: "12.5%", label: "Average Annual Return" },
    { value: "5,000+", label: "Satisfied Investors" }
  ]
}: CTASectionProps) => {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <Image 
          src={backgroundImage} 
          alt="Investment Background" 
          fill 
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 to-primary/90"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{title}</h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl">
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
          <div className="md:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -top-5 -left-5 w-24 h-24 bg-accent/20 rounded-full"></div>
              <div className="absolute -bottom-5 -right-5 w-32 h-32 bg-primary/20 rounded-full"></div>
              <div className="relative z-10 border-0 shadow-xl bg-card/95 p-6 backdrop-blur-sm rounded-lg">
                <div className="text-center">
                  {stats.map((stat, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && <div className="h-px w-16 bg-muted mx-auto mb-4"></div>}
                      <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-accent text-3xl">{index === 0 ? "📈" : index === 1 ? "💹" : "👥"}</span>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{stat.value}</h3>
                      <p className="text-muted-foreground mb-4">{stat.label}</p>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
