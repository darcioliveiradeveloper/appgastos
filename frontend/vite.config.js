import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'AppGastos - Finanças Pessoais',
        short_name: 'AppGastos',
        description: 'AppGastos - controle financeiro, gastos e investimentos com PWA offline',
        theme_color: '#1e1b4b',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        display_override: ['window-controls-overlay'],
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,png}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', networkTimeoutSeconds: 5, expiration: { maxEntries: 100, maxAgeSeconds: 86400 } }
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: { cacheName: 'api-local', networkTimeoutSeconds: 3, backgroundSync: { name: 'gastos-queue', options: { maxRetentionTime: 24*60 } } }
          }
        ]
      }
    })
  ],
  server: { port: 5173, proxy: { '/api': 'http://localhost:5000' } },
  preview: { port: 4173 }
})
