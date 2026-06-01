/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // disable for canvas/RAF compatibility
  webpack: (config) => {
    // Allow mediapipe wasm files
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

module.exports = nextConfig;
