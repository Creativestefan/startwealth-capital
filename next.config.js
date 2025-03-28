/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "**.r2.cloudflarestorage.com",
        },
        {
          protocol: "https",
          hostname: "placehold.co",
        },
        {
          protocol: "https",
          hostname: "stratwealth.3c3049b93386c9d1425392ee596bc359.r2.cloudflarestorage.com",
        },
        {
          protocol: "https",
          hostname: "3c3049b93386c9d1425392ee596bc359.r2.cloudflarestorage.com",
        },
        {
          protocol: "https",
          hostname: "stratwealth.r2.cloudflarestorage.com",
        },
        {
          protocol: "http",
          hostname: "localhost",
        },
      ],
    },
    // Add CORS headers for all routes
    async headers() {
      return [
        {
          // Specifically target auth endpoints
          source: '/api/auth/:path*',
          headers: [
            {
              key: 'Access-Control-Allow-Origin',
              value: '*',
            },
            {
              key: 'Access-Control-Allow-Methods',
              value: 'GET, POST, PUT, DELETE, OPTIONS',
            },
            {
              key: 'Access-Control-Allow-Headers',
              value: 'Content-Type, Authorization',
            },
          ],
        },
        {
          source: '/api/:path*',
          headers: [
            {
              key: 'Access-Control-Allow-Origin',
              value: '*',
            },
            {
              key: 'Access-Control-Allow-Methods',
              value: 'GET, POST, PUT, DELETE, OPTIONS',
            },
            {
              key: 'Access-Control-Allow-Headers',
              value: 'Content-Type, Authorization',
            },
          ],
        },
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Access-Control-Allow-Origin',
              value: '*',
            },
            {
              key: 'Access-Control-Allow-Methods',
              value: 'GET, POST, PUT, DELETE, OPTIONS',
            },
            {
              key: 'Access-Control-Allow-Headers',
              value: 'Content-Type, Authorization',
            },
          ],
        },
      ];
    },
    // Fix module resolution issues and optimize build
    experimental: {
      largePageDataBytes: 256 * 1024, // 256KB
    },
    // External packages for server components
    serverExternalPackages: ['@prisma/client'],
    poweredByHeader: false,
    reactStrictMode: true,
  }
  
  module.exports = nextConfig
  
  