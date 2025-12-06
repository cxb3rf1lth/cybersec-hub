#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing Vite module resolution error...\n');

const dirsToClean = [
  'node_modules/.vite',
  'node_modules/.tmp',
  '.vite',
  'dist'
];

console.log('📌 Step 1: Cleaning Vite cache directories...');
dirsToClean.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    try {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`  ✅ Cleaned: ${dir}`);
    } catch (error) {
      console.log(`  ⚠️  Could not clean ${dir}: ${error.message}`);
    }
  } else {
    console.log(`  ℹ️  Not found: ${dir}`);
  }
});

console.log('\n📌 Step 2: Killing any running Vite processes...');
try {
  if (process.platform === 'win32') {
    execSync('taskkill /F /IM node.exe /FI "WINDOWTITLE eq vite*" 2>nul', { stdio: 'ignore' });
  } else {
    execSync('pkill -f vite || true', { stdio: 'ignore' });
    execSync('fuser -k 5173/tcp 2>/dev/null || true', { stdio: 'ignore' });
  }
  console.log('  ✅ Processes cleaned');
} catch (error) {
  console.log('  ℹ️  No running processes found');
}

const fullReinstall = process.argv.includes('--full');
if (fullReinstall) {
  console.log('\n📌 Step 3: Full reinstall (--full flag detected)...');
  console.log('  Removing node_modules and package-lock.json...');
  
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  const lockPath = path.join(process.cwd(), 'package-lock.json');
  
  if (fs.existsSync(nodeModulesPath)) {
    fs.rmSync(nodeModulesPath, { recursive: true, force: true });
    console.log('  ✅ Removed node_modules');
  }
  
  if (fs.existsSync(lockPath)) {
    fs.unlinkSync(lockPath);
    console.log('  ✅ Removed package-lock.json');
  }
  
  console.log('  Running npm install...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('  ✅ Dependencies reinstalled');
  } catch (error) {
    console.error('  ❌ Failed to reinstall dependencies');
    process.exit(1);
  }
} else {
  console.log('\n📌 Step 3: Skipping full reinstall (use --full flag if needed)...');
}

console.log('\n✅ Vite fix complete!\n');
console.log('Next steps:');
console.log('  • Run: npm run dev');
console.log('  • If still failing, run: node fix-vite-error.js --full\n');
