/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "stratwealth-capital.vercel.app" },
    ],
  },
  // Disable ESLint during build
  eslint: { ignoreDuringBuilds: true },
  // Disable TypeScript checking during build
  typescript: { ignoreBuildErrors: true },
  // Fix module resolution issues
  experimental: { 
    largePageDataBytes: 256 * 1024
  },
  // Server external packages (moved from experimental)
  serverExternalPackages: [],
  // Config for server-side functionality
  distDir: '.next',
  // Other settings
  reactStrictMode: true,
  poweredByHeader: false,
  // Use standalone output for Vercel deployment
  output: 'standalone',
};

module.exports = nextConfig;