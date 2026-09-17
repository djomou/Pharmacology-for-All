import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.56.10'],
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: '192.168.56.10' },
    ],
  },
};

export default nextConfig;
