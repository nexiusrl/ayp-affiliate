import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Shopee CDN
      { protocol: "https", hostname: "**.shpimg.com" },
      { protocol: "https", hostname: "**.shopee.co.id" },
      { protocol: "https", hostname: "cf.shopee.co.id" },
      { protocol: "https", hostname: "down-id.img.susercontent.com" },
      // Tokopedia CDN
      { protocol: "https", hostname: "**.tokopedia.net" },
      { protocol: "https", hostname: "images.tokopedia.net" },
      { protocol: "https", hostname: "**.tokopedia.com" },
      // Generic
      { protocol: "https", hostname: "**" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
