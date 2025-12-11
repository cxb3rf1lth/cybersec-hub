#!/usr/bin/env node

/**
 * Immediate Vite Module Fix
 * Resolves: Cannot find module 'vite/dist/node/chunks/dist.js'
 */

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = __dirname;

console.log('🚀 Immediate Vite Module Fix\n');

function run(cmd, silent = false) {
  try {
    if (!silent) console.log(`→ ${cmd}`);
    execSync(cmd, { cwd: root, stdio: silent ? 'pipe' : 'inherit' });
    return true;
  } catch (e) {
    if (!silent) console.log(`⚠ ${cmd} (non-critical)`);
    return false;
  }
}

function remove(path) {
  const fullPath = join(root, path);
  if (existsSync(fullPath)) {
    console.log(`🗑 Removing ${path}`);
    rmSync(fullPath, { recursive: true, force: true });
  }
}

// 1. Kill processes
console.log('1️⃣ Stopping processes...');
run('fuser -k 5173/tcp', true);
run('pkill -f vite', true);

// 2. Remove problematic directories
console.log('\n2️⃣ Removing corrupted modules...');
remove('node_modules/.vite');
remove('node_modules/vite');
remove('.vite');

// 3. Reinstall Vite
console.log('\n3️⃣ Reinstalling Vite...');
run('npm install vite@6.4.1 --no-save --legacy-peer-deps');

console.log('\n✅ Done! Try: npm run dev\n');
