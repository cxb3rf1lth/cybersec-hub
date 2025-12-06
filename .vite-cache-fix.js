#!/usr/bin/env node

/**
 * Vite Cache Fix Script
 * This script cleans up Vite cache and build artifacts
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

console.log('\n🔄 Killing any running Vite processes...');
try {
  if (process.platform === 'win32') {
    execSync('taskkill /F /IM node.exe /FI "WINDOWTITLE eq vite*" 2>nul', { stdio: 'ignore' });
  } else {
    execSync('pkill -f vite || true', { stdio: 'ignore' });
    execSync('fuser -k 5173/tcp 2>/dev/null || true', { stdio: 'ignore' });
  }
  console.log('✅ Processes cleaned');
} catch (error) {
  console.log('ℹ️  No running processes found');
}

console.log('\n✨ Cache cleanup complete!');
console.log('💡 Run "npm run dev" to start the development server\n');
