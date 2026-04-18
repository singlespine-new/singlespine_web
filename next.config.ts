import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ESLint runs separately in CI — skip during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type-check runs separately — don't block the production build
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "**"
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**"
      }
    ]
  },
  /* config options here */
};

export default nextConfig;
