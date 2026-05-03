/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "s4.anilist.co" },
      { protocol: "https", hostname: "media.kitsu.app" },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [96, 128, 185, 256, 342, 500],
    minimumCacheTTL: 2678400, // 31 days
  },
};

export default nextConfig;
