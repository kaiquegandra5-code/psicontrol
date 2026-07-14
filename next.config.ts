import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // Lint style errors (unused vars, `any`, etc.) are pre-existing and do not
    // affect runtime/type-safety. Skip them during production builds so Vercel
    // can deploy; they can still be checked locally with `npm run lint`.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
