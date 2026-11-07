import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { unoptimized: true },
  // Lets the Android app load the dev server from the emulator and from a phone on Wi-Fi.
  allowedDevOrigins: ["10.0.2.2", "192.168.1.3"],
  // Customer documents are uploaded through server actions:
  // up to 8 files of 5 MB each, plus multipart overhead.
  experimental: {
    serverActions: { bodySizeLimit: "45mb" },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
