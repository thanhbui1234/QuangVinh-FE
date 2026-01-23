import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { visualizer } from 'rollup-plugin-visualizer'
import compression from 'vite-plugin-compression'

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
        injectManifest: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        },
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
      compression({
        algorithm: 'gzip',
        ext: '.gz',
      }),
      compression({
        algorithm: 'brotliCompress',
        ext: '.br',
      }),
      visualizer({
        open: false,
        filename: 'bundle-report.html',
        gzipSize: true,
        brotliSize: true,
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (
                id.includes('node_modules/react/') ||
                id.includes('node_modules/react-dom/') ||
                id.includes('node_modules/react-router/') ||
                id.includes('node_modules/react-router-dom/') ||
                id.includes('node_modules/scheduler/')
              )
                return 'react-core'
              // Tách TanStack (Query, Table, Virtual) - Nhóm này rất nặng
              if (id.includes('@tanstack')) return 'vendor-tanstack'

              // Tách Form & Validation
              if (id.includes('react-hook-form') || id.includes('@hookform')) return 'vendor-forms'

              if (id.includes('emoji-picker-react')) return 'emoji-vendor'
              if (id.includes('react-mentions')) return 'mentions-vendor'
              if (id.includes('@editorjs')) return 'editor-vendor'
              if (id.includes('recharts')) return 'charts-vendor'
              if (id.includes('framer-motion')) return 'motion-vendor'
              if (id.includes('lucide-react')) return 'vendor-ui'
              if (id.includes('@radix-ui')) return 'vendor-ui'
              if (
                id.includes('axios') ||
                id.includes('zod') ||
                id.includes('dayjs') ||
                id.includes('socket.io-client') ||
                id.includes('zustand')
              )
                return 'vendor-utils'
              return 'vendor'
            }
          },
        },
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
