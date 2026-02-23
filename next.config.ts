import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "images.unsplash.com" },
      { hostname: "ae01.alicdn.com" },
      { hostname: "ae-pic-a1.aliexpress-media.com" },
      { hostname: "res.cloudinary.com" },
      { hostname: "images.vinted.net" },
      { hostname: "www.grailed.com" },
      { hostname: "*.vinted.net" },
      { hostname: "*.alicdn.com" },
    ],
  },
};

export default nextConfig;
