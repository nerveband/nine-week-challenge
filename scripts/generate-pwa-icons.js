import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconPath = join(process.cwd(), 'src', 'assets', 'icon.png');
const outputDir = join(process.cwd(), 'public', 'icons');

async function generateIcons() {
  try {
    // Ensure output directory exists
    await mkdir(outputDir, { recursive: true });

    // Generate icons for each size
    await Promise.all(
      sizes.map(async (size) => {
        const outputPath = join(outputDir, `icon-${size}x${size}.png`);
        await sharp(iconPath)
          .resize(size, size)
          .png()
          .toFile(outputPath);
        console.log(`Generated ${size}x${size} icon`);
      })
    );

    // Generate maskable icon
    await sharp(iconPath)
      .resize(512, 512)
      .png()
      .toFile(join(outputDir, 'maskable-icon.png'));
    console.log('Generated maskable icon');

    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons(); 