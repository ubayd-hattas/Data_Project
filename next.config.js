/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Canonical host: apex domain (non-www), matching ubayd.me pattern
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.sadatahub.tech' }],
        destination: 'https://sadatahub.tech/:path*',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
