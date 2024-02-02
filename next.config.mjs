/** @type {import('next').NextConfig} */
import transpile from 'next-transpile-modules'
import transpileModule from 'next-transpile-modules';
transpileModule(['copilot-node-sdk']);

const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true
  }
};

export default nextConfig;
