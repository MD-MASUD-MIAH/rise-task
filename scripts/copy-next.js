const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'client', '.next');
const dest = path.join(__dirname, '..', '.next');

try {
  if (fs.existsSync(src)) {
    if (fs.existsSync(dest)) {
      fs.rmSync(dest, { recursive: true, force: true });
    }
    fs.cpSync(src, dest, { recursive: true });
    console.log('✅ Successfully copied client/.next to root .next for Vercel deployment');
  }
} catch (err) {
  console.warn('⚠️ Note: Could not copy .next to root:', err.message);
}
