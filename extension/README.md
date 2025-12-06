# LinkVault Browser Extension

## Quick Setup

1. **Start LinkVault**: Run `npm run dev:vite` (should be on `http://localhost:3001`)

2. **Load Extension**:
   - Open `chrome://extensions/` or `edge://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension` folder

3. **First Use**:
   - Open LinkVault dashboard: `http://localhost:3001`
   - Log in to your account
   - Keep the dashboard tab open (or the extension won't be able to access your session)
   - Navigate to any webpage
   - Click the extension icon
   - Click "Save Link"

## How It Works

The extension:
- Gets the current page URL and title automatically
- Saves to your LinkVault account
- No thumbnails are saved (as requested)
- Optional notes can be added

## Important Notes

- You must be logged into LinkVault in a browser tab for the extension to work
- The extension reads your session from the dashboard page
- If you log out, you'll need to log back in for the extension to work

## Creating Icons

You need to create three icon files:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)  
- `icon128.png` (128x128 pixels)

Place them in the `extension` folder. You can use any image editor or online tool to create these.
