import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@commonground/abi", "@commonground/addresses", "@commonground/shared"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.ipfs.w3s.link" },
      { protocol: "https", hostname: "cloudflare-ipfs.com" },
      { protocol: "https", hostname: "ipfs.io" },
      { protocol: "https", hostname: "dweb.link" },
    ],
  },
}

export default nextConfig
