# Creating Extension Icons (Optional)

The extension will work without icons, but if you want to add them:

## Quick Method - Use Online Tool

1. Go to https://www.favicon-generator.org/ or https://realfavicongenerator.net/
2. Upload any image or create a simple design
3. Download the icons in sizes: 16x16, 48x48, 128x128
4. Rename them to: `icon16.png`, `icon48.png`, `icon128.png`
5. Place them in the `extension` folder

## Simple Method - Use Paint or Any Image Editor

1. Open Paint (or any image editor)
2. Create a new image:
   - Size: 16x16 pixels (for icon16.png)
   - Size: 48x48 pixels (for icon48.png)  
   - Size: 128x128 pixels (for icon128.png)
3. Draw a simple design (e.g., "LV" for LinkVault, or a bookmark icon)
4. Save as PNG
5. Place in the `extension` folder

## Or Use the HTML Generator

1. Open `create-icons.html` in your browser
2. Click the download buttons
3. The icons will be downloaded
4. Move them to the `extension` folder

## After Adding Icons

If you add icons later, update `manifest.json` to include:

```json
"action": {
  "default_popup": "popup.html",
  "default_icon": {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png"
  }
},
"icons": {
  "16": "icon16.png",
  "48": "icon48.png",
  "128": "icon128.png"
}
```



