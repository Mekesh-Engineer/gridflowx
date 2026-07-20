import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // Avoid circular JSON parsing errors inside Next worker when using ESLint 9 FlatCompat
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
