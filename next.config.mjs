import withPWA from "next-pwa";

const isDevelopment = process.env.NODE_ENV === "development";

const pwaConfig = {
  dest: "public",
  register: true,
  scope: "/",
  sw: "sw.js",
  skipWaiting: true,
  disable: isDevelopment,
  buildExcludes: [/middleware-manifest\.json$/, /middleware-build-manifest\.json$/],
};

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "somapace.example.com" },
      { protocol: "https", hostname: "somapace.b-cdn.net" },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ?? "https://api.somapace.co.ke/api/v1",
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://somapace.co.ke",
    NEXT_PUBLIC_PAYMENT_PROVIDER:
      process.env.NEXT_PUBLIC_PAYMENT_PROVIDER ?? "mpesa",
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          { key: "Content-Type", value: "application/manifest+json" },
          { key: "Cache-Control", value: "public, max-age=604800" },
        ],
      },
      {
        source: "/:path*.png",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:path*.svg",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default withPWA(pwaConfig)(nextConfig);