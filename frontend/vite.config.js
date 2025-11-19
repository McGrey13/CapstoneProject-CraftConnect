import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
        build: {
      chunkSizeWarningLimit: 1000, // increase limit from 500kb → 1000kb
    },
    port: 5173,
    strictPort: true,
    host: true, // Allow external connections
    allowedHosts: [
      'localhost',
      '.ngrok-free.dev',
      'dominik-unabiding-venously.ngrok-free.dev'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/storage': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/images': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  preview: {
    port: 5173,
    strictPort: true,
  }
})
