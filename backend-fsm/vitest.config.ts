import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, 'src/core'),
      '@db': path.resolve(__dirname, 'src/db'),
      '@ai': path.resolve(__dirname, 'src/ai'),
      '@security': path.resolve(__dirname, 'src/security'),
      '@emergency': path.resolve(__dirname, 'src/emergency'),
      '@ui': path.resolve(__dirname, 'src/ui'),
      '@types': path.resolve(__dirname, 'src/types'),
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/ai.test.ts', 'tests/db.test.ts', 'tests/fsm.test.ts'],
  },
});
