# Vite Version Setup Guide

This project now has **two versions**:
1. **Next.js version** (original) - in `src/` directory
2. **Vite version** (new) - in `src-vite/` directory

## Quick Start - Vite Version

### 1. Environment Variables

Create a `.env` file in the root (or use the existing one) with:

```env
VITE_SUPABASE_URL=https://hwcixfsxatizosadsnxo.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Or the Vite version will fall back to `NEXT_PUBLIC_*` variables if `VITE_*` are not set.

### 2. Run Vite Development Server

```bash
npm run dev:vite
```

This will start the Vite dev server on **http://localhost:3001** (different port from Next.js)

### 3. Build for Production

```bash
npm run build:vite
```

This creates a `dist-vite/` folder with the production build.

### 4. Preview Production Build

```bash
npm run preview:vite
```

## Differences from Next.js Version

### Architecture
- **Next.js**: Server-side rendering, API routes, file-based routing
- **Vite**: Client-side only (SPA), React Router for routing, no server components

### Routing
- **Next.js**: `src/app/login/page.tsx` → `/login`
- **Vite**: `src-vite/pages/LoginPage.tsx` → defined in `src-vite/App.tsx`

### Supabase Client
- **Next.js**: Separate client/server implementations
- **Vite**: Single client implementation (browser-only)

### Metadata Fetching
- **Next.js**: Uses API route `/api/metadata`
- **Vite**: Uses CORS proxy (allorigins.win) - can be replaced with your own backend

## Current Status

✅ **Completed:**
- Project structure and configuration
- Authentication pages (login, signup, password reset)
- Supabase client setup
- Auth context and protected routes
- Core utilities and types

🚧 **In Progress:**
- Dashboard page and components
- Link management features
- Search and filtering
- Tag system

## Running Both Versions

You can run both versions simultaneously:

**Terminal 1 (Next.js):**
```bash
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2 (Vite):**
```bash
npm run dev:vite
# Runs on http://localhost:3001
```

## Which Version to Use?

- **Next.js**: Better for production, SEO, server-side features
- **Vite**: Faster development, simpler setup, pure SPA

Both versions share the same database and Supabase configuration.

