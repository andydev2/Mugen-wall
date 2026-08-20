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
      }
    }
  }
})
