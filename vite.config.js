import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    compression({ algorithm: 'brotliCompress' }),
    compression({ algorithm: 'gzip' })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            return 'vendor';
          }
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://wallhaven.cc',
        changeOrigin: true,
        secure: false,
      },
      '/w-image': {
        target: 'https://w.wallhaven.cc',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/w-image/, ''),
        secure: false,
      },
      '/th-image': {
        target: 'https://th.wallhaven.cc',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/th-image/, ''),
        secure: false,
      },
      '/reddit-api': {
        target: 'https://www.reddit.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/reddit-api/, ''),
        secure: false,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }
    }
  },
  preview: {
    proxy: {
      '/api': {
        target: 'https://wallhaven.cc',
        changeOrigin: true,
        secure: false,
      },
      '/w-image': {
        target: 'https://w.wallhaven.cc',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/w-image/, ''),
        secure: false,
      },
      '/th-image': {
        target: 'https://th.wallhaven.cc',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/th-image/, ''),
        secure: false,
      },
      '/reddit-api': {
        target: 'https://www.reddit.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/reddit-api/, ''),
        secure: false,
      }
    }
  }
})
