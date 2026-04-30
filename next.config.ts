import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/world-cup-predictor', destination: '/world-cup-predictor/index.html' },
      { source: '/world-cup-predictor/', destination: '/world-cup-predictor/index.html' },
    ];
  },
};

export default nextConfig;
