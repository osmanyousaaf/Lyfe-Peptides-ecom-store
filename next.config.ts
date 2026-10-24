import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 90/95 for product renders and the certificate, so they stay crisp
  images: {
    qualities: [75, 90, 95],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
