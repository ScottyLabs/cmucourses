/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,

  /** We already do linting and typechecking as separate tasks in CI */
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default config;
