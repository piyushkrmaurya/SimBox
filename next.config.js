/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
})

// Read the base path from environment variables, with a fallback
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  // We need to expose the basePath to the client-side of the app for asset linking.
  publicRuntimeConfig: {
    basePath: BASE_PATH,
  },
  output: 'export',
  basePath: BASE_PATH,
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
}

module.exports = withPWA(nextConfig)