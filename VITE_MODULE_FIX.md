# Vite Module Resolution Error Fix

## Error Description
```
Cannot find module '/workspaces/spark-template/node_modules/vite/dist/node/chunks/dist.js' 
imported from /workspaces/spark-template/node_modules/vite/dist/node/chunks/config.js
```

This error occurs when Vite's internal module structure becomes corrupted or when there's a version mismatch.

## Quick Fix (Recommended)

Run the cache cleanup script:
```bash
npm run fix:vite
```

Then start the dev server:
```bash
npm run dev
```

## Manual Fix Steps

If the quick fix doesn't work, try these steps in order:

### Step 1: Clean All Caches
```bash
npm run clean
```

### Step 2: Kill Running Processes
```bash
npm run kill
```

### Step 3: Run Diagnostic
```bash
node diagnose-and-fix.js
```

### Step 4: Complete Reinstall (if needed)
```bash
npm run fix:vite:complete
```

## Nuclear Option

If all else fails, do a complete reinstall:

```bash
# Delete everything
rm -rf node_modules package-lock.json .vite dist

# Reinstall
npm install

# Try dev server
npm run dev
```

## Prevention

This error is often caused by:
1. **Interrupted installations** - Always let `npm install` complete
2. **Corrupted cache** - Run `npm run fix:vite` periodically
3. **Version conflicts** - Keep dependencies up to date
4. **Multiple terminal sessions** - Close all terminals before reinstalling

## Understanding the Error

Vite 6.x changed its internal module structure. The error indicates that:
- The old module path (`dist.js`) is being referenced
- But the new structure uses different chunk files
- This happens when cache is out of sync with installed version

## What the Fix Scripts Do

### `.vite-cache-fix.js`
- Removes `node_modules/.vite` cache
- Removes `node_modules/.tmp` temp files
- Removes `node_modules/.cache` 
- Kills running Vite processes
- Quick and safe

### `diagnose-and-fix.js`
- Checks Vite installation integrity
- Diagnoses the problem
- Applies appropriate fix
- Reinstalls if necessary

### `fix-vite-complete.js`
- Full nuclear option
- Reinstalls Vite from scratch
- Clears all caches
- Should fix any issue

## Need More Help?

Check these files for more troubleshooting:
- `TROUBLESHOOTING.md` - General issues
- `VITE_ERROR_FIX.md` - Other Vite errors
- `QUICK_FIX.md` - Quick solutions

## Technical Details

The error happens because:
1. Vite loads its config system from `config.js`
2. Config tries to import from `dist.js`
3. But in Vite 6.x, files are now in named chunks like `dep-*.js`
4. Cache has old paths, causing import failure

The fix is simple: clear cache so Vite rebuilds with correct paths.
