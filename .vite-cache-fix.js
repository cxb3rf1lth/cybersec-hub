#!/usr/bin/env node

/**
 * Vite Cache Fix Script
 * This script cleans up Vite cache and build artifacts
 */

const fs = require('fs');
const path = require('path');

const dirsToClean = [
  'node_modules/.vite',
  'node_modules/.tmp',
  'dist',
  '.vite'
];

console.log('🔧 Cleaning Vite cache and build artifacts...\n');

dirsToClean.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    try {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`✅ Cleaned: ${dir}`);
    } catch (error) {
      console.log(`⚠️  Could not clean ${dir}: ${error.message}`);
    }
  } else {
    console.log(`ℹ️  Not found: ${dir}`);
  }
});

console.log('\n✨ Cache cleanup complete!');
console.log('💡 Run "npm run dev" to start the development server\n');
