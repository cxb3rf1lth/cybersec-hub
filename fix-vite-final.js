#!/usr/bin/env node

import { existsSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

console.log('🔧 Starting comprehensive Vite module fix...\n');

const projectRoot = process.cwd();

const pathsToClean = [
  'node_modules/.vite',
  'node_modules/.tmp',
  'node_modules/.cache',
  '.vite',
  '.cache',
  'dist',
  'node_modules/vite/dist/node/chunks/dist.js.map',
];

console.log('1️⃣ Cleaning cache directories...');
pathsToClean.forEach(path => {
  const fullPath = join(projectRoot, path);
  if (existsSync(fullPath)) {
    try {
      rmSync(fullPath, { recursive: true, force: true });
      console.log(`   ✓ Cleaned: ${path}`);
    } catch (error) {
      console.log(`   ⚠ Could not clean ${path}: ${error.message}`);
    }
  }
});

console.log('\n2️⃣ Ensuring cache directories exist...');
const cacheDirs = [
  'node_modules/.vite',
  'node_modules/.cache'
];

cacheDirs.forEach(dir => {
  const fullPath = join(projectRoot, dir);
  if (!existsSync(fullPath)) {
    mkdirSync(fullPath, { recursive: true });
    console.log(`   ✓ Created: ${dir}`);
  }
});

console.log('\n3️⃣ Reinstalling Vite and plugins...');
try {
  execSync('npm install vite@6.4.1 @vitejs/plugin-react-swc@3.11.0 --save', {
    stdio: 'inherit',
    cwd: projectRoot
  });
  console.log('   ✓ Vite reinstalled successfully');
} catch (error) {
  console.error('   ✗ Failed to reinstall Vite:', error.message);
  process.exit(1);
}

console.log('\n4️⃣ Running Vite optimization...');
try {
  execSync('npx vite optimize --force', {
    stdio: 'inherit',
    cwd: projectRoot,
    timeout: 60000
  });
  console.log('   ✓ Vite optimization complete');
} catch (error) {
  console.log('   ⚠ Optimization skipped (non-critical)');
}

console.log('\n✅ Vite module fix complete!');
console.log('\n📝 You can now run: npm run dev\n');

process.exit(0);
