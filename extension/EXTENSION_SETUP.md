# Browser Extension Setup Guide

## Installation Steps

1. **Make sure LinkVault is running**
   - Start the Vite dev server: `npm run dev:vite`
   - It should be running on `http://localhost:3001`

2. **Load the Extension**
   - Open Chrome/Edge
   - Navigate to `chrome://extensions/` (or `edge://extensions/`)
   - Enable **Developer mode** (toggle in top right)
   - Click **Load unpacked**
   - Select the `extension` folder from this project

3. **First-Time Setup**
   - Click the LinkVault extension icon
   - If you see "Please log in to LinkVault first":
     - Click "Open Dashboard"
     - Log in to your LinkVault account
     - Return to any webpage
     - Click the extension icon again
   - You should now see the save link interface

4. **Create Extension Icons** (Optional)
   - The extension needs icon files: `icon16.png`, `icon48.png`, `icon128.png`
   - You can create simple placeholder images or use any 16x16, 48x48, and 128x128 pixel images
   - Place them in the `extension` folder

## How to Use

1. **Navigate to any webpage** you want to save
2. **Click the LinkVault extension icon** in your browser toolbar
3. **Add optional notes** if desired
4. **Click "Save Link"** - the link is saved instantly!
5. **View your saved links** by opening the LinkVault dashboard

## Features

- ✅ One-click link saving
- ✅ Uses current page title automatically
- ✅ No thumbnail images saved (as requested)
- ✅ Optional notes field
- ✅ Quick access to dashboard

## Troubleshooting

### "Not authenticated" error
- Make sure you're logged into LinkVault at `http://localhost:3001`
- Refresh the dashboard page
- Try clicking the extension icon again

### Extension not appearing
- Check that Developer mode is enabled
- Make sure you selected the correct `extension` folder
- Reload the extension if needed

### Links not saving
- Check browser console (F12) for errors
- Verify you're logged into LinkVault
- Make sure the Vite server is running on port 3001

## Notes

- The extension works with the Vite version running on `localhost:3001`
- For production, update the URLs in `popup.js` and `manifest.json` to your production URL
- The extension gets the session from the dashboard page's localStorage

