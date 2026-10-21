import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // geoip-lite reads its data files from its own folder at runtime, so it can't be bundled
  serverExternalPackages: ["geoip-lite", "nodemailer"],
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
