const fs = require('fs');
const path = require('path');

/**
 * Build-time injection script for Vercel
 * Replaces placeholders in HTML and CSS with Environment Variables
 */

const htmlPath = path.join(__dirname, 'index.html');

try {
    let html = fs.readFileSync(htmlPath, 'utf8');

    // Get number from Vercel Environment Variables, or fallback to placeholder
    const whatsappNumber = process.env.WHATSAPP_NUMBER || "91XXXXXXXXXX";

    console.log(`[Build] Injecting WhatsApp Number: ${whatsappNumber}`);

    // Replace the default placeholder in index.html
    // This looks for the CONFIG object definition
    const regex = /whatsappNumber:\s*"91XXXXXXXXXX"/g;
    const replacement = `whatsappNumber: "${whatsappNumber}"`;

    if (regex.test(html)) {
        html = html.replace(regex, replacement);
        fs.writeFileSync(htmlPath, html);
        console.log('[Build] Successfully injected WHATSAPP_NUMBER into index.html');
    } else {
        console.warn('[Build] Warning: Could not find "91XXXXXXXXXX" placeholder in index.html');
    }

} catch (err) {
    console.error('[Build] Error during environment injection:', err);
    process.exit(1);
}
