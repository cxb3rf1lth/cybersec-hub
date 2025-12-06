# Quick Fix Guide - Vite Module Resolution Error

## The Problem

```
Cannot find module '/workspaces/spark-template/node_modules/vite/dist/node/chunks/dist.js'
```

This error occurs when Vite's internal cache becomes corrupted.

## Quick Solutions

### Option 1: Use the Automated Fix Script (Recommended)

```bash
node fix-vite-error.js
```

This will:
- Clean all Vite cache directories
- Kill any running Vite processes
- Prepare the environment for a clean start

### Option 2: Use npm Scripts

```bash
# Clean cache and restart
npm run clean
npm run dev
```

Or for a full fix:

```bash
# Full reinstall
npm run fix:vite:full
```

### Option 3: Manual Steps

```bash
# 1. Clean cache
rm -rf node_modules/.vite
rm -rf node_modules/.tmp
rm -rf .vite
rm -rf dist

# 2. Kill processes
pkill -f vite || true
fuser -k 5173/tcp 2>/dev/null || true

# 3. Restart
npm run dev
```

### Option 4: Nuclear Option (If nothing else works)

```bash
# Complete reinstall
node fix-vite-error.js --full
```

Or manually:

```bash
rm -rf node_modules
rm -rf package-lock.json
npm install
npm run dev
```

## Prevention

To prevent this error:

1. Always complete npm installs (don't Ctrl+C)
2. Run `npm run clean` before major updates
3. Keep sufficient disk space available
4. Don't manually edit files in node_modules

## Verification

After fixing, you should see:

```
✅ Dev server starts without errors
✅ Browser opens to http://localhost:5173
✅ Application loads correctly
✅ No module resolution errors in console
```

## Still Having Issues?

1. Check Node.js version: `node -v` (should be >= 18)
2. Check npm version: `npm -v` (should be >= 9)
3. Check disk space: `df -h`
4. Try on a clean terminal session
5. Restart your editor/IDE
6. See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for more help

## Common Causes

- Interrupted npm install
- Corrupted Vite cache
- Disk full during build
- File system errors
- Multiple Vite versions
- Symlink issues in workspaces

---

**Last Updated:** 2024
**Status:** ✅ Multiple fix options available
