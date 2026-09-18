/** @type {import('next').NextConfig} */
const nextConfig = {
  // e2e builds go to their own dir so they don't clobber a dev server's .next,
  // and skip standalone output, which `next start` doesn't use and which needs
  // symlink rights on Windows.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  output: process.env.NEXT_DIST_DIR ? undefined : "standalone",
  poweredByHeader: false,
  transpilePackages: ["@intelliforge/db"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.logo.dev",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
