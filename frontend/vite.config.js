import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const proxyTarget = process.env.BACKEND_PROXY_URL || 'http://localhost:6000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4001,
    host: true,
    allowedHosts: ['dataatlas.leandroo.com.br','dataatlas.com.br','www.dataatlas.com.br','localhost'],
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
      }
    }
  },
  preview: {
    port: process.env.PORT || 4001,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1600
  }
})
