# LinkVault V2

A modern link management application built with Next.js, TypeScript, and Supabase. Save, organize, and search through your favorite links with tags and personal notes.

## Features

### ✅ User Authentication
- Sign up with email and password
- Secure login and logout
- Password reset capability
- Each user sees only their own saved links

### ✅ Save Links
**Method 1: Paste URL**
- Paste any URL into input field
- Click "Save" or press Enter
- Link is saved instantly with auto-extracted metadata

**Method 2: Browser Extension**
- Click extension icon while on any webpage
- Current page saved with one click
- Quick confirmation shown

When a link is saved, automatically extracts:
- Page title
- Description (from meta tags)
- Thumbnail/preview image
- Domain name
- Date saved

User can optionally add:
- Personal notes
- Tags for organization

### ✅ Dashboard (View All Links)
- Display saved links as cards showing:
  - Thumbnail image (or placeholder if none)
  - Title (clickable to open original link)
  - Domain name
  - Short description snippet
  - Tags (if added)
  - Date saved
  - Quick actions: Edit, Delete

**View Options:**
- Grid view (cards)
- List view (compact)
- Sort by: Newest, Oldest, Alphabetical

### ✅ Search (Core Feature)
- Prominent search bar at top of dashboard
- Search finds links by:
  - Title
  - Description
  - Domain name
  - User's personal notes
  - Tags
- Results appear instantly as user types
- Highlight matching terms
- Show result count: "Found 7 links"

### ✅ Tags & Filtering
- Add multiple tags when saving a link
- Edit tags later
- Auto-suggest existing tags as user types
- Click any tag to filter by it
- Tag sidebar shows:
  - All user's tags
  - Count per tag: "marketing (12)"
  - Click to filter

### ✅ Edit & Delete Links
- Edit allows changing:
  - Title (if auto-extracted title is wrong)
  - Notes
  - Tags
- Delete:
  - Confirmation required: "Delete this link?"
  - Permanently removes link

### ✅ Link Details View
- Clicking a link card shows full details:
  - Large thumbnail
  - Full title and description
  - All tags
  - Personal notes
  - Date saved
  - "Open Link" button
  - "Copy Link" button
  - Edit and Delete options

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase project (you already have credentials)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/IsamicIQ/LinkVault-V2.git
   cd LinkVault-V2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   The `.env` file is already configured with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://hwcixfsxatizosadsnxo.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Set up the database**
   Run the migration file in your Supabase SQL editor:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
   - Run the migration

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Browser Extension Setup

1. Open Chrome/Edge and navigate to `chrome://extensions/` (or `edge://extensions/`)
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension` folder from this project
5. The extension icon should appear in your browser toolbar

**Note:** You'll need to create icon files (icon16.png, icon48.png, icon128.png) or use placeholder images for the extension to load properly.

## Project Structure

```
LinkVault-V2/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── api/         # API routes
│   │   ├── dashboard/   # Dashboard page
│   │   ├── login/        # Login page
│   │   ├── signup/       # Sign up page
│   │   └── links/        # Link details pages
│   ├── components/      # React components
│   ├── lib/             # Utility functions and Supabase client
│   └── types/           # TypeScript type definitions
├── extension/           # Browser extension files
├── supabase/
│   └── migrations/      # Database migration files
└── public/              # Static assets
```

## Database Schema

- **links**: Stores user's saved links
- **tags**: Stores user's tags
- **link_tags**: Junction table for many-to-many relationship between links and tags

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

Contributions are welcome!! Please feel free to submit a Pull Request.

## License

ISC

