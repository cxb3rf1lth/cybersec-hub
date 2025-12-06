# Troubleshooting Guide

## Common Issues and Solutions

### Vite Module Resolution Error

**Error Message:**
```
Cannot find module '/workspaces/spark-template/node_modules/vite/dist/node/chunks/dist.js'
```

**Cause:** This error typically occurs due to corrupted Vite cache or incomplete node_modules installation.

**Solutions:**

#### Solution 1: Clean Vite Cache (Quick Fix)
```bash
npm run clean
npm run dev
```

#### Solution 2: Force Reinstall Dependencies
```bash
rm -rf node_modules/.vite
rm -rf node_modules/.tmp
npm run dev --force
```

#### Solution 3: Complete Clean Install
```bash
rm -rf node_modules
rm -rf package-lock.json
npm install
npm run dev
```

#### Solution 4: Use the Cache Fix Script
```bash
node .vite-cache-fix.js
npm run dev
```

### Development Server Issues

**Issue:** Dev server won't start or crashes immediately

**Solutions:**
1. Check if port 5173 is already in use:
   ```bash
   lsof -ti:5173 | xargs kill -9
   ```

2. Clear all caches and restart:
   ```bash
   npm run clean
   npm run dev
   ```

3. Check for TypeScript errors:
   ```bash
   npm run lint
   ```

### Build Errors

**Issue:** Build fails with module resolution errors

**Solutions:**
1. Clean build artifacts:
   ```bash
   rm -rf dist
   npm run build
   ```

2. Update Vite and related packages:
   ```bash
   npm update vite @vitejs/plugin-react-swc @tailwindcss/vite
   ```

### Hot Module Replacement (HMR) Not Working

**Issue:** Changes don't reflect in the browser

**Solutions:**
1. Hard refresh the browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Restart the dev server
3. Clear browser cache
4. Check console for HMR errors

### TypeScript Errors

**Issue:** Type checking fails or shows incorrect errors

**Solutions:**
1. Restart TypeScript server in your editor
2. Clear TypeScript build info:
   ```bash
   rm -rf node_modules/.tmp
   ```
3. Check tsconfig.json for correct paths configuration

### Performance Issues

**Issue:** Dev server is slow or unresponsive

**Solutions:**
1. Enable source map optimization:
   - Already configured in `vite.config.ts`
   
2. Reduce file watching:
   ```bash
   # Add to .gitignore
   node_modules
   dist
   .vite
   ```

3. Optimize dependencies:
   ```bash
   npm run optimize
   ```

### API Integration Issues

**Issue:** API calls fail or return errors

**Solutions:**
1. Check API key configuration in the API Key Manager
2. Verify CORS settings for external APIs
3. Check browser console for detailed error messages
4. Ensure API endpoints are accessible

### Storage Issues

**Issue:** Data not persisting or localStorage errors

**Solutions:**
1. Clear browser localStorage:
   ```javascript
   localStorage.clear()
   ```
   
2. Check browser storage quota
3. Verify KV fallback is working correctly

## Getting Help

If none of these solutions work:

1. Check the [GitHub Issues](https://github.com/yourusername/cyberconnect-platform/issues)
2. Review the [Developer Onboarding Guide](CLAUDE_DEVELOPER_ONBOARDING.md)
3. Check the [API Documentation](API_DOCUMENTATION.md)
4. Submit a new issue with:
   - Error message
   - Steps to reproduce
   - System information
   - Browser console logs

## Prevention Tips

1. **Regular maintenance:**
   ```bash
   npm run clean  # Weekly
   npm audit fix  # Monthly
   ```

2. **Keep dependencies updated:**
   ```bash
   npm update
   ```

3. **Monitor package sizes:**
   ```bash
   npm list --depth=0
   ```

4. **Use proper Git workflow:**
   - Commit often
   - Don't commit node_modules
   - Use .gitignore properly

## Environment-Specific Issues

### Development Environment
- Use `npm run dev` for hot reloading
- Enable source maps for debugging
- Use browser DevTools for inspection

### Production Environment
- Use `npm run build` to create optimized bundle
- Test with `npm run preview` before deploying
- Monitor performance metrics
- Enable error tracking

## Debug Mode

To enable verbose logging:

```bash
# Linux/Mac
DEBUG=* npm run dev

# Windows
set DEBUG=* && npm run dev
```

## System Requirements

Ensure your system meets these requirements:
- Node.js >= 18.0.0
- npm >= 9.0.0
- Modern browser (Chrome, Firefox, Safari, Edge)
- Minimum 4GB RAM
- 2GB free disk space

## Still Having Issues?

Create an issue with this template:

```markdown
**Environment:**
- OS: [e.g., macOS 13.0]
- Node.js version: [run `node -v`]
- npm version: [run `npm -v`]
- Browser: [e.g., Chrome 120]

**Description:**
[Clear description of the issue]

**Steps to Reproduce:**
1. [First step]
2. [Second step]
3. [...]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Error Messages:**
```
[Paste error messages here]
```

**Screenshots:**
[If applicable]

**Additional Context:**
[Any other relevant information]
```
