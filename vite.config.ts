import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
export default defineConfig({
  base: '/siftory-website/',
  plugins: [react()],
  build: {
    rollupOptions: { input: { home: resolve('index.html'), promo: resolve('promo/index.html') } },
  },
})
