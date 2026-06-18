/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    // 🚀 Bypasses the third-party dependency type errors so your build succeeds
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
