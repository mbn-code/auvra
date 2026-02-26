import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: "images.unsplash.com" },
      { protocol: 'https', hostname: "ae01.alicdn.com" },
      { protocol: 'https', hostname: "ae-pic-a1.aliexpress-media.com" },
      { protocol: 'https', hostname: "res.cloudinary.com" },
      { protocol: 'https', hostname: "images.vinted.net" },
      { protocol: 'https', hostname: "*.vinted.net" },
      { protocol: 'https', hostname: "www.grailed.com" },
      { protocol: 'https', hostname: "*.alicdn.com" },
      { protocol: 'https', hostname: "media-assets.grailed.com" },
      { protocol: 'https', hostname: "upload.wikimedia.org" },
    ],
  },
};

export default nextConfig;
