# Vercel Deployment Guide

## Quick Deploy

To deploy the updated Vite website to your existing Vercel project:

```bash
# 1. Login to Vercel (if not already logged in)
vercel login

# 2. Link to your existing project (if not already linked)
vercel link

# 3. Deploy to production
npm run deploy:vite
# or
vercel --prod
```

## Environment Variables

Make sure these environment variables are set in your Vercel project:

1. Go to [Vercel Dashboard](https://vercel.com/isamiciqs-projects/link-vault-v2/settings/environment-variables)
2. Add the following variables:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

## Automatic Deployment via Git

If your repository is connected to Vercel, simply push your changes:

```bash
git add .
git commit -m "Fix middleware issues for Vite domain"
git push
```

Vercel will automatically detect the `vercel.json` configuration and deploy.

## Manual Deployment Steps

1. **Login to Vercel:**
   ```bash
   vercel login
   ```
   Follow the prompts to authenticate.

2. **Link Project (if needed):**
   ```bash
   vercel link
   ```
   Select your existing project: `link-vault-v2`

3. **Deploy:**
   ```bash
   vercel --prod
   ```

## Configuration

The `vercel.json` file is already configured with:
- Build command: `npm run build:vite`
- Output directory: `dist-vite`
- SPA routing rewrites for React Router
- Cache headers for static assets

