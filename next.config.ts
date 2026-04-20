import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "jsonrepair", "voyageai"],
};

export default nextConfig;
