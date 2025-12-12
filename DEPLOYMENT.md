# LinkVault V2 - Deployment Guide

## 🚀 Active Deployment: Vite SPA

This project is currently configured to deploy the **Vite SPA version** located in `/src-vite`.

### Architecture

- **Framework**: Vite + React + TypeScript
- **Routing**: React Router (client-side)
- **Authentication**: Supabase Auth (client-side with AuthContext)
- **Backend**: Supabase (BaaS - Backend as a Service)
- **Deployment**: Vercel (static hosting)

### Build Configuration

**Build Command**: `npm run build:vite`
**Output Directory**: `dist-vite/`
**Framework**: Vite

### Environment Variables Required

Add these to your Vercel project settings:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important**:
- Vite requires `VITE_` prefix for env variables
- `NEXT_PUBLIC_*` variables will NOT work in Vite
- Variables are exposed to the browser (use anon key only)

### Vercel Configuration

The `vercel.json` file is configured for Vite deployment:

```json
{
  "buildCommand": "npm run build:vite",
  "outputDirectory": "dist-vite",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Deployment Steps

#### Option 1: Automatic (GitHub Connected)
1. Push changes to main branch
2. Vercel automatically builds and deploys
3. Check deployment status in Vercel dashboard

#### Option 2: Manual Deploy
```bash
npm run deploy:vite
```

### Local Development

**Start Vite Dev Server:**
```bash
npm run dev:vite
```
- Runs on `http://localhost:3001`
- Hot Module Replacement (HMR) enabled
- Uses `.env` file for local environment variables

**Preview Production Build:**
```bash
npm run build:vite
npm run preview:vite
```

### Project Structure

```
LinkVault-V2/
├── src-vite/              # ✅ DEPLOYED - Vite SPA
│   ├── components/        # React components
│   ├── contexts/          # AuthContext
│   ├── lib/               # Supabase client, utilities
│   ├── pages/             # Page components
│   ├── types/             # TypeScript types
│   ├── App.tsx            # Main app with routes
│   ├── main.tsx           # Entry point
│   └── index.html         # HTML template
├── src/                   # ❌ NOT DEPLOYED - Next.js app (archived)
├── dist-vite/             # Build output (auto-generated)
├── vercel.json            # Vercel config
├── vite.config.ts         # Vite config
└── package.json           # Dependencies & scripts
```

### Security Model

**Client-Side Authentication:**
- Auth checks performed in browser via `AuthContext`
- Protected routes use `<ProtectedRoute>` wrapper
- Session managed by Supabase client library

**Database Security:**
- **Row-Level Security (RLS)** enabled on all tables
- PostgreSQL enforces `auth.uid() = user_id` at database level
- Even if client route guard is bypassed, data remains secure

**Important**: Client-side route protection is for UX. Real security comes from Supabase RLS policies.

### Authentication Flow

1. User signs up/logs in → Supabase creates session
2. Session stored in browser (localStorage/cookies)
3. `AuthContext` loads session on app start
4. `onAuthStateChange` listener updates auth state
5. `ProtectedRoute` checks `user` before rendering
6. If no user → redirect to `/login`
7. Supabase auto-refreshes tokens in background

### Metadata Fetching

**Previous (Next.js API Route):**
- Server-side `/api/metadata` endpoint
- Fetched metadata from server

**Current (Vite Client-Side):**
- Uses CORS proxies: `allorigins.win`, `corsproxy.io`
- Fetches metadata in browser
- Implemented in `src-vite/lib/link-metadata.ts`

**Limitations:**
- Depends on third-party proxy availability
- May have rate limits
- Less reliable than server-side fetching

### Common Issues & Solutions

#### Issue: 500 MIDDLEWARE_INVOCATION_FAILED
**Cause**: Next.js middleware files present
**Solution**: Delete `middleware.ts` (already done)

#### Issue: Environment variables undefined
**Cause**: Using `NEXT_PUBLIC_*` instead of `VITE_*`
**Solution**: Rename to `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

#### Issue: Routes return 404 on refresh
**Cause**: Missing rewrites configuration
**Solution**: Already configured in `vercel.json` (rewrites all to `/index.html`)

#### Issue: Authentication not working
**Cause**: Wrong environment variables in Vercel
**Solution**: Add `VITE_*` prefixed variables in Vercel dashboard

### Testing Checklist

After deployment, verify:

- [ ] Can sign up new account
- [ ] Can log in
- [ ] Session persists after refresh
- [ ] Dashboard loads for authenticated users
- [ ] Can add new link
- [ ] Metadata auto-fetches
- [ ] Can edit/delete links
- [ ] Search and filter work
- [ ] Tag management works
- [ ] Theme toggle works
- [ ] Can log out
- [ ] Protected routes redirect when logged out

### Migration Notes

**What Changed from Next.js:**
- ❌ No server-side rendering (SSR)
- ❌ No API routes
- ❌ No edge middleware
- ✅ Client-side routing only
- ✅ Client-side auth guards
- ✅ Direct Supabase client calls

**Why Vite:**
- Faster builds
- Simpler deployment (static files)
- Lower hosting costs
- Better developer experience

### Support

For issues or questions:
- Check Vercel deployment logs
- Check browser console for errors
- Verify environment variables are set
- Test Supabase connection in local dev

---

**Last Updated**: 2025-12-12
**Deployment Type**: Vite SPA (Static)
**Status**: Active ✅
