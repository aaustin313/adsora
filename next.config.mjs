/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@cloudflare/workers-types'],
  },
};

export default nextConfig;
