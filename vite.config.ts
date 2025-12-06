import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src-vite'),
    },
  },
  server: {
    port: 3001, // Different port from Next.js
    open: true,
  },
  build: {
    outDir: 'dist-vite',
  },
})

