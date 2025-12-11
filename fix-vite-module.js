#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

const projectRoot = process.cwd();

console.log('🔧 Fixing Vite module error...\n');

function executeCommand(command, description) {
  console.log(`${description}...`);
  try {
    execSync(command, { 
      cwd: projectRoot, 
      stdio: 'inherit',
      encoding: 'utf8'
    });
    console.log(`✅ ${description} completed\n`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

function removeDirectory(path, description) {
  console.log(`${description}...`);
  try {
    if (existsSync(path)) {
      rmSync(path, { recursive: true, force: true });
      console.log(`✅ Removed ${path}\n`);
    } else {
      console.log(`ℹ️ ${path} does not exist, skipping\n`);
    }
  } catch (error) {
    console.error(`❌ Failed to remove ${path}:`, error.message);
  }
}

async function fixViteModule() {
  console.log('Step 1: Killing existing processes');
  executeCommand('fuser -k 5000/tcp 2>/dev/null || true', 'Killing port 5000');
  executeCommand('fuser -k 5173/tcp 2>/dev/null || true', 'Killing port 5173');
  executeCommand('pkill -f vite 2>/dev/null || true', 'Killing Vite processes');
  
  console.log('\nStep 2: Cleaning cache directories');
  removeDirectory(join(projectRoot, 'node_modules/.vite'), 'Removing .vite cache');
  removeDirectory(join(projectRoot, 'node_modules/.tmp'), 'Removing .tmp cache');
  removeDirectory(join(projectRoot, 'node_modules/.cache'), 'Removing .cache');
  removeDirectory(join(projectRoot, 'dist'), 'Removing dist');
  removeDirectory(join(projectRoot, '.vite'), 'Removing .vite');
  removeDirectory(join(projectRoot, '.cache'), 'Removing .cache');

  console.log('\nStep 3: Removing corrupted Vite installation');
  removeDirectory(join(projectRoot, 'node_modules/vite'), 'Removing Vite package');
  
  console.log('\nStep 4: Reinstalling Vite');
  const installed = executeCommand('npm install vite@^6.4.1 --force', 'Installing Vite 6.4.1');
  
  if (!installed) {
    console.log('\n⚠️ Vite installation failed, attempting full reinstall...');
    removeDirectory(join(projectRoot, 'node_modules'), 'Removing all node_modules');
    executeCommand('npm install --force', 'Full dependency reinstall');
  }
  
  console.log('\nStep 5: Verifying installation');
  const viteDistPath = join(projectRoot, 'node_modules/vite/dist/node/chunks/dist.js');
  if (existsSync(viteDistPath)) {
    console.log('✅ Vite module verified successfully!');
    console.log('\n🎉 Fix complete! You can now run: npm run dev');
  } else {
    console.error('❌ Vite module still missing. Manual intervention required.');
    console.log('\nPlease run: rm -rf node_modules && npm install');
  }
}

fixViteModule().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
