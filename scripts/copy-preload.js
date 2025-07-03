const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '../dist-electron/preload.js');
const destPath = path.join(__dirname, '../dist/preload.js');

// Ensure the destination directory exists
if (!fs.existsSync(path.dirname(destPath))) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
}

// Copy the file
fs.copyFileSync(srcPath, destPath);

console.log('Preload script copied successfully!');
