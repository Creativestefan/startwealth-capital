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
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Fix module resolution issues and optimize build
  experimental: {
    largePageDataBytes: 256 * 1024, // 256KB
  },
  // Disable static optimization for routes that use dynamic features
  outputFileTracingExcludes: {
    '/admin/**': ['**/*.js', '**/*.ts', '**/*.tsx'],
  },
  // Configure dynamic routes to be server-side rendered
  output: 'standalone',
  // Disable static optimization for specific routes
  reactStrictMode: true,
  poweredByHeader: false,
};

module.exports = nextConfig;