#!/usr/bin/env node

import { existsSync, rmSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

console.log('🔧 Fixing Vite module error in workspace environment...\n');

const projectRoot = process.cwd();

console.log('1️⃣ Killing any running processes...');
try {
  execSync('pkill -f vite 2>/dev/null || true', { stdio: 'inherit' });
  execSync('fuser -k 5173/tcp 2>/dev/null || true', { stdio: 'inherit' });
  console.log('   ✓ Processes killed');
} catch (error) {
  console.log('   ⚠ No processes to kill');
}

console.log('\n2️⃣ Cleaning all Vite-related caches...');
const cleanPaths = [
  'node_modules/.vite',
  'node_modules/.tmp',
  'node_modules/.cache',
  '.vite',
  '.cache',
  'dist',
  'node_modules/vite',
  'packages/spark-tools/node_modules/vite'
];

cleanPaths.forEach(path => {
  const fullPath = join(projectRoot, path);
  if (existsSync(fullPath)) {
    try {
      rmSync(fullPath, { recursive: true, force: true });
      console.log(`   ✓ Removed: ${path}`);
    } catch (error) {
      console.log(`   ⚠ Could not remove ${path}`);
    }
  }
});

console.log('\n3️⃣ Removing package-lock.json for clean install...');
const lockPath = join(projectRoot, 'package-lock.json');
if (existsSync(lockPath)) {
  rmSync(lockPath, { force: true });
  console.log('   ✓ Removed package-lock.json');
}

console.log('\n4️⃣ Cleaning npm cache...');
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('   ✓ npm cache cleaned');
} catch (error) {
  console.log('   ⚠ Could not clean npm cache');
}

console.log('\n5️⃣ Installing dependencies with workspace support...');
try {
  execSync('npm install --legacy-peer-deps', {
    stdio: 'inherit',
    cwd: projectRoot
  });
  console.log('   ✓ Dependencies installed');
} catch (error) {
  console.error('   ✗ Failed to install dependencies');
  process.exit(1);
}

console.log('\n6️⃣ Creating required directories...');
const requiredDirs = [
  'node_modules/.vite',
  'node_modules/.cache'
];

requiredDirs.forEach(dir => {
  const fullPath = join(projectRoot, dir);
  if (!existsSync(fullPath)) {
    mkdirSync(fullPath, { recursive: true });
    console.log(`   ✓ Created: ${dir}`);
  }
});

console.log('\n7️⃣ Creating Vite cache configuration...');
const cacheConfig = {
  "version": "6.4.1",
  "optimizeDeps": {
    "force": true
  }
};
const cacheConfigPath = join(projectRoot, 'node_modules/.vite/config.json');
try {
  writeFileSync(cacheConfigPath, JSON.stringify(cacheConfig, null, 2));
  console.log('   ✓ Cache configuration created');
} catch (error) {
  console.log('   ⚠ Could not create cache config (non-critical)');
}

console.log('\n✅ Vite module error fix complete!\n');
console.log('📝 Next steps:');
console.log('   1. Run: npm run dev');
console.log('   2. If the error persists, try: npm run clean && npm install\n');

process.exit(0);
