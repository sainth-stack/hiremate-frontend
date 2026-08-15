import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Expose Cartesia / voice vars from .env to the client (no secrets in source code)
  envPrefix: ['VITE_', 'CARTESIA_', 'LANDING_'],
  server: {
    proxy: {
      // Optional dev proxy — set VITE_API_URL=/api to avoid CORS in local dev
      '/api': {
        target: process.env.VITE_DEV_API_PROXY || 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
