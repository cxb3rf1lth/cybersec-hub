# Quick Fix for Vite Module Error

## The Error
```
Cannot find module '/workspaces/spark-template/node_modules/vite/dist/node/chunks/dist.js'
```

## Quick Fix (Run This First)

### Option 1: Use the NPM Script (Recommended)
```bash
npm run fix:vite && npm run dev
```

### Option 2: Use the Shell Script
```bash
chmod +x fix-vite-now.sh
./fix-vite-now.sh
npm run dev
```

### Option 3: Manual Commands
```bash
# Clean cache
rm -rf node_modules/.vite node_modules/.tmp node_modules/.cache dist .vite .cache

# Kill processes
pkill -f vite || true
fuser -k 5173/tcp 2>/dev/null || true
fuser -k 5000/tcp 2>/dev/null || true

# Reinstall Vite
npm uninstall vite
npm install vite@^6.4.1

# Start dev server
npm run dev
```

## If That Doesn't Work

### Nuclear Option (Complete Reset)
```bash
# Delete everything
rm -rf node_modules package-lock.json dist .vite .cache

# Reinstall all dependencies
npm install

# Start dev server
npm run dev
```

## Why This Happens

Vite 6.x changed its internal module structure. The error occurs when:
1. Cache contains old module paths
2. Vite tries to load `dist.js` but it doesn't exist in the new structure
3. Installation was interrupted or corrupted

## Prevention

- Always let `npm install` complete fully
- Run `npm run fix:vite` if you see any Vite errors
- Don't manually edit `node_modules`
- Close all dev servers before reinstalling

## Still Having Issues?

1. Make sure no other processes are using ports 5000 or 5173
2. Check that you have write permissions to node_modules
3. Try restarting your terminal/IDE
4. Check for disk space issues

## Success Check

After fixing, you should see:
```
VITE v6.4.1  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

That's it! Your app should now be running.
