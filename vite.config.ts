import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const VITE_BASE_URL = env.VITE_BASE_URL

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
        srcDir: 'src',
        filename: 'sw.ts',
        strategies: 'injectManifest',
        manifest: {
          name: 'Quang Vinh Management',
          short_name: 'Quang Vinh Mobile',
          description: 'Quang Vinh Management Task',
          theme_color: '#ffffff',
          display: 'standalone',
          background_color: '#ffffff',
          start_url: '/',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: VITE_BASE_URL,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
      },
      allowedHosts: true,
    },
  }
})
