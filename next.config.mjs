/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // O conteúdo (MDX, JSON, PDFs) é lido do disco em runtime nos Server Components
  // e na rota /api/chat — por isso precisa viajar junto no bundle de produção.
  outputFileTracingIncludes: {
    '/**': ['./content/**/*'],
  },
};

export default nextConfig;
