#!/bin/bash

echo "🔧 Force fixing Vite module error..."
echo ""

# Kill any running Vite processes
echo "1️⃣ Killing any running Vite processes..."
pkill -f vite 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true
sleep 1

# Remove all cache and build directories
echo "2️⃣ Removing all cache and build directories..."
rm -rf node_modules/.vite
rm -rf node_modules/.tmp
rm -rf node_modules/.cache
rm -rf .vite
rm -rf .cache
rm -rf dist
rm -rf node_modules/vite

# Remove lock file to force clean install
echo "3️⃣ Removing package-lock.json..."
rm -f package-lock.json

# Clean npm cache
echo "4️⃣ Cleaning npm cache..."
npm cache clean --force 2>/dev/null || true

# Reinstall Vite specifically
echo "5️⃣ Reinstalling Vite and plugins..."
npm install vite@6.4.1 @vitejs/plugin-react-swc@3.11.0 --save --legacy-peer-deps

# Verify installation
echo "6️⃣ Verifying Vite installation..."
if [ -d "node_modules/vite" ]; then
    echo "   ✓ Vite installed successfully"
else
    echo "   ✗ Vite installation failed"
    exit 1
fi

# Create cache directories
echo "7️⃣ Creating cache directories..."
mkdir -p node_modules/.vite
mkdir -p node_modules/.cache

echo ""
echo "✅ Vite fix complete!"
echo "📝 You can now run: npm run dev"
echo ""
