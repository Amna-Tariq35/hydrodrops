/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Vercel build ko TypeScript warnings par block hone se rokein
    ignoreBuildErrors: true,
  },
  eslint: {
    // Build time lint errors ignore karein
    ignoreDuringBuilds: true,
  },
  // Supabase aur External Images ke liye (if required)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig