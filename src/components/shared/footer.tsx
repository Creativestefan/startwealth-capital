import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-secondary text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          {/* Company Info */}
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">SW</span>
              </div>
              <span className="text-xl font-bold text-white">
                Strat<span className="text-accent">Wealth</span> Capital
              </span>
            </Link>
            <p className="text-gray-300 mb-4">
              Your gateway to sustainable and profitable investments in real estate, green energy, and financial markets.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-accent transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-accent transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-accent transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-accent transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 border-b border-gray-600 pb-2">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-300 hover:text-accent transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-accent transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-accent transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-300 hover:text-accent transition-colors">Login</Link>
              </li>
              <li>
                <Link href="/register" className="text-gray-300 hover:text-accent transition-colors">Sign Up</Link>
              </li>
            </ul>
          </div>
          
          {/* Investment Options */}
          <div>
            <h3 className="text-lg font-semibold mb-6 border-b border-gray-600 pb-2">Investment Options</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/property-investments" className="text-gray-300 hover:text-accent transition-colors">Real Estate</Link>
              </li>
              <li>
                <Link href="/green-energy-investments" className="text-gray-300 hover:text-accent transition-colors">Green Energy</Link>
              </li>
              <li>
                <Link href="/markets-investments" className="text-gray-300 hover:text-accent transition-colors">Markets</Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-6 border-b border-gray-600 pb-2">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="text-accent shrink-0 mt-1" size={18} />
                <span className="text-gray-300">123 Investment Ave, Financial District, New York, NY 10001</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="text-accent shrink-0" size={18} />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="text-accent shrink-0" size={18} />
                <span className="text-gray-300">contact@stratwealthcapital.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Legal Links & Copyright */}
        <div className="border-t border-gray-600 py-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-300 text-sm">
            &copy; {currentYear} StratWealth Capital. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="/terms" className="text-gray-300 hover:text-accent text-sm transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-gray-300 hover:text-accent text-sm transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
