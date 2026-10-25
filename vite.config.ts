import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['assets/aistudio/IMG_2782_9ea91479.jpeg', 'assets/aistudio/IMG_2778_cbee1f3e.jpeg'],
        manifest: {
          id: '/',
          name: 'WASLA Staff Portal - بوابة موظفي وإدارة وَصْلَة',
          short_name: 'WASLA Staff',
          description: 'نظام إدارة وتفويج الفرزات اليمنية والمحاسبة الذكية لتطبيق وَصْلَة',
          theme_color: '#0056B3',
          background_color: '#F8FAFC',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          lang: 'ar',
          dir: 'rtl',
          icons: [
            {
              src: '/assets/aistudio/IMG_2782_9ea91479.jpeg',
              sizes: '192x192',
              type: 'image/jpeg',
              purpose: 'any',
            },
            {
              src: '/assets/aistudio/IMG_2782_9ea91479.jpeg',
              sizes: '512x512',
              type: 'image/jpeg',
              purpose: 'any',
            },
            {
              src: '/assets/aistudio/IMG_2782_9ea91479.jpeg',
              sizes: '512x512',
              type: 'image/jpeg',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpeg,jpg,woff,woff2}'],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
