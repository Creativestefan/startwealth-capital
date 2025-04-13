import React from 'react'
import Link from 'next/link'
import { MarketingLayout } from '@/components/shared/marketing-layout'
import { Button } from '@/components/ui/button'

export default function PrivacyPage() {
  return (
    <MarketingLayout>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-12 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="text-secondary">Privacy </span>
                <span className="text-primary">Policy</span>
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                How we collect, use, and protect your personal information.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
              <div className="prose max-w-none">
                <h2>1. Introduction</h2>
                <p>
                  At StratWealth Capital, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our investment platform.
                </p>

                <h2>2. Information We Collect</h2>
                <p>
                  We collect personal information that you voluntarily provide to us when you register on our platform, express interest in obtaining information about us or our products, or otherwise contact us. The personal information we collect may include:
                </p>
                <ul>
                  <li>Name, email address, and contact details</li>
                  <li>Date of birth and national identification numbers</li>
                  <li>Financial information and investment preferences</li>
                  <li>Documents provided for KYC verification</li>
                  <li>Information about your device and internet connection</li>
                </ul>

                <h2>3. How We Use Your Information</h2>
                <p>
                  We use the information we collect for various purposes, including:
                </p>
                <ul>
                  <li>To provide, maintain, and improve our services</li>
                  <li>To process your investments and transactions</li>
                  <li>To comply with legal and regulatory requirements</li>
                  <li>To communicate with you about your account and investments</li>
                  <li>To detect and prevent fraud and unauthorized activities</li>
                  <li>To analyze usage patterns and improve user experience</li>
                </ul>

                <h2>4. Information Sharing</h2>
                <p>
                  We may share your information with third parties only in the ways described in this Privacy Policy, including:
                </p>
                <ul>
                  <li>With service providers who perform services on our behalf</li>
                  <li>With financial institutions and payment processors to facilitate transactions</li>
                  <li>With regulatory authorities when required by law</li>
                  <li>In connection with a business transfer or acquisition</li>
                </ul>

                <h2>5. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures to protect the security of your personal information. However, please be aware that no method of transmission over the internet or electronic storage is 100% secure.
                </p>

                <h2>6. Your Data Protection Rights</h2>
                <p>
                  Depending on your location, you may have certain rights regarding your personal information, including:
                </p>
                <ul>
                  <li>The right to access and receive a copy of your personal information</li>
                  <li>The right to rectify or update your personal information</li>
                  <li>The right to erase your personal information</li>
                  <li>The right to restrict processing of your personal information</li>
                  <li>The right to object to processing of your personal information</li>
                  <li>The right to data portability</li>
                </ul>

                <h2>7. Cookies and Tracking Technologies</h2>
                <p>
                  We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                </p>

                <h2>8. Children's Privacy</h2>
                <p>
                  Our platform is not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18.
                </p>

                <h2>9. Changes to This Privacy Policy</h2>
                <p>
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>

                <h2>10. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at privacy@stratwealthcapital.com.
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
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Your Data Security is Our Priority</h2>
 
              <p className="text-xl mb-8">
                We're committed to protecting your personal information while providing exceptional investment opportunities.
              </p>
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
