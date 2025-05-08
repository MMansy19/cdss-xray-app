/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'localhost',
      'backend-service-url.com', // Replace with your actual backend domain if needed
      'vercel.app'
    ],
    unoptimized: false, // Enable image optimization for better performance
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Optimize for common device sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256], // Additional image sizes for responsive images
  },
  // Configure API URL for backend integration with Vercel-friendly environment variable
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://your-backend-api.com' // Will be overridden by Vercel env variable
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
