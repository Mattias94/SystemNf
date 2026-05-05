import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'public/*.min.js',
      'public/pdf.worker.min.js',
    ],
  },
]);

// keep globalIgnores call for older tooling that expects it
globalIgnores([
  '.next/**',
  'out/**',
  'build/**',
  'next-env.d.ts',
  'public/*.min.js',
  'public/pdf.worker.min.js',
]);

export default eslintConfig;
