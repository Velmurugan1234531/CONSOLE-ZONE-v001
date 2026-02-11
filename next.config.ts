import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/admin/dashboard',
        destination: '/admin/selling',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
