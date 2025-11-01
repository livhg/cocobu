# PWA Icons

This directory contains icons for the Progressive Web App.

## Required Icons

The following icons need to be generated from `icon.svg`:

### App Icons
- `icon-192x192.png` - Standard app icon (192x192)
- `icon-512x512.png` - High-res app icon (512x512)
- `icon-192x192-maskable.png` - Maskable icon with safe zone (192x192)
- `icon-512x512-maskable.png` - Maskable icon with safe zone (512x512)

### Shortcut Icons
- `shortcut-books.png` - Books shortcut icon (96x96)
- `shortcut-add.png` - Add shortcut icon (96x96)

## Generating Icons

### Option 1: Using online tools
1. Upload `icon.svg` to https://realfavicongenerator.net/
2. Select PWA icon options
3. Download and extract to this directory

### Option 2: Using ImageMagick
```bash
# Install ImageMagick
sudo apt-get install imagemagick

# Generate from SVG
convert icon.svg -resize 192x192 icon-192x192.png
convert icon.svg -resize 512x512 icon-512x512.png

# For maskable icons, add safe zone padding (20%)
convert icon.svg -resize 154x154 -background transparent -gravity center -extent 192x192 icon-192x192-maskable.png
convert icon.svg -resize 410x410 -background transparent -gravity center -extent 512x512 icon-512x512-maskable.png
```

### Option 3: Using sharp (Node.js)
```javascript
const sharp = require('sharp');

// Generate standard icons
sharp('icon.svg').resize(192, 192).png().toFile('icon-192x192.png');
sharp('icon.svg').resize(512, 512).png().toFile('icon-512x512.png');

// Generate maskable icons (with safe zone)
sharp('icon.svg').resize(154, 154).extend({
  top: 19, bottom: 19, left: 19, right: 19,
  background: { r: 0, g: 0, b: 0, alpha: 0 }
}).png().toFile('icon-192x192-maskable.png');
```

## Maskable Icons

Maskable icons include a "safe zone" to ensure the icon looks good on all devices:
- The icon content should be within 80% of the total area
- The outer 10% on all sides is the safe zone
- Background should extend to fill the entire icon

## Favicon

The standard favicon files should also be in the public root:
- `favicon.ico` (16x16, 32x32, 48x48 multi-size)
- `apple-touch-icon.png` (180x180)

## Current Status

⚠️ **Placeholder icons needed**: The actual PNG files need to be generated from the SVG source.

For MVP, you can use the SVG directly, but for production, convert to PNG for better browser support.
