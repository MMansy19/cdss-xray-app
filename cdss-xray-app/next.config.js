/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'localhost',
      // Add any domains you might need here for production
    ],
    unoptimized: true, // This helps with deployment when images are dynamic
  },
  // Enable demo mode by default for production builds
  env: {
    NEXT_PUBLIC_DEMO_MODE: 'false',
  },
  // Ensure output is configured properly for Vercel
  output: 'standalone',
};

module.exports = nextConfig;
