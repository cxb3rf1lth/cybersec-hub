#!/usr/bin/env node

/**
 * Complete Vite Error Fix Script
 * Resolves module resolution issues by reinstalling Vite and dependencies
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Complete Vite Fix Starting...\n');

const dirsToClean = [
  'node_modules/.vite',
  'node_modules/.tmp',
  'node_modules/.cache',
  'dist',
  '.vite',
  '.cache'
];

console.log('Step 1: Cleaning cache directories...\n');
dirsToClean.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    try {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`✅ Cleaned: ${dir}`);
    } catch (error) {
      console.log(`⚠️  Could not clean ${dir}: ${error.message}`);
    }
  }
});

console.log('\nStep 2: Killing any running processes...');
try {
  if (process.platform === 'win32') {
    execSync('taskkill /F /IM node.exe /FI "WINDOWTITLE eq vite*" 2>nul', { stdio: 'ignore' });
  } else {
    execSync('pkill -f vite || true', { stdio: 'ignore' });
    execSync('fuser -k 5173/tcp 2>/dev/null || true', { stdio: 'ignore' });
    execSync('fuser -k 5000/tcp 2>/dev/null || true', { stdio: 'ignore' });
  }
  console.log('✅ Processes cleaned');
} catch (error) {
  console.log('ℹ️  No running processes found');
}

console.log('\nStep 3: Reinstalling Vite and related packages...');
try {
  console.log('Removing Vite...');
  execSync('npm uninstall vite @vitejs/plugin-react @vitejs/plugin-react-swc', { stdio: 'inherit' });
  
  console.log('\nReinstalling Vite...');
  execSync('npm install vite@^6.4.1 @vitejs/plugin-react@^4.3.4 @vitejs/plugin-react-swc@^3.10.1 --save', { stdio: 'inherit' });
  
  console.log('✅ Vite reinstalled successfully');
} catch (error) {
  console.log('⚠️  Error during reinstall:', error.message);
  console.log('Trying alternative approach...');
  
  try {
    execSync('npm install --force', { stdio: 'inherit' });
    console.log('✅ Force reinstall completed');
  } catch (forceError) {
    console.log('❌ Force reinstall failed:', forceError.message);
  }
}

console.log('\nStep 4: Clearing npm cache...');
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('✅ npm cache cleared');
} catch (error) {
  console.log('⚠️  Could not clear cache:', error.message);
}

console.log('\n✨ Complete fix process finished!');
console.log('💡 Now run "npm run dev" to start the development server\n');
