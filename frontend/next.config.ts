import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/static/**',
      },
      {
        protocol: 'https',
        hostname: 'astropinch-api-56j9.onrender.com',
        pathname: '/static/**',
      },
      {
        protocol: 'https',
        hostname: '**.onrender.com',
        pathname: '/static/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
