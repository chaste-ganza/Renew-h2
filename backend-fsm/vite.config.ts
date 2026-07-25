import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: 'renew',
                short_name: 'Companion',
                theme_color: '#0f172a',
                display: 'standalone',
            },
        }),
    ],
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
    optimizeDeps: {
        exclude: ['@mlc-ai/web-llm'],
    },
    worker: {
        format: 'es',
    },
});