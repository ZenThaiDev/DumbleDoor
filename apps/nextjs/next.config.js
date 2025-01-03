// @ts-ignore
const jiti = require("jiti")(__filename);

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
//createJiti(fileURLToPath(import.meta.url))("./src/env");

jiti("./src/env");

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  output: "standalone",

  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@dumbledoor/user-api",
    "@dumbledoor/auth",
    "@dumbledoor/user-db",
    "@dumbledoor/ui",
    "@dumbledoor/validators",
  ],

  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

module.exports = config;
