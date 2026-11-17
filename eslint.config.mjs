import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Cloudflare (@opennextjs/cloudflare + wrangler) build output — huge generated
    // server bundles that aren't source and previously crashed `next lint` with an
    // out-of-memory error since they weren't excluded.
    ".open-next/**",
    ".wrangler/**",
  ]),
]);

export default eslintConfig;
