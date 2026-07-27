import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@core': path.resolve(__dirname, '../backend-fsm/src/core'),
      '@types': path.resolve(__dirname, '../backend-fsm/src/types'),
      'backend-fsm/emitter': path.resolve(__dirname, '../backend-fsm/src/core/fsm/emitter.ts'),
      'backend-fsm/types': path.resolve(__dirname, '../backend-fsm/src/core/fsm/types.ts'),
    },
  },
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
