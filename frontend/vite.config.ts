import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'ReNew',
        short_name: 'ReNew',
        description: 'Privacy-first adolescent mental health check-ins',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@core': path.resolve(__dirname, '../backend-fsm/src/core'),
      '@types': path.resolve(__dirname, '../backend-fsm/src/types'),
      'backend-fsm/emitter': path.resolve(__dirname, '../backend-fsm/src/core/fsm/emitter.ts'),
      'backend-fsm/types': path.resolve(__dirname, '../backend-fsm/src/core/fsm/types.ts'),
    },
  },
  server: {
    port: 5174,
    strictPort: true,
  },
});
