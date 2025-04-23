import React from 'react'
import { TrendingUp, Shield, Leaf, BarChart3, Building2, LineChart } from 'lucide-react'

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface WhyChooseUsSectionProps {
  title: string;
  description: string;
  features?: Feature[];
}

export const WhyChooseUsSection = ({ 
  title, 
  description, 
  features = [
    {
      icon: <TrendingUp className="h-6 w-6 text-primary" />,
      title: "High Returns",
      description: "Our carefully selected investment opportunities consistently deliver above-market returns while managing risk effectively."
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Secure Platform",
      description: "Advanced security measures and transparent reporting protect your investments and provide complete peace of mind."
    },
    {
      icon: <Leaf className="h-6 w-6 text-primary" />,
      title: "Sustainable Focus",
      description: "Every investment opportunity meets strict environmental and social responsibility criteria for guilt-free profits."
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-primary" />,
      title: "Expert Management",
      description: "Our team of seasoned financial analysts and industry specialists ensure optimal allocation and performance."
    },
    {
      icon: <Building2 className="h-6 w-6 text-primary" />,
      title: "Diverse Portfolio",
      description: "Spread your investments across multiple sectors and asset classes to maximize returns while minimizing exposure."
    },
    {
      icon: <LineChart className="h-6 w-6 text-primary" />,
      title: "Transparent Reporting",
      description: "Access detailed performance metrics and portfolio analytics through your personalized dashboard at any time."
    }
  ]
}: WhyChooseUsSectionProps) => {
  return (
    <section className="py-20 bg-gradient-to-r from-secondary/10 to-primary/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            {description}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center p-6 rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow border border-primary/10">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
