import type { NextConfig } from "next";

const fonts = ["./assets/fonts/**"];

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/community/:path*", destination: "/forum/:path*", permanent: true }];
  },
  // Share-card renderers read the pixel fonts from disk at runtime.
  outputFileTracingIncludes: {
    "/api/card": fonts,
    "/build/[id]/opengraph-image": fonts,
  },
};

export default nextConfig;
