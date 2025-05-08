/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'localhost',
      // Add any domains you might need here for production
    ],
    unoptimized: false, // Enable image optimization for better performance
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Optimize for common device sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256], // Additional image sizes for responsive images
  },
  // Enable demo mode by default for production builds
  env: {
    NEXT_PUBLIC_DEMO_MODE: 'true',
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
