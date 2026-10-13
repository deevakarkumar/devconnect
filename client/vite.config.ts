import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
  plugins: [react(), VitePWA({ registerType: 'autoUpdate',
    manifest: { name: 'DevConnect', short_name: 'DevConnect', description: 'Developer networking & portfolio platform', theme_color: '#4f46e5', background_color: '#0f172a', display: 'standalone', start_url: '/',
      icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }] },
    workbox: { navigateFallbackDenylist: [/^\/api/], runtimeCaching: [{ urlPattern: ({ url }) => url.pathname.startsWith('/api'), handler: 'NetworkFirst', options: { cacheName: 'api', networkTimeoutSeconds: 5 } }] } })],
  server: { proxy: { '/api': 'http://localhost:4000' } },
  test: { environment: 'jsdom' } });
