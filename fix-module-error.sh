#!/bin/bash

echo "🔧 Fixing Vite module resolution error..."

# Kill any running Vite processes
echo "Killing running processes..."
pkill -f vite 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true
fuser -k 5000/tcp 2>/dev/null || true

# Clean Vite cache completely
echo "Cleaning Vite cache..."
rm -rf node_modules/.vite
rm -rf node_modules/.tmp
rm -rf node_modules/.cache
rm -rf .vite
rm -rf .cache
rm -rf dist

# Clean node_modules/vite specifically
echo "Cleaning Vite installation..."
rm -rf node_modules/vite

# Reinstall vite
echo "Reinstalling Vite..."
npm install vite@^6.4.1 --no-save

echo "✅ Fix complete! Try running 'npm run dev' again."
