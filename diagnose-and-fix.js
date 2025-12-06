#!/usr/bin/env node

/**
 * Diagnostic and Fix Script for Vite Module Resolution
 * Checks for common issues and applies fixes automatically
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Running diagnostics...\n');

function checkViteInstallation() {
  console.log('Checking Vite installation...');
  const vitePath = path.join(process.cwd(), 'node_modules', 'vite');
  
  if (!fs.existsSync(vitePath)) {
    console.log('❌ Vite not found in node_modules');
    return false;
  }
  
  const viteDistPath = path.join(vitePath, 'dist', 'node');
  if (!fs.existsSync(viteDistPath)) {
    console.log('❌ Vite dist/node directory missing');
    return false;
  }
  
  console.log('✅ Vite installation looks correct');
  return true;
}

function cleanCaches() {
  console.log('\n🧹 Cleaning caches...');
  const cacheDirs = [
    'node_modules/.vite',
    'node_modules/.tmp',
    'node_modules/.cache',
    '.vite',
    'dist'
  ];
  
  let cleaned = 0;
  cacheDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      try {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`  ✅ Cleaned: ${dir}`);
        cleaned++;
      } catch (error) {
        console.log(`  ⚠️  Could not clean ${dir}`);
      }
    }
  });
  
  return cleaned;
}

function killProcesses() {
  console.log('\n🔄 Killing Vite processes...');
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
    console.log('ℹ️  No processes to kill');
  }
}

function reinstallVite() {
  console.log('\n📦 Reinstalling Vite packages...');
  try {
    console.log('  Removing old Vite installation...');
    execSync('npm uninstall vite @vitejs/plugin-react @vitejs/plugin-react-swc', { 
      stdio: 'pipe' 
    });
    
    console.log('  Installing fresh Vite packages...');
    execSync('npm install vite@6.4.1 @vitejs/plugin-react@4.3.4 @vitejs/plugin-react-swc@3.10.1', { 
      stdio: 'inherit' 
    });
    
    console.log('✅ Vite reinstalled successfully');
    return true;
  } catch (error) {
    console.log('❌ Failed to reinstall Vite:', error.message);
    return false;
  }
}

async function main() {
  const viteOk = checkViteInstallation();
  
  if (!viteOk) {
    console.log('\n⚠️  Vite installation is corrupted. Running repair...');
    killProcesses();
    cleanCaches();
    
    if (!reinstallVite()) {
      console.log('\n❌ Automatic repair failed. Manual intervention needed:');
      console.log('   1. Delete node_modules folder');
      console.log('   2. Delete package-lock.json');
      console.log('   3. Run: npm install');
      process.exit(1);
    }
  } else {
    const cleaned = cleanCaches();
    killProcesses();
    
    if (cleaned > 0) {
      console.log('\n✨ Cleaned up cache files. Issues should be resolved.');
    } else {
      console.log('\n✨ No issues detected. System looks healthy.');
    }
  }
  
  console.log('\n💡 You can now run: npm run dev\n');
}

main().catch(error => {
  console.error('❌ Diagnostic failed:', error);
  process.exit(1);
});
