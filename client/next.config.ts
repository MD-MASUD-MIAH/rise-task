import type { NextConfig } from 'next';
import * as path from 'path';

const nextConfig: NextConfig = {
  // Tell Turbopack to use the monorepo root so it can resolve
  // packages hoisted to E:\rise-task\node_modules by npm workspaces.
  turbopack: {
    root: path.join(__dirname, '..'),
  },

  images: {
    remotePatterns: [
      { protocol: 'http',  hostname: 'localhost',            port: '5000', pathname: '/output/**'  },
      { protocol: 'http',  hostname: 'localhost',            port: '5000', pathname: '/uploads/**' },
      { protocol: 'https', hostname: '*.cloudinary.com',    pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
    ],
  },
};

export default nextConfig;
