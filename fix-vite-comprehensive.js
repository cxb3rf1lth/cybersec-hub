#!/usr/bin/env node

import { execSync } from 'child_process';
import { rmSync, existsSync } from 'fs';
import { join } from 'path';

const cwd = process.cwd();

console.log('🔧 Comprehensive Vite Module Fix\n');

function exec(command, ignoreError = false) {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' }
    });
    return true;
  } catch (error) {
    if (!ignoreError) {
      console.error(`❌ Error running: ${command}`);
      console.error(error.message);
    }
    return false;
  }
}

function deleteDir(path) {
  const fullPath = join(cwd, path);
  if (existsSync(fullPath)) {
    console.log(`Deleting: ${path}`);
    try {
      rmSync(fullPath, { recursive: true, force: true });
      console.log(`✓ Deleted: ${path}`);
    } catch (error) {
      console.log(`⚠ Could not delete ${path}: ${error.message}`);
    }
  }
}

// Step 1: Kill processes
console.log('\n📍 Step 1: Killing running processes...');
exec('fuser -k 5000/tcp', true);
exec('fuser -k 5173/tcp', true);
exec('pkill -f vite', true);
console.log('Waiting for processes to terminate...');
await new Promise(resolve => setTimeout(resolve, 2000));

// Step 2: Clean caches
console.log('\n📍 Step 2: Cleaning caches and build artifacts...');
deleteDir('node_modules/.vite');
deleteDir('node_modules/.tmp');
deleteDir('node_modules/.cache');
deleteDir('dist');
deleteDir('.vite');
deleteDir('.cache');
deleteDir('node_modules/vite');
deleteDir('node_modules/@vitejs');
deleteDir('node_modules/@tailwindcss/vite');

// Step 3: Clear npm cache
console.log('\n📍 Step 3: Clearing npm cache...');
exec('npm cache clean --force');

// Step 4: Reinstall critical dependencies
console.log('\n📍 Step 4: Reinstalling Vite and plugins...');
exec('npm install vite@6.4.1 --save --legacy-peer-deps');
exec('npm install @vitejs/plugin-react-swc@3.11.0 --save-dev --legacy-peer-deps');
exec('npm install @tailwindcss/vite@4.1.17 --save --legacy-peer-deps');

// Step 5: Verify installation
console.log('\n📍 Step 5: Verifying installation...');
exec('npm list vite @vitejs/plugin-react-swc @tailwindcss/vite');

console.log('\n✅ Fix complete!');
console.log('\nYou can now run:');
console.log('  npm run dev\n');
