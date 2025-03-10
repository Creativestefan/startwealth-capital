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
          hostname: "startwealth.3c3049b93386c9d1425392ee596bc359.r2.cloudflarestorage.com",
        },
        {
          protocol: "https",
          hostname: "3c3049b93386c9d1425392ee596bc359.r2.cloudflarestorage.com",
        },
        {
          protocol: "https",
          hostname: "startwealth.r2.cloudflarestorage.com",
        },
        {
          protocol: "http",
          hostname: "localhost",
        },
      ],
    },
    // Add CORS headers for R2 uploads
    async headers() {
      return [
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
  }
  
  module.exports = nextConfig
  
  