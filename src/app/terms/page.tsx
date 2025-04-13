import React from 'react'
import Link from 'next/link'
import { MarketingLayout } from '@/components/shared/marketing-layout'
import { Button } from '@/components/ui/button'

export default function TermsPage() {
  return (
    <MarketingLayout>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-12 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="text-secondary">Terms of </span>
                <span className="text-primary">Service</span>
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                Please read these terms carefully before using our platform.
              </p>
            </div>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
              <div className="prose max-w-none">
                <h2>1. Introduction</h2>
                <p>
                  Welcome to StratWealth Capital. These Terms of Service govern your use of our website and investment platform. By accessing or using our services, you agree to be bound by these terms.
                </p>

                <h2>2. Definitions</h2>
 
                <p>
                  "Platform" refers to the StratWealth Capital website and investment services.
                  "User," "you," and "your" refers to the individual or entity using our Platform.
                  "We," "us," and "our" refers to StratWealth Capital.
                </p>

                <h2>3. Account Registration</h2>
                <p>
                  To use certain features of the Platform, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                </p>

                <h2>4. Investment Risks</h2>
                <p>
                  All investments involve risk, and the past performance of a security, industry, sector, market, or financial product does not guarantee future results or returns. You understand that investments in real estate, green energy, and financial markets are subject to various risks including, but not limited to, market risk, liquidity risk, and interest rate risk.
                </p>

                <h2>5. KYC and AML Compliance</h2>
                <p>
                  We are committed to complying with all applicable Know Your Customer (KYC) and Anti-Money Laundering (AML) laws and regulations. You agree to provide all requested documentation and information as part of our verification process.
                </p>

                <h2>6. Intellectual Property</h2>
                <p>
                  The Platform and its original content, features, and functionality are owned by StratWealth Capital and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
                </p>

                <h2>7. Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by law, StratWealth Capital shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Platform.
                </p>

                <h2>8. Governing Law</h2>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which StratWealth Capital is registered, without regard to its conflict of law provisions.
                </p>

                <h2>9. Changes to Terms</h2>
                <p>
                  We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.
                </p>

                <h2>10. Contact Us</h2>
                <p>
                  If you have any questions about these Terms, please contact us at legal@stratwealthcapital.com.
                </p>

                <p className="text-sm text-gray-500 mt-8">
                  Last updated: March 29, 2025
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-gradient-to-r from-blue-600 to-green-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Ready to Start Investing?</h2>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Button asChild className="bg-white hover:bg-white/90 text-primary">
                  <Link href="/register">Create Account</Link>
                </Button>
                <Button asChild variant="outline" className="border-white hover:bg-white/10 text-white">
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </MarketingLayout>
  )
}
