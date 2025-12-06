#!/bin/bash

echo "🔧 Fixing Vite module resolution error..."
echo ""

# Kill any running Vite processes
echo "📌 Step 1: Killing any running Vite processes..."
pkill -f vite || true
fuser -k 5173/tcp 2>/dev/null || true

# Clean Vite cache directories
echo "📌 Step 2: Cleaning Vite cache..."
rm -rf node_modules/.vite
rm -rf node_modules/.tmp
rm -rf .vite
rm -rf dist

# Clean package lock and reinstall if needed
if [ "$1" == "--full" ]; then
  echo "📌 Step 3: Full reinstall (--full flag detected)..."
  rm -rf node_modules
  rm -rf package-lock.json
  npm install
else
  echo "📌 Step 3: Skipping full reinstall (use --full flag if needed)..."
fi

# Force rebuild Vite cache
echo "📌 Step 4: Forcing Vite optimization..."
npx vite optimize --force 2>/dev/null || true

echo ""
echo "✅ Vite fix complete!"
echo ""
echo "Next steps:"
echo "  • Run: npm run dev"
echo "  • If still failing, run: ./fix-vite.sh --full"
echo ""
