# LinkVault V2 - Setup Guide

## Quick Start

### 1. Database Setup

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor**
4. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
5. Paste it into the SQL Editor and click **Run**
6. Verify the tables were created:
   - `links`
   - `tags`
   - `link_tags`

### 2. Run the Application

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Configure Supabase for Fake/Test Emails (Optional)

If you want to allow users to sign up with fake email domains (like `example.com`, `testing.com`):

1. Go to your Supabase Dashboard → **Authentication** → **Settings**
2. Find **"Enable email confirmations"** toggle
3. **Turn OFF** email confirmations (recommended for development/testing)
4. Click **Save**

See `SUPABASE_CONFIG.md` for detailed instructions.

### 4. Create Your First Account

1. Click "Sign up" on the login page
2. Enter your email and password (min. 6 characters)
   - You can use any email domain, including fake ones like `test@example.com`
3. You'll be automatically logged in and redirected to the dashboard

### 5. Save Your First Link

**Method 1: Paste URL**
1. Click "Save Link" button
2. Paste any URL (e.g., https://example.com)
3. Optionally add notes and tags
4. Click "Save Link"

**Method 2: Browser Extension**
1. Install the extension (see Browser Extension section below)
2. Navigate to any webpage
3. Click the LinkVault extension icon
4. Add optional notes
5. Click "Save Link"

### 6. Explore Features

- **Search**: Use the search bar to find links by title, description, domain, notes, or tags
- **Filter by Tags**: Click any tag in the sidebar to filter links
- **View Options**: Toggle between grid and list views
- **Sort**: Sort by Newest, Oldest, or Alphabetical
- **Edit/Delete**: Click the edit or delete icons on any link card
- **View Details**: Click a link card to see full details

## Browser Extension Setup

1. Open Chrome/Edge
2. Navigate to `chrome://extensions/` (or `edge://extensions/`)
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the `extension` folder from this project
6. The extension icon should appear in your toolbar

**Note:** The extension requires you to be logged into LinkVault in your browser. Make sure you're logged in at http://localhost:3000 (or your deployed URL) for the extension to work.

## Environment Variables

Your `.env` file is already configured with:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

These are set up and ready to use.

## Troubleshooting

### "Not authenticated" errors
- Make sure you're logged in
- Check that your Supabase credentials are correct in `.env`
- Verify RLS policies are set up correctly in the database

### Extension not saving links
- Make sure you're logged into LinkVault in your browser
- Check browser console for errors
- Verify the extension has the correct Supabase URL

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Check that Node.js version is 18 or higher
- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

## Next Steps

- Customize the styling in `src/app/globals.css`
- Add more features as needed
- Deploy to Vercel, Netlify, or your preferred hosting platform

