import React from 'react'

interface Testimonial {
  name: string;
  title: string;
  content: string;
  avatarUrl?: string;
}

interface TestimonialsSectionProps {
  title: string;
  description: string;
  testimonials?: Testimonial[];
}

export const TestimonialsSection = ({
  title = "What Our Investors Say",
  description = "Hear from our community of investors about their experience with StratWealth Capital.",
  testimonials = [
    {
      name: "Sarah Johnson",
      title: "Real Estate Investor",
      content: "StratWealth Capital has transformed my investment portfolio. Their real estate offerings have consistently outperformed the market while contributing to sustainable development."
    },
    {
      name: "Michael Chen",
      title: "Tech Entrepreneur",
      content: "As someone passionate about both technology and sustainability, I've found the perfect investment partner in StratWealth Capital. Their green energy projects deliver both impact and returns."
    },
    {
      name: "Jessica Williams",
      title: "Financial Advisor",
      content: "I recommend StratWealth Capital to my clients who want to diversify with sustainable investments. Their professional team and transparent reporting make my job easier."
    },
    {
      name: "David Patel",
      title: "Retired Professional",
      content: "After retirement, I wanted investments that would provide steady income while making a positive difference. StratWealth Capital has exceeded my expectations on both fronts."
    },
    {
      name: "Emma Rodriguez",
      title: "Impact Investor",
      content: "Finally, an investment platform that doesn't make me choose between my values and my financial goals. The environmental impact reporting is just as robust as the financial analytics."
    },
    {
      name: "Robert Kim",
      title: "Small Business Owner",
      content: "As a business owner, I appreciate the flexibility and professional management StratWealth Capital offers. They've helped me grow my personal wealth while I focus on my company."
    }
  ]
}: TestimonialsSectionProps) => {
  return (
    <section className="py-16 bg-gradient-to-r from-secondary/5 to-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            {description}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 6).map((testimonial, index) => (
            <div key={index} className="h-full">
              <div className="h-full border border-primary/10 bg-card shadow-sm hover:shadow-md transition-shadow p-6 rounded-lg">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {testimonial.avatarUrl ? (
                      <img 
                        src={testimonial.avatarUrl} 
                        alt={testimonial.name} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-primary text-xl">💬</span>
                    )}
                  </div>
                  <div>
                    <p className="text-card-foreground mb-4">{testimonial.content}</p>
                    <div className="flex items-center">
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="mx-2 text-muted-foreground">•</div>
                      <div className="text-muted-foreground text-sm">{testimonial.title}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
