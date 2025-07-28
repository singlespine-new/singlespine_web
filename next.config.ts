import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
