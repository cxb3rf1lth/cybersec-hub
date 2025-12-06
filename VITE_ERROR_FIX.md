# Vite Module Resolution Error - Quick Fix Guide

## The Error

```
Cannot find module '/workspaces/spark-template/node_modules/vite/dist/node/chunks/dist.js' 
imported from /workspaces/spark-template/node_modules/vite/dist/node/chunks/config.js
```

## What This Means

This error occurs when Vite's internal module structure becomes corrupted or when there's a mismatch between cached files and the actual Vite installation. It's a common issue that can happen due to:

1. Interrupted npm installations
2. Corrupted Vite cache
3. Version conflicts
4. File system inconsistencies

## Immediate Solutions

### Quick Fix (Recommended)

Run these commands in order:

```bash
# Step 1: Clean Vite cache
npm run clean

# Step 2: Start dev server with force flag
npm run dev
```

### Alternative Fix Using the Cache Fix Script

```bash
# Run the automated cache cleanup script
node .vite-cache-fix.js

# Then start the dev server
npm run dev
```

### Manual Cleanup (If above doesn't work)

```bash
# Remove all Vite-related cache
rm -rf node_modules/.vite
rm -rf node_modules/.tmp
rm -rf .vite
rm -rf dist

# Force Vite to rebuild its cache
npm run dev --force
```

### Nuclear Option (Complete Reinstall)

If nothing else works:

```bash
# Remove everything
rm -rf node_modules
rm -rf package-lock.json
rm -rf node_modules/.vite
rm -rf node_modules/.tmp

# Fresh install
npm install

# Start dev server
npm run dev
```

## What We've Done to Prevent This

1. **Updated vite.config.ts** with:
   - Better error handling
   - Explicit cache directory configuration
   - Improved module resolution
   - Force optimization on startup

2. **Updated package.json** with:
   - Clean scripts for easy cache clearing
   - Force flags on dev command
   - Postinstall cleanup

3. **Created cleanup script** (`.vite-cache-fix.js`):
   - Automated cache cleanup
   - Safe error handling
   - Progress reporting

## Configuration Changes Made

### vite.config.ts
- Added `clearScreen: false` for better logging
- Set `force: true` in optimizeDeps
- Configured explicit cache directory
- Added comprehensive file extensions
- Improved HMR configuration

### package.json
- Added `--force` flag to dev command
- Added `--clearScreen false` for better error visibility
- Enhanced clean script
- Added postinstall hook

### tsconfig.json
- Fixed trailing comma issue
- Added proper exclude patterns
- Improved module resolution settings

## Verification

After running the fix, verify everything works:

```bash
# Start dev server
npm run dev

# You should see:
# - Vite starting up
# - No module resolution errors
# - Server running on http://localhost:5173
```

## If Problems Persist

1. **Check Node.js version:**
   ```bash
   node -v  # Should be >= 18.0.0
   ```

2. **Check npm version:**
   ```bash
   npm -v   # Should be >= 9.0.0
   ```

3. **Check disk space:**
   ```bash
   df -h    # Should have at least 2GB free
   ```

4. **Check file permissions:**
   ```bash
   ls -la node_modules/.vite
   ```

5. **Try with a clean environment:**
   ```bash
   # Close all terminals
   # Close your editor
   # Run the fix again
   ```

## Technical Details

### What the Error Really Means

Vite uses an internal module structure where configuration files reference other internal modules. When these references break (due to cache corruption or incomplete installs), Vite can't find its own internal files.

### Why Force Optimization Works

The `--force` flag tells Vite to:
- Ignore existing cache
- Re-scan all dependencies
- Rebuild the dependency graph
- Create fresh optimized bundles

### Why This Happens

Common causes:
1. **Interrupted installations** - Ctrl+C during `npm install`
2. **Disk full during build** - Not enough space for cache
3. **File system errors** - Corrupted files
4. **Version conflicts** - Multiple Vite versions
5. **Symlink issues** - Workspace resolution problems

## Prevention

To avoid this error in the future:

1. **Always complete npm installs:**
   - Don't interrupt installations
   - Wait for completion message

2. **Regular cleanup:**
   ```bash
   npm run clean  # Weekly
   ```

3. **Keep dependencies updated:**
   ```bash
   npm update
   ```

4. **Monitor disk space:**
   ```bash
   df -h
   ```

## Additional Resources

- [Troubleshooting Guide](TROUBLESHOOTING.md) - Complete troubleshooting documentation
- [Developer Onboarding](CLAUDE_DEVELOPER_ONBOARDING.md) - Setup guide
- [Vite Documentation](https://vitejs.dev/guide/troubleshooting.html) - Official Vite troubleshooting

## Quick Command Reference

```bash
# Most common fix
npm run clean && npm run dev

# Force fresh start
rm -rf node_modules/.vite && npm run dev --force

# Complete clean install
rm -rf node_modules package-lock.json && npm install && npm run dev

# Use automated script
node .vite-cache-fix.js && npm run dev
```

## Success Indicators

You'll know the fix worked when:
- ✅ Dev server starts without errors
- ✅ Browser opens to http://localhost:5173
- ✅ Application loads correctly
- ✅ HMR updates work properly
- ✅ No console errors about modules

## Still Need Help?

If you're still experiencing issues after trying all these fixes:

1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for more solutions
2. Review the error logs carefully
3. Try the fix on a different machine
4. Create an issue with full error details
5. Check Vite's GitHub issues for similar problems

---

**Last Updated:** 2024
**Status:** ✅ Fixes Applied and Tested
