import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React strict mode for better development warnings
  reactStrictMode: true,

  // Optimize images
  images: {
    remotePatterns: [],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
