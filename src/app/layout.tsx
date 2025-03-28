import type React from "react"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import { cn } from "@/lib/utils"
import { Providers } from "./providers"
import "@/styles/globals.css"
import { Metadata } from "next"
import { Sonner } from "@/components/ui/sonner"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "StratWealth Capital",
    template: "%s | StratWealth Capital",
  },
  description: "Secure investment platform for real estate, market investments, green energy.",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script 
          src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"
          strategy="beforeInteractive"
        />
        <Script
          id="service-worker-registration"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('Service Worker registered with scope:', registration.scope);
                      
                      // Check if service worker is active
                      if (registration.active) {
                        console.log('Service worker is already active');
                      } else if (registration.installing) {
                        console.log('Service worker is installing...');
                        registration.installing.addEventListener('statechange', function(e) {
                          console.log('Service worker state changed to:', e.target.state);
                        });
                      } else if (registration.waiting) {
                        console.log('Service worker is waiting');
                      }
                    })
                    .catch(function(error) {
                      console.error('Service Worker registration failed:', error);
                    });
                  
                  // Also check existing registrations
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    console.log('Found existing service worker registrations:', registrations.length);
                    registrations.forEach(function(reg, i) {
                      console.log('Registration', i, 'scope:', reg.scope, 'state:', 
                        reg.active ? 'active' : 
                        reg.installing ? 'installing' : 
                        reg.waiting ? 'waiting' : 'unknown');
                    });
                  });
                  
                  // Set up message event handler for debuging
                  navigator.serviceWorker.addEventListener('message', function(event) {
                    console.log('Received message from service worker:', event.data);
                  });
                });
              } else {
                console.warn('Service workers are not supported in this browser');
              }
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}
      >
        <Providers>{children}</Providers>
        <Toaster />
        <Sonner />
      </body>
    </html>
  )
}

