
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_DIR = path.join(__dirname, '../public/assets');

async function optimizeImages() {
    if (!fs.existsSync(ASSETS_DIR)) {
        console.error(`Directory not found: ${ASSETS_DIR}`);
        return;
    }

    const files = fs.readdirSync(ASSETS_DIR);
    let totalSaved = 0;

    console.log('Starting image optimization...');

    for (const file of files) {
        if (file.match(/\.(png|jpe?g)$/i)) {
            const filePath = path.join(ASSETS_DIR, file);
            const fileName = path.parse(file).name;
            const webpPath = path.join(ASSETS_DIR, `${fileName}.webp`);

            try {
                const metadata = await sharp(filePath).metadata();
                const originalSize = fs.statSync(filePath).size;

                // Resize if width > 1600, otherwise keep original width
                // Convert to WebP with quality 80
                const pipeline = sharp(filePath)
                    .webp({ quality: 80 });

                if (metadata.width > 1600) {
                    pipeline.resize({ width: 1600 });
                }

                await pipeline.toFile(webpPath);

                const newSize = fs.statSync(webpPath).size;
                const saved = originalSize - newSize;
                totalSaved += saved;

                console.log(`Optimized: ${file}`);
                console.log(`  Size: ${(originalSize / 1024 / 1024).toFixed(2)}MB -> ${(newSize / 1024 / 1024).toFixed(2)}MB`);
                console.log(`  Saved: ${(saved / 1024 / 1024).toFixed(2)}MB`);

            } catch (error) {
                console.error(`Error processing ${file}:`, error);
            }
        }
    }

    console.log('-----------------------------------');
    console.log(`Total space saved: ${(totalSaved / 1024 / 1024).toFixed(2)}MB`);
}

optimizeImages();
