import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // `unoptimized: true` removed — it disabled Next.js image optimisation globally,
    // defeating lazy loading, WebP conversion, and responsive sizing. This is a
    // performance regression with no security benefit; it was likely added to work
    // around a misconfigured remote pattern. The explicit patterns below are sufficient.
    remotePatterns: [
      { protocol: 'https', hostname: "images.unsplash.com" },
      { protocol: 'https', hostname: "ae01.alicdn.com" },
      { protocol: 'https', hostname: "ae-pic-a1.aliexpress-media.com" },
      // Specific Cloudinary hostname only — avoid wildcard subdomains.
      { protocol: 'https', hostname: "res.cloudinary.com" },
      // Specific Vinted image CDN hostname — replacing the wildcard *.vinted.net
      // to reduce the attack surface for image hotlinking from unverified subdomains.
      { protocol: 'https', hostname: "images.vinted.net" },
      { protocol: 'https', hostname: "www.grailed.com" },
      { protocol: 'https', hostname: "media-assets.grailed.com" },
      // AliCDN: restrict to the two known image hostnames instead of *.alicdn.com
      { protocol: 'https', hostname: "ae01.alicdn.com" },
      { protocol: 'https', hostname: "upload.wikimedia.org" },
    ],
  },
};

export default nextConfig;
