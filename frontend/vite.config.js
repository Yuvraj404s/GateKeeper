import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api-gk': {
        target: 'http://localhost:8090',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-gk/, '')
      },
      '/analytics-gk': {
        target: 'http://localhost:8092',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/analytics-gk/, '')
      },
      '/ratelimit-gk': {
        target: 'http://localhost:8091',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ratelimit-gk/, '')
      }
    }
  }
})
