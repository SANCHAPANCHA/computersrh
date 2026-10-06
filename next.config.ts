import type { NextConfig } from "next";

const fonts = ["./assets/fonts/**"];

const nextConfig: NextConfig = {
  // Share-card renderers read the pixel fonts from disk at runtime.
  outputFileTracingIncludes: {
    "/api/card": fonts,
    "/build/[id]/opengraph-image": fonts,
  },
};

export default nextConfig;
