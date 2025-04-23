import React from 'react'
import Link from 'next/link'
import { Building2, Leaf, LineChart } from 'lucide-react'

interface Service {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

interface ServicesSectionProps {
  title: string;
  description: string;
  services?: Service[];
}

export const ServicesSection = ({ 
  title, 
  description, 
  services = [
    {
      title: "Real Estate",
      description: "Invest in premium properties worldwide with high appreciation potential and rental yields.",
      icon: <Building2 className="h-8 w-8 text-primary" />,
      href: "/real-estate"
    },
    {
      title: "Green Energy",
      description: "Support sustainable energy projects while earning competitive returns on your investment.",
      icon: <Leaf className="h-8 w-8 text-primary" />,
      href: "/green-energy"
    },
    {
      title: "Financial Markets",
      description: "Diversify with our expertly managed market portfolios designed for various risk appetites.",
      icon: <LineChart className="h-8 w-8 text-primary" />,
      href: "/markets"
    }
  ] 
}: ServicesSectionProps) => {
  return (
    <section className="py-20 bg-gradient-to-r from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            {description}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Link 
              href={service.href} 
              key={index}
              className="group p-8 rounded-lg border border-primary/10 bg-card shadow-sm hover:shadow-md transition-all hover:border-primary/30"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold mb-4">{service.title}</h3>
              <p className="text-muted-foreground mb-6">{service.description}</p>
              <div className="flex items-center text-primary font-medium">
                <span>Learn more</span>
                <span className="ml-2 group-hover:ml-3 transition-all">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
