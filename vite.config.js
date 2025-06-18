// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import mkcert from 'vite-plugin-mkcert'
export default defineConfig({
  plugins: [
    vue(), mkcert(),

    VitePWA({
      registerType: 'autoUpdate', // Or 'prompt' for user interaction
      injectRegister: 'auto', // Inject service worker registration code

      // Configuration for the Web App Manifest
      manifest: {
        name: 'alQuraan', // Full name of your app
        short_name: 'alQuraan', // Short name for the homescreen icon
        description: 'القرآن الكريم', // Description of your app
        theme_color: '#000013', // Theme color for the browser UI
        background_color: '#000212', // Background color for the splash screen
        display: 'standalone', // How the app is displayed (standalone, fullscreen, browser, minimal-ui)
        start_url: '/', // The URL the user lands on when opening the PWA
        scope: '/', // Scope defines the set of URLs the browser considers to be within your app
       "icons": [
  {
    "src": "icons/icon-48x48.png",
    "sizes": "48x48",
    "type": "image/png",
    "purpose": "any maskable"
  },
  {
  "src": "/icons/icon-180x180.png",
  "sizes": "180x180",
  "type": "image/png",
  "purpose": "any maskable"
},
  {
    "src": "icons/icon-72x72.png",
    "sizes": "72x72",
    "type": "image/png",
    "purpose": "any maskable"
  },
  {
    "src": "icons/icon-96x96.png",
    "sizes": "96x96",
    "type": "image/png",
    "purpose": "any maskable"
  },
  {
    "src": "icons/icon-128x128.png",
    "sizes": "128x128",
    "type": "image/png",
    "purpose": "any maskable"
  },
  {
    "src": "icons/icon-144x144.png",
    "sizes": "144x144",
    "type": "image/png",
    "purpose": "any maskable"
  },
  {
    "src": "icons/icon-152x152.png",
    "sizes": "152x152",
    "type": "image/png",
    "purpose": "any maskable"
  },
  {
    "src": "icons/icon-192x192.png",
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "any maskable"
  },
  {
    "src": "icons/icon-256x256.png",
    "sizes": "256x256",
    "type": "image/png",
    "purpose": "any maskable"
  },
  {
    "src": "icons/icon-384x384.png",
    "sizes": "384x384",
    "type": "image/png",
    "purpose": "any maskable"
  },
  {
    "src": "icons/icon-512x512.png",
    "sizes": "512x512",
    "type": "image/png",
    "purpose": "any maskable"
  }
]
      },

      // Configuration for the Service Worker (using Workbox)
workbox: {
  globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'], // Include JSON files
  runtimeCaching: [
    {
      urlPattern: /\.(?:json)$/i, // Cache JSON files
      handler: 'CacheFirst', // Use CacheFirst strategy for JSON
      options: {
        cacheName: 'json-files',
        expiration: {
          maxEntries: 50, // Cache up to 50 JSON files
          maxAgeSeconds: 60 * 60 * 24 * 30, // Cache for 30 days
        },
      },
    },
    {
      urlPattern: /\.(?:js|css|html)$/i, // Cache JS, CSS, and HTML
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
      },
    },
  ],
  maximumFileSizeToCacheInBytes: 30 * 1024 * 1024, // Set limit to 30 MiB
},


    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.alquran.cloud',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false
      },
      '/audio': {
        target: 'https://quranapi.pages.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/audio/, '/api'),
        secure: false
      }
    }
  }
})