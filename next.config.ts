import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false, // false untuk redirect sementara (307), bisa jadi true (308) kalau sudah final
      },
    ];
  },
};

export default nextConfig;

