import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    // Geometry-heavy suites can exceed the 5 s default when Vitest workers contend.
    testTimeout: 15_000,
  },
});
