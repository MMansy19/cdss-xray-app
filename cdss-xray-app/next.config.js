/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'localhost',
      'backend-service-url.com', // Replace with your actual backend domain if needed
      'vercel.app'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      }
    ],
  },
  // Configure API URL for backend integration with Vercel-friendly environment variable
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  },
  // Ensure output is configured properly for Vercel
  output: 'standalone',
  // Enable compression for better performance
  compress: true,
  // Increase performance by enabling SWC
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Enable font optimization
  optimizeFonts: true,
  // Cache optimization
  experimental: {
    // Enable app directory features
    appDir: true,
    // Optimize server components
    serverComponentsExternalPackages: [],
  },
  // Static generation optimization
  staticPageGenerationTimeout: 120,
  // Enable advanced page optimization
  poweredByHeader: false,
};

module.exports = nextConfig;
