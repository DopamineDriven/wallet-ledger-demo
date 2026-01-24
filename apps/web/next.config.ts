import type { NextConfig } from "next";

export default {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: false, tsconfigPath: "./tsconfig.json" },
  images: {
    localPatterns: [{ pathname: "/*" }],
    qualities: [75, 100],
    loader: "default",
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowLocalIP: true,
    maximumRedirects: 5,
    contentDispositionType: "attachment",
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        hostname: "localhost",
        port: "3030",
        protocol: "http"
      },
      { hostname: "images.unsplash.com", protocol: "https" },
      { hostname: "tailwindui.com", protocol: "https" }
    ]
  },
  productionBrowserSourceMaps: true
} satisfies NextConfig;
