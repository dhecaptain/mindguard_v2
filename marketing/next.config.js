const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['framer-motion'],
  experimental: { optimizePackageImports: ['framer-motion'] },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.MINDGUARD_API_URL || 'http://localhost:8000'}/api/:path*`,
      },
    ]
  },
  async headers() {
    // Next.js dev mode hydrates via webpack's dev runtime, which needs
    // 'unsafe-eval' and same-origin websockets. Production builds need neither.
    const dev = process.env.NODE_ENV !== 'production'
    const scriptSrc = dev
      ? "'self' 'unsafe-inline' 'unsafe-eval'"
      : "'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com"
    const connectSrc = dev ? "'self' ws: wss:" : "'self' https://www.google.com https://www.gstatic.com"
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; " +
              `script-src ${scriptSrc}; ` +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
              "img-src 'self' data: blob:; " +
              "font-src 'self' data: https://fonts.gstatic.com; " +
              `connect-src ${connectSrc}; ` +
              "object-src 'none'; " +
              "base-uri 'self'; " +
              "form-action 'self'; " +
              "frame-ancestors 'none'",
          },
        ],
      },
    ]
  },
}

const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  hideSourceMaps: true,
  telemetry: false,
}

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions)
