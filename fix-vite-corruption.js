#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Starting Vite corruption fix...\n');

function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    execSync(command, { 
      stdio: 'inherit', 
      cwd: __dirname,
      env: { ...process.env, NODE_ENV: 'development' }
    });
    console.log(`✅ ${description} completed\n`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    console.log(`🗑️  Removing ${path.basename(dirPath)}...`);
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✅ Removed ${path.basename(dirPath)}\n`);
  }
}

function removeFile(filePath) {
  if (fs.existsSync(filePath)) {
    console.log(`🗑️  Removing ${path.basename(filePath)}...`);
    fs.unlinkSync(filePath);
    console.log(`✅ Removed ${path.basename(filePath)}\n`);
  }
}

async function main() {
  console.log('Step 1: Cleaning up corrupted files...\n');
  
  removeDirectory(path.join(__dirname, 'node_modules', 'vite'));
  removeDirectory(path.join(__dirname, 'node_modules', '.vite'));
  removeDirectory(path.join(__dirname, 'node_modules', '.cache'));
  removeDirectory(path.join(__dirname, 'node_modules', '.tmp'));
  removeDirectory(path.join(__dirname, 'dist'));
  removeDirectory(path.join(__dirname, '.vite'));
  removeFile(path.join(__dirname, 'node_modules', '.package-lock.json'));
  
  console.log('Step 2: Reinstalling Vite and related packages...\n');
  
  const packages = [
    'vite@^6.4.1',
    '@vitejs/plugin-react@^4.3.4',
    '@vitejs/plugin-react-swc@^3.11.0',
    '@tailwindcss/vite@^4.1.11'
  ];
  
  runCommand(
    `npm install ${packages.join(' ')} --legacy-peer-deps --prefer-online`,
    'Reinstalling Vite packages'
  );
  
  console.log('Step 3: Verifying Vite installation...\n');
  
  const viteDistPath = path.join(__dirname, 'node_modules', 'vite', 'dist', 'node', 'chunks', 'dist.js');
  const viteConfigPath = path.join(__dirname, 'node_modules', 'vite', 'dist', 'node', 'chunks', 'config.js');
  
  if (fs.existsSync(viteDistPath)) {
    console.log('✅ Vite dist.js found');
  } else {
    console.error('❌ Vite dist.js not found at:', viteDistPath);
  }
  
  if (fs.existsSync(viteConfigPath)) {
    console.log('✅ Vite config.js found');
  } else {
    console.error('❌ Vite config.js not found at:', viteConfigPath);
  }
  
  console.log('\nStep 4: Creating Vite cache directories...\n');
  
  const cacheDirs = [
    path.join(__dirname, 'node_modules', '.vite'),
    path.join(__dirname, 'node_modules', '.cache')
  ];
  
  cacheDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created ${path.relative(__dirname, dir)}`);
    }
  });
  
  console.log('\n🎉 Vite corruption fix completed!\n');
  console.log('You can now run: npm run dev\n');
}

main().catch(error => {
  console.error('❌ Fix failed:', error);
  process.exit(1);
});
