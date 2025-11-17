# CyberConnect - Production Deployment Guide

## 🚀 Quick Start

### Option 1: One-Command Deployment to AWS

```bash
# Make script executable (first time only)
chmod +x deploy-to-aws.sh

# Deploy to AWS S3
./deploy-to-aws.sh

# Or with CloudFront CDN
CREATE_CLOUDFRONT=true ./deploy-to-aws.sh
```

### Option 2: Manual Deployment

See `aws-deploy.md` for detailed step-by-step instructions.

---

## 📋 Pre-Deployment Checklist

- [ ] AWS Account with Free Tier access
- [ ] AWS CLI installed and configured (`aws configure`)
- [ ] Node.js 18+ installed
- [ ] Application built successfully (`npm run build`)
- [ ] All tests passing
- [ ] Environment variables configured (`.env.production`)

---

## 🏗️ Production Build

```bash
# Install dependencies
npm install

# Build optimized production bundle
npm run build

# Test production build locally
npm run preview
# Access at: http://localhost:5000
```

### Build Optimizations

The production build includes:
- ✅ **Minification**: Terser with aggressive compression
- ✅ **Tree Shaking**: Dead code elimination
- ✅ **Code Splitting**: Vendor and UI chunks separated
- ✅ **CSS Optimization**: Purged unused styles
- ✅ **Asset Optimization**: Images and fonts optimized
- ✅ **Console Removal**: All console.log statements stripped
- ✅ **Source Maps**: Disabled for smaller bundle size

### Bundle Size

Expected production bundle size:
- Main JS: ~350-400 KB (gzipped)
- CSS: ~85-90 KB (gzipped)
- Total: ~450 KB (gzipped)

---

## 🌍 Deployment Options

### Option A: AWS S3 + CloudFront (Recommended)

**Cost**: $0-2/month (Free Tier eligible)
**Setup Time**: 15-20 minutes
**Supports**: HTTPS, Custom Domain, CDN

```bash
./deploy-to-aws.sh
```

See `aws-deploy.md` for detailed guide.

### Option B: Vercel

```bash
npm install -g vercel
vercel --prod
```

### Option C: Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Option D: GitHub Pages

```bash
npm run build
npm install -g gh-pages
gh-pages -d dist
```

### Option E: Docker Container

```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t cyberconnect .
docker run -p 80:80 cyberconnect
```

---

## ⚙️ Environment Configuration

### Production Environment Variables

Edit `.env.production`:

```env
VITE_ENV=production
VITE_API_BASE_URL=https://your-api-url.com
VITE_ENABLE_ANALYTICS=true
```

### API Keys Configuration

Users must configure their own API keys in the application Settings:

1. Open Settings → API Integration
2. Add keys for:
   - HackerOne
   - Bugcrowd
   - Intigriti
   - YesWeHack
   - VirusTotal
   - Shodan

**Note**: API keys are stored locally in the browser's IndexedDB.

---

## 🔒 Security Considerations

### Pre-Deployment Security Checklist

- [ ] All console.logs removed in production
- [ ] Source maps disabled
- [ ] HTTPS enabled (via CloudFront or platform)
- [ ] Content Security Policy headers configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] API keys not hardcoded
- [ ] Sensitive data not in source code
- [ ] Dependencies updated (`npm audit fix`)

### Security Headers

Add these headers to your hosting platform:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

---

## 📊 Monitoring & Analytics

### Free Tier Monitoring Options

1. **AWS CloudWatch** (if using AWS)
   - Monitor S3 bucket access
   - Track CloudFront requests
   - Set up billing alarms

2. **Google Analytics** (Optional)
   ```typescript
   // Add to index.html
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
   ```

3. **Sentry** (Error Tracking)
   ```bash
   npm install @sentry/react
   ```

---

## 🔄 Updates & Maintenance

### Updating the Deployed Application

```bash
# 1. Pull latest changes
git pull origin claude/test-unfinished-app-01Muyw5h6iAeiYWWvcnt3Shy

# 2. Install dependencies
npm install

# 3. Build new version
npm run build

# 4. Deploy to S3
aws s3 sync dist/ s3://your-bucket-name/ --delete

# 5. Invalidate CloudFront cache (if using CloudFront)
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

### Rollback to Previous Version

```bash
# 1. Checkout previous commit
git checkout PREVIOUS_COMMIT_HASH

# 2. Rebuild and deploy
npm run build
./deploy-to-aws.sh
```

---

## 🐛 Troubleshooting

### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules dist .vite
npm install
npm run build
```

### Application Shows Blank Page

1. Check browser console for errors
2. Verify all assets loaded correctly
3. Check base URL in `vite.config.ts`
4. Ensure proper file permissions on S3

### API Integrations Not Working

1. Verify API keys are configured in Settings
2. Check browser console for network errors
3. Verify CORS configuration
4. Test API endpoints directly

### Large Bundle Size

```bash
# Analyze bundle
npm install -D rollup-plugin-visualizer
npm run build
```

Then check the generated `stats.html` file.

---

## 💰 Cost Estimates

### AWS Free Tier (First 12 Months)

- **S3 Storage**: 5 GB (enough for 100+ deployments)
- **S3 Requests**: 20,000 GET, 2,000 PUT per month
- **CloudFront**: 1 TB data transfer out per month
- **Estimated Cost**: $0-2/month

### After Free Tier

- S3 Storage: $0.023 per GB/month (~$0.10/month)
- CloudFront: $0.085 per GB transfer (~$8.50 for 100 GB)
- **Total for 10k users/month**: ~$10-15/month

### Cost Optimization Tips

1. Enable CloudFront compression
2. Set appropriate cache headers
3. Use WebP images
4. Lazy load components
5. Monitor with AWS Cost Explorer

---

## 📈 Performance Optimization

### Lighthouse Scores Target

- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

### Optimization Checklist

- [x] Code splitting implemented
- [x] Lazy loading for routes
- [x] Images optimized
- [x] CSS minified and purged
- [x] JavaScript minified
- [x] GZIP compression enabled
- [x] Browser caching configured
- [x] CDN enabled (CloudFront)

---

## 🎯 Post-Deployment Tasks

1. **Test all features**
   - User registration/login
   - API integrations
   - Data persistence
   - Real-time features

2. **Configure monitoring**
   - Set up CloudWatch alarms
   - Enable error tracking
   - Monitor performance

3. **Update documentation**
   - Add production URL
   - Document deployment process
   - Update README

4. **Announce launch**
   - Update GitHub repository
   - Share with team
   - Gather feedback

---

## 📞 Support

- **Documentation**: See `CHANGELOG.md` for features
- **Issues**: https://github.com/cxb3rf1lth/cybersec-hub/issues
- **Deployment Guide**: `aws-deploy.md`
- **Branch**: `claude/test-unfinished-app-01Muyw5h6iAeiYWWvcnt3Shy`

---

## ✅ Deployment Verification

After deployment, verify:

- [ ] Application loads without errors
- [ ] User registration works
- [ ] Login/logout works
- [ ] Data persists across sessions
- [ ] API integrations can be configured
- [ ] All navigation works
- [ ] Mobile responsive
- [ ] HTTPS enabled
- [ ] Performance acceptable (Lighthouse)

---

**Ready to deploy? Run `./deploy-to-aws.sh` and go live! 🚀**
