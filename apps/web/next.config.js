/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@livinglink/shared", "@livinglink/fhir-client", "@livinglink/ai"],
  images: {
    domains: ["livinglink-uploads-dev.s3.amazonaws.com"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.accounts.dev https://*.vercel.app https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' https://fonts.gstatic.com",
              "frame-src https://challenges.cloudflare.com https://*.clerk.accounts.dev https://*.vercel.app",
              "connect-src 'self' https://api.clerk.com https://*.clerk.accounts.dev https://challenges.cloudflare.com https://*.vercel.app",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
