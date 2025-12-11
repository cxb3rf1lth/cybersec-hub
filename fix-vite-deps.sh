#!/bin/bash

echo "🔧 Fixing Vite module error..."

# Step 1: Kill any running processes
echo "Step 1: Killing running processes..."
fuser -k 5000/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true
pkill -f vite 2>/dev/null || true
sleep 2

# Step 2: Clean all caches and build artifacts
echo "Step 2: Cleaning caches..."
rm -rf node_modules/.vite
rm -rf node_modules/.tmp
rm -rf node_modules/.cache
rm -rf dist
rm -rf .vite
rm -rf .cache
rm -rf node_modules/vite

# Step 3: Reinstall vite specifically
echo "Step 3: Reinstalling Vite..."
npm install vite@6.4.1 --no-save --legacy-peer-deps

# Step 4: Reinstall vite-related dependencies
echo "Step 4: Reinstalling Vite plugins..."
npm install @vitejs/plugin-react-swc@3.11.0 --no-save --legacy-peer-deps
npm install @tailwindcss/vite@4.1.17 --no-save --legacy-peer-deps

# Step 5: Clear npm cache
echo "Step 5: Clearing npm cache..."
npm cache clean --force

# Step 6: Final reinstall
echo "Step 6: Final dependency check..."
npm install --legacy-peer-deps

echo "✅ Fix complete! Try running: npm run dev"
