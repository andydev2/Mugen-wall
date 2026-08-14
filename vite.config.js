import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
