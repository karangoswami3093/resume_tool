import path from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["puppeteer-core", "@sparticuz/chromium", "pdf-parse", "mammoth"],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias["tslib"] = path.join(__dirname, "node_modules/tslib");
    return config;
  },
};

export default nextConfig;
