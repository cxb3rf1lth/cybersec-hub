#!/bin/bash

echo "🔧 Fixing Vite Module Error..."
echo ""

echo "Step 1: Cleaning cache directories..."
rm -rf node_modules/.vite
rm -rf node_modules/.tmp
rm -rf node_modules/.cache
rm -rf dist
rm -rf .vite
rm -rf .cache
echo "✅ Cache cleaned"

echo ""
echo "Step 2: Killing running processes..."
pkill -f vite 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true
fuser -k 5000/tcp 2>/dev/null || true
echo "✅ Processes killed"

echo ""
echo "Step 3: Reinstalling Vite..."
npm uninstall vite 2>/dev/null || true
npm install vite@^6.4.1 --save
echo "✅ Vite reinstalled"

echo ""
echo "✨ Fix complete!"
echo "💡 You can now run: npm run dev"
