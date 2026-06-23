import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Make all pages dynamic (no static generation)
  output: 'standalone',
};

export default nextConfig;
