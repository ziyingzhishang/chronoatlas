import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_');

  return {
    base: env.VITE_BASE_PATH || '/',
    build: {
      sourcemap: false,
    },
    plugins: [react()],
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true,
      // Geometry-heavy suites can exceed the 5 s default when Vitest workers contend.
      testTimeout: 60_000,
    },
  };
});
