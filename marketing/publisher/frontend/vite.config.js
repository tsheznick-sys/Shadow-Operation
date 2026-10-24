import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  server: { host: '0.0.0.0', allowedHosts: true, cors: true, proxy: { '/api': 'http://localhost:8003' } },
  plugins: [react()]
})
