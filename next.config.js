/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "stratwealth.3c3049b93386c9d1425392ee596bc359.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "3c3049b93386c9d1425392ee596bc359.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "stratwealth.r2.cloudflarestorage.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "startwealth-capital.vercel.app" },
    ],
  },
  // Disable ESLint during build
  eslint: { ignoreDuringBuilds: true },
  // Disable TypeScript checking during build
  typescript: { ignoreBuildErrors: true },
  // Fix module resolution issues
  experimental: { largePageDataBytes: 256 * 1024 },
  // Config for server-side functionality
  distDir: '.next',
  // Other settings
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone',
};

module.exports = nextConfig;