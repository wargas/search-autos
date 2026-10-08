import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: `standalone`,
  /* config options here */
  env: {
    NEXT_PUBLIC_BUILD_DATE: new Date().toJSON()
  }
};

export default nextConfig;
