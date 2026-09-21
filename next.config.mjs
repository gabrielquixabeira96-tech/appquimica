/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // O conteúdo (MDX, JSON, PDFs) é lido do disco em runtime nos Server Components.
  outputFileTracingIncludes: {
    '/**': ['./content/**/*'],
  },
};

export default nextConfig;
