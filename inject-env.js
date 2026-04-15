const fsNative = require('fs');
const path = require('path');

/**
 * Build-time injection script for Vercel
 * Creates a 'public' directory, copies files, and replaces placeholders
 */

const srcDir = __dirname;
const distDir = path.join(__dirname, 'public');

// 1. Create public directory
if (!fsNative.existsSync(distDir)) {
    fsNative.mkdirSync(distDir);
}

// 2. Helper to copy files/folders recursively (native version for zero dependencies)
function copyRecursiveSync(src, dest) {
    const exists = fsNative.existsSync(src);
    const stats = exists && fsNative.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        if (!fsNative.existsSync(dest)) fsNative.mkdirSync(dest);
        fsNative.readdirSync(src).forEach(childItemName => {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        // Skip build-related files in the output
        if (src.endsWith('inject-env.js') || src.endsWith('package.json') || src.endsWith('package-lock.json') || src.includes('.git') || src.includes('public')) {
            return;
        }
        fsNative.copyFileSync(src, dest);
    }
}

try {
    console.log('[Build] Cleaning and preparing public directory...');
    // Copy all assets to public folder
    copyRecursiveSync(srcDir, distDir);

    const htmlPath = path.join(distDir, 'index.html');
    let html = fsNative.readFileSync(htmlPath, 'utf8');

    // Get number from Vercel Environment Variables
    const whatsappNumber = process.env.WHATSAPP_NUMBER || "91XXXXXXXXXX";

    console.log(`[Build] Injecting WhatsApp Number: ${whatsappNumber}`);

    const regex = /whatsappNumber:\s*"91XXXXXXXXXX"/g;
    const replacement = `whatsappNumber: "${whatsappNumber}"`;

    if (regex.test(html)) {
        html = html.replace(regex, replacement);
        fsNative.writeFileSync(htmlPath, html);
        console.log('[Build] Successfully injected WHATSAPP_NUMBER into public/index.html');
    } else {
        console.warn('[Build] Warning: Placeholder not found in public/index.html');
    }

    console.log('[Build] Done. Vercel will now deploy from the "public" folder.');

} catch (err) {
    console.error('[Build] Error during build process:', err);
    process.exit(1);
}
