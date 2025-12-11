#!/usr/bin/env node

/**
 * Emergency Vite Module Fix
 * Fixes: Cannot find module 'dist.js' error
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const exec = (cmd) => {
  try {
    execSync(cmd, { stdio: 'inherit' });
    return true;
  } catch {
    return false;
  }
};

console.log('🔧 Emergency Vite Fix Starting...\n');

// Check if dist.js exists
const distPath = join(process.cwd(), 'node_modules/vite/dist/node/chunks/dist.js');

if (existsSync(distPath)) {
  console.log('✅ Vite installation looks OK. Cleaning cache...');
  exec('rm -rf node_modules/.vite .vite node_modules/.cache');
  console.log('✅ Cache cleaned. Try npm run dev');
  process.exit(0);
}

console.log('❌ Vite installation corrupted. Fixing...\n');

// Step 1: Kill processes
console.log('1️⃣ Killing processes...');
exec('pkill -f vite || true');
exec('fuser -k 5173/tcp || true');

// Step 2: Clean
console.log('2️⃣ Cleaning...');
exec('rm -rf node_modules/.vite .vite dist node_modules/.cache node_modules/.tmp');

// Step 3: Remove vite
console.log('3️⃣ Removing Vite...');
exec('rm -rf node_modules/vite node_modules/.bin/vite');

// Step 4: Reinstall
console.log('4️⃣ Reinstalling Vite...');
if (!exec('npm install vite@6.4.1 --no-save --force')) {
  console.log('⚠️ Failed, trying full reinstall...');
  exec('rm -rf node_modules package-lock.json');
  exec('npm install');
}

// Verify
if (existsSync(distPath)) {
  console.log('\n✅ SUCCESS! Run: npm run dev');
} else {
  console.log('\n❌ FAILED. Manual fix needed:');
  console.log('   rm -rf node_modules && npm install');
}
