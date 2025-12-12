import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  // IMPORTANT: the Vite app lives in `src-vite/` (this repo also contains a Next.js app in `src/`).
  // Setting `root` prevents Vercel builds from trying (and failing) to resolve `/src-vite/main.tsx`
  // from the repo-root `index.html`.
  root: path.resolve(__dirname, 'src-vite'),
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src-vite'),
    },
  },
  // Use the repo-root `public/` directory (shared assets).
  publicDir: path.resolve(__dirname, 'public'),
  server: {
    port: 3001, // Different port from Next.js
    open: true,
  },
  build: {
    // Output to repo root so Vercel can publish it via `outputDirectory: dist-vite`.
    outDir: path.resolve(__dirname, 'dist-vite'),
    emptyOutDir: true,
  },
  // Exclude Next.js dependencies from optimization
  // Vite only processes files imported from the entry point (src-vite/main.tsx),
  // so Next.js files like middleware.ts won't be processed automatically
  optimizeDeps: {
    exclude: ['next'],
  },
})

