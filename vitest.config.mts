import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    restoreMocks: true,
  },
  resolve: {
    alias: [
      // Shared workspace package resolves to source, exactly as the apps use it.
      { find: '@elap/core', replacement: here('./packages/core/src/index.ts') },
      // Next.js path alias used by the web app.
      { find: /^@\//, replacement: here('./apps/web/') },
      // `server-only` throws outside a React Server Component; stub it for node tests.
      { find: /^server-only$/, replacement: here('./tests/stubs/server-only.ts') },
    ],
  },
});
