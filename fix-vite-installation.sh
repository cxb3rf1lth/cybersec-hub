#!/bin/bash

echo "🔧 Fixing Vite module error..."

# Kill any running processes
echo "1️⃣ Killing existing processes..."
fuser -k 5000/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true
pkill -f vite 2>/dev/null || true
sleep 2

# Clean all cache and build directories
echo "2️⃣ Cleaning cache and build directories..."
rm -rf node_modules/.vite
rm -rf node_modules/.tmp
rm -rf node_modules/.cache
rm -rf dist
rm -rf .vite
rm -rf .cache

# Remove corrupted Vite installation
echo "3️⃣ Removing corrupted Vite installation..."
rm -rf node_modules/vite
rm -rf node_modules/.bin/vite

# Reinstall Vite
echo "4️⃣ Reinstalling Vite..."
npm install vite@^6.4.1 --force

# Verify installation
echo "5️⃣ Verifying Vite installation..."
if [ -f "node_modules/vite/dist/node/chunks/dist.js" ]; then
    echo "✅ Vite installed successfully!"
else
    echo "⚠️ dist.js not found, trying full reinstall..."
    rm -rf node_modules
    npm install --force
fi

echo "✅ Fix complete! You can now run 'npm run dev'"
