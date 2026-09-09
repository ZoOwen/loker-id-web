import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // The sitemap was already submitted with the old (generically slugified)
    // stack URLs before we switched to explicit, search-friendlier slugs
    // (see lib/stack-slugs.ts). Keep those old URLs alive as redirects so
    // indexed links/backlinks don't 404. "react-native" is unlisted below
    // because its generic slug and its explicit override are identical.
    return [
      {
        source: "/stack/go",
        destination: "/stack/golang",
        statusCode: 301,
      },
      {
        source: "/stack/net",
        destination: "/stack/dotnet",
        statusCode: 301,
      },
      {
        source: "/stack/c",
        destination: "/stack/csharp",
        statusCode: 301,
      },
      {
        source: "/stack/node-js",
        destination: "/stack/nodejs",
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;
