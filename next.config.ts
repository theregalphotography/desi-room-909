import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.ctfassets.net",
      },
      {
        protocol: "https",
        hostname: "downloads.ctfassets.net",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Ticket Tailor event images (live host: uploads.tickettailorassets.com).
      // Keep in sync with ALLOWED_IMAGE_DOMAINS in lib/tickettailor.ts.
      {
        protocol: "https",
        hostname: "**.tickettailorassets.com",
      },
      {
        protocol: "https",
        hostname: "**.tickettailor.com",
      },
    ],
  },
};

export default nextConfig;
