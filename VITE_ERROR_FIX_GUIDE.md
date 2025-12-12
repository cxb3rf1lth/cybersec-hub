# Vite Module Error Resolution

## Error Description
```
Cannot find module '/workspaces/spark-template/node_modules/vite/dist/node/chunks/dist.js' 
imported from /workspaces/spark-template/node_modules/vite/dist/node/chunks/config.js
```

## Root Cause
This error occurs when Vite's internal module structure becomes corrupted, typically due to:
- Incomplete npm installation
- Cache conflicts
- Package version mismatches
- File system issues during installation

## Quick Fix

Run the automated fix script:

```bash
npm run fix
```

This will:
1. Clean up corrupted Vite files
2. Remove stale caches
3. Reinstall Vite and related packages
4. Verify the installation
5. Recreate necessary cache directories

## Manual Fix (If Automated Fix Fails)

### Step 1: Clean Installation

```bash
# Remove corrupted files
rm -rf node_modules/vite
rm -rf node_modules/.vite
rm -rf node_modules/.cache
rm -rf dist
rm -rf .vite

# Reinstall Vite packages
npm install vite@^6.4.1 --legacy-peer-deps --prefer-online
npm install @vitejs/plugin-react@^4.3.4 --legacy-peer-deps
npm install @tailwindcss/vite@^4.1.11 --legacy-peer-deps
```

### Step 2: Verify Installation

Check that these files exist:
- `node_modules/vite/dist/node/chunks/dist.js`
- `node_modules/vite/dist/node/chunks/config.js`
- `node_modules/vite/dist/node/index.js`

### Step 3: Clear All Caches

```bash
npm run clean
```

### Step 4: Test

```bash
npm run dev
```

## Nuclear Option (Last Resort)

If all else fails, perform a complete reinstallation:

```bash
# Backup your source code (src/, index.html, etc.)
# Then run:
npm run clean:full
```

This will:
1. Delete `node_modules/`
2. Delete `package-lock.json`
3. Reinstall all dependencies from scratch

## Prevention

To prevent this error in the future:

1. **Always use npm scripts**: Use `npm run dev` instead of calling `vite` directly
2. **Use legacy peer deps**: When installing packages, use `--legacy-peer-deps` flag
3. **Keep Node.js updated**: Ensure you're using Node.js 18.x or later
4. **Avoid interrupted installations**: Don't cancel npm install operations mid-process

## Related Commands

```bash
# Fix Vite corruption
npm run fix

# Clean caches only
npm run clean

# Full clean reinstall
npm run clean:full

# Kill stuck Vite processes
npm run kill

# Force optimize dependencies
npm run optimize
```

## Technical Details

### Vite's Module Structure

Vite 6.x has a specific internal structure:
```
node_modules/vite/
├── dist/
│   └── node/
│       ├── index.js
│       └── chunks/
│           ├── dist.js      ← Missing file causes the error
│           └── config.js    ← Tries to import dist.js
```

When `dist.js` is missing or corrupted, `config.js` fails to load, causing the entire Vite build system to fail.

### Why --legacy-peer-deps?

This project uses React 19 and Vite 6, which have peer dependency conflicts with some plugins. The `--legacy-peer-deps` flag tells npm to use the legacy peer dependency resolution algorithm, which is more permissive.

### Why --prefer-online?

The `--prefer-online` flag forces npm to check the registry for the latest version, bypassing potentially corrupted local caches.

## Still Having Issues?

If you're still experiencing problems:

1. Check Node.js version: `node --version` (should be 18.x or higher)
2. Check npm version: `npm --version` (should be 9.x or higher)
3. Check disk space: `df -h`
4. Check file permissions in node_modules
5. Try running with sudo (if on Linux/Mac): `sudo npm run fix`
6. Check for antivirus interference (Windows)

## Success Indicators

After running the fix, you should see:
- ✅ Vite dist.js found
- ✅ Vite config.js found
- ✅ Created cache directories
- 🎉 Vite corruption fix completed!

Then `npm run dev` should start successfully without errors.
