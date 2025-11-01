const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.cocobu\.online\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 86400, // 24 hours
        },
      },
    },
    {
      urlPattern: /^http:\/\/localhost:4000\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'api-cache-local',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 3600, // 1 hour for local dev
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@cocobu/database'],
};

module.exports = withPWA(nextConfig);
