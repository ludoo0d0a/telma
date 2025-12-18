#!/usr/bin/env node

/**
 * Script to regenerate PWA favicons from source icons
 * Generates: pwa-192x192.png, pwa-512x512.png, pwa-maskable-512x512.png, favicon-196.png
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const FAVICONS_DIR = path.join(__dirname, '../public/favicons');

// Source icons
const SOURCE_192 = path.join(FAVICONS_DIR, 'android-chrome-192.png');
const SOURCE_512 = path.join(FAVICONS_DIR, 'android-chrome-512.png');

// Target icons to generate
const TARGETS = [
  {
    source: SOURCE_192,
    output: path.join(FAVICONS_DIR, 'pwa-192x192.png'),
    size: 192,
    description: 'PWA 192x192 icon'
  },
  {
    source: SOURCE_512,
    output: path.join(FAVICONS_DIR, 'pwa-512x512.png'),
    size: 512,
    description: 'PWA 512x512 icon'
  },
  {
    source: SOURCE_512,
    output: path.join(FAVICONS_DIR, 'favicon-196.png'),
    size: 196,
    description: 'Favicon 196x196'
  },
  {
    source: SOURCE_512,
    output: path.join(FAVICONS_DIR, 'pwa-maskable-512x512.png'),
    size: 512,
    maskable: true,
    description: 'PWA maskable 512x512 icon (with safe zone)'
  }
];

async function generateIcon(target) {
  try {
    // Check if source exists
    if (!fs.existsSync(target.source)) {
      throw new Error(`Source icon not found: ${target.source}`);
    }

    if (target.maskable) {
      // For maskable icons, create a 512x512 image with the icon centered
      // The safe zone is 80% of the image (410x410), with 10% padding on each side
      const safeZoneSize = Math.floor(target.size * 0.8); // 410px for 512px
      const padding = (target.size - safeZoneSize) / 2; // 51px padding

      // Resize source to safe zone size
      const resized = await sharp(target.source)
        .resize(safeZoneSize, safeZoneSize, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toBuffer();

      // Create a 512x512 transparent canvas and composite the resized icon in the center
      await sharp({
        create: {
          width: target.size,
          height: target.size,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
      })
        .composite([
          {
            input: resized,
            left: Math.floor(padding),
            top: Math.floor(padding)
          }
        ])
        .png()
        .toFile(target.output);

      console.log(`✓ Generated ${target.description}`);
    } else {
      // Regular icon - just resize
      await sharp(target.source)
        .resize(target.size, target.size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(target.output);

      console.log(`✓ Generated ${target.description}`);
    }
  } catch (error) {
    console.error(`✗ Failed to generate ${target.description}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('Generating PWA favicons...\n');

  // Check if favicons directory exists
  if (!fs.existsSync(FAVICONS_DIR)) {
    console.error(`Error: Favicons directory not found: ${FAVICONS_DIR}`);
    process.exit(1);
  }

  // Generate all icons
  try {
    for (const target of TARGETS) {
      await generateIcon(target);
    }
    console.log('\n✓ All favicons generated successfully!');
  } catch (error) {
    console.error('\n✗ Error generating favicons:', error.message);
    process.exit(1);
  }
}

main();

