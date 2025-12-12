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
  // Exclude Next.js dependencies from optimization
  // Vite only processes files imported from the entry point (src-vite/main.tsx),
  // so Next.js files like middleware.ts won't be processed automatically
  optimizeDeps: {
    exclude: ['next'],
  },
})

