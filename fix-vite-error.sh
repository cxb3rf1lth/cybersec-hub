#!/bin/bash

# CyberConnect Vite Error Fix Script
# This script automatically fixes common Vite module resolution errors

echo "🔧 CyberConnect - Vite Error Fix Script"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Found package.json"

# Step 1: Check Node.js version
echo ""
echo "Step 1: Checking Node.js version..."
NODE_VERSION=$(node -v)
print_info "Node.js version: $NODE_VERSION"

# Step 2: Check npm version
echo ""
echo "Step 2: Checking npm version..."
NPM_VERSION=$(npm -v)
print_info "npm version: $NPM_VERSION"

# Step 3: Clean Vite cache
echo ""
echo "Step 3: Cleaning Vite cache..."
if [ -d "node_modules/.vite" ]; then
    rm -rf node_modules/.vite
    print_status "Removed node_modules/.vite"
else
    print_info "node_modules/.vite not found (already clean)"
fi

# Step 4: Clean TypeScript build cache
echo ""
echo "Step 4: Cleaning TypeScript cache..."
if [ -d "node_modules/.tmp" ]; then
    rm -rf node_modules/.tmp
    print_status "Removed node_modules/.tmp"
else
    print_info "node_modules/.tmp not found (already clean)"
fi

# Step 5: Clean dist directory
echo ""
echo "Step 5: Cleaning dist directory..."
if [ -d "dist" ]; then
    rm -rf dist
    print_status "Removed dist"
else
    print_info "dist directory not found (already clean)"
fi

# Step 6: Clean .vite directory (if exists)
echo ""
echo "Step 6: Cleaning .vite directory..."
if [ -d ".vite" ]; then
    rm -rf .vite
    print_status "Removed .vite"
else
    print_info ".vite directory not found (already clean)"
fi

# Step 7: Check disk space
echo ""
echo "Step 7: Checking disk space..."
DISK_SPACE=$(df -h . | awk 'NR==2 {print $4}')
print_info "Available disk space: $DISK_SPACE"

# Step 8: Verify Vite installation
echo ""
echo "Step 8: Verifying Vite installation..."
if [ -d "node_modules/vite" ]; then
    print_status "Vite is installed"
    VITE_VERSION=$(npm list vite --depth=0 2>/dev/null | grep vite@ | sed 's/.*vite@//')
    print_info "Vite version: $VITE_VERSION"
else
    print_warning "Vite is not installed"
    echo "Running npm install..."
    npm install
fi

# Step 9: Run the JavaScript cache fix script
echo ""
echo "Step 9: Running Node.js cache cleanup..."
if [ -f ".vite-cache-fix.js" ]; then
    node .vite-cache-fix.js
else
    print_warning ".vite-cache-fix.js not found, skipping"
fi

# Step 10: Summary
echo ""
echo "========================================"
echo "✨ Cleanup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Run: npm run dev"
echo "2. Open: http://localhost:5173"
echo ""
echo "If the error persists, try:"
echo "  npm run clean:full  # Complete reinstall"
echo ""
echo "For more help, see:"
echo "  - VITE_ERROR_FIX.md"
echo "  - TROUBLESHOOTING.md"
echo ""

# Ask if user wants to start dev server
read -p "Start development server now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo ""
    echo "Starting development server..."
    npm run dev
fi
