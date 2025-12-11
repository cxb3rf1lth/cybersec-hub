# Vite Module Error Fix

## Problem
The error `Cannot find module '/workspaces/spark-template/node_modules/vite/dist/node/chunks/dist.js'` occurs when:

1. Vite's internal module structure has changed between versions
2. The npm cache is corrupted or stale
3. Workspace (monorepo) dependencies are not properly hoisted
4. There's a mismatch between the lockfile and actual dependencies

## Root Cause
This is typically caused by:
- Vite version 6.x changed its internal chunk structure
- The workspace setup with `@github/spark` as a local package creates symlink issues
- Cached dependencies referencing old Vite module paths

## Solution

### Quick Fix (Recommended)
```bash
npm run fix
```

This runs the `fix-vite-workspace.js` script which:
1. Kills any running Vite processes
2. Cleans all Vite-related caches
3. Removes package-lock.json for a clean install
4. Reinstalls dependencies with workspace support
5. Creates required cache directories
6. Configures Vite cache properly

### Manual Fix
If the quick fix doesn't work, try these steps:

```bash
# 1. Kill all Vite processes
npm run kill

# 2. Clean everything
npm run clean

# 3. Remove node_modules and lockfile
rm -rf node_modules package-lock.json

# 4. Clean npm cache
npm cache clean --force

# 5. Reinstall
npm install --legacy-peer-deps

# 6. Try running
npm run dev
```

### Alternative: Full Reset
```bash
npm run clean:full
```

This completely removes node_modules and reinstalls everything.

## Prevention

### .npmrc Configuration
We've added an `.npmrc` file with these settings:
```
legacy-peer-deps=true
prefer-workspace-packages=true
save-exact=false
```

### Package.json Scripts
Added a postinstall hook to ensure cache directories exist:
```json
"postinstall": "mkdir -p node_modules/.vite && mkdir -p node_modules/.cache"
```

### Vite Configuration
The `vite.config.ts` includes:
```typescript
cacheDir: 'node_modules/.vite',
optimizeDeps: {
  force: true,
  // ... other options
}
```

## Verification

After fixing, verify the installation:

```bash
# Check Vite is installed
ls -la node_modules/vite

# Check cache directory exists
ls -la node_modules/.vite

# Try running dev server
npm run dev
```

## Troubleshooting

### Error persists after fix
1. Check if you have multiple Node.js versions installed
2. Verify you're using Node.js 18+ (LTS recommended)
3. Check file permissions on node_modules directory
4. Try running with sudo (not recommended but may reveal permission issues)

### Slow installation
- The `--legacy-peer-deps` flag may make installation slower
- This is normal and ensures compatibility

### Build errors
- If you get build errors, run: `npm run optimize`
- This forces Vite to rebuild its dependency cache

## Related Files
- `fix-vite-workspace.js` - Main fix script
- `fix-vite-final.js` - Alternative fix script
- `force-fix-vite.sh` - Bash script version
- `.npmrc` - npm configuration
- `vite.config.ts` - Vite configuration
- `package.json` - Scripts and dependencies

## Additional Notes

### Workspace Structure
This project uses npm workspaces with `@github/spark` as a local package:
```
/workspaces/spark-template/
  ├── packages/
  │   └── spark-tools/
  ├── node_modules/
  └── package.json
```

The workspace structure requires special handling to avoid symlink issues with Vite.

### Vite Version
We're using Vite 6.4.1 which has a different internal structure than Vite 5.x:
- No `dist.js` in chunks directory
- Uses new chunking strategy with dep-*.js files
- Improved caching mechanism

## Support
If this fix doesn't resolve your issue, please:
1. Check the GitHub issues
2. Review the TROUBLESHOOTING.md guide
3. Open a new issue with the full error output

---

**Last Updated:** 2025-01-XX
**Vite Version:** 6.4.1
**Node Version:** 18+ (LTS)
