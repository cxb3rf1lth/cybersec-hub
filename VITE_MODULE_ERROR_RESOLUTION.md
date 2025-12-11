# Vite Module Error - Resolution Guide

## Error Description
```
Cannot find module '/workspaces/spark-template/node_modules/vite/dist/node/chunks/dist.js' 
imported from /workspaces/spark-template/node_modules/vite/dist/node/chunks/config.js
```

## Root Cause
This error occurs when:
1. Vite's internal module structure becomes corrupted during installation
2. Incomplete npm installation process
3. Version conflicts between Vite and its plugins
4. Cached build artifacts interfering with module resolution

## Resolution Steps

### Quick Fix
Run the comprehensive fix script:
```bash
npm run fix
```

This will automatically:
- Kill any running Vite processes
- Clean all cache directories
- Remove corrupted Vite installations
- Reinstall Vite and related plugins with correct versions
- Verify the installation

### Manual Fix (if automatic fix fails)

#### Step 1: Clean Environment
```bash
# Kill all running processes
npm run kill

# Clean caches
rm -rf node_modules/.vite
rm -rf node_modules/.cache
rm -rf .vite
rm -rf dist

# Remove Vite modules
rm -rf node_modules/vite
rm -rf node_modules/@vitejs
rm -rf node_modules/@tailwindcss/vite
```

#### Step 2: Clear npm Cache
```bash
npm cache clean --force
```

#### Step 3: Reinstall Dependencies
```bash
# Reinstall Vite
npm install vite@6.4.1 --save --legacy-peer-deps

# Reinstall Vite plugins
npm install @vitejs/plugin-react-swc@3.11.0 --save-dev --legacy-peer-deps
npm install @tailwindcss/vite@4.1.17 --save --legacy-peer-deps
```

#### Step 4: Verify Installation
```bash
npm list vite @vitejs/plugin-react-swc @tailwindcss/vite
```

#### Step 5: Start Development Server
```bash
npm run dev
```

## Prevention

To prevent this error in the future:

1. **Use consistent package manager**: Always use npm (not yarn/pnpm mixed)
2. **Clean before reinstall**: Run `npm run clean` before major updates
3. **Use legacy-peer-deps flag**: When installing packages with peer dependency conflicts
4. **Don't interrupt installations**: Let npm complete fully before stopping
5. **Regular cache cleanup**: Periodically run `npm cache clean --force`

## Alternative Solutions

### Nuclear Option (Complete Reinstall)
If the above doesn't work:
```bash
# Remove everything
rm -rf node_modules
rm -rf package-lock.json
rm -rf .vite
rm -rf dist

# Fresh install
npm install --legacy-peer-deps
```

### Workspace Issues
If you're using npm workspaces (this project does):
```bash
# Reinstall from root
npm install --legacy-peer-deps --force

# If specific workspace has issues
cd packages/spark-tools
npm install --legacy-peer-deps
cd ../..
```

## Verification

After fixing, verify everything works:
```bash
# Check Vite version
npm list vite

# Check plugin versions
npm list @vitejs/plugin-react-swc @tailwindcss/vite

# Test build
npm run build

# Test dev server
npm run dev
```

## Related Files
- `fix-vite-comprehensive.js` - Automated fix script
- `package.json` - Dependency versions
- `vite.config.ts` - Vite configuration
- `.npmrc` - npm configuration (if exists)

## Support
If you continue to experience issues:
1. Check the GitHub Issues page
2. Review TROUBLESHOOTING.md
3. Verify your Node.js version (should be 18+ or 20+)
4. Check disk space (npm requires sufficient space for cache)

## Status
✅ **RESOLVED** - Run `npm run fix` to apply the comprehensive fix.

Last Updated: 2024-12-19
