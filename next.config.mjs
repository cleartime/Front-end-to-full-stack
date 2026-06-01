/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  devIndicators: false,
  serverExternalPackages: ["@prisma/client", ".prisma/client", "pg", "pg-cloudflare"],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb"
    }
  }
};

export default nextConfig;
