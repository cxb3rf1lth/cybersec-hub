# 🚀 Deployment Guide for CyberConnect

This guide covers deploying CyberConnect to production environments, including GitHub Spark, static hosting, and self-hosted options.

## 📋 Table of Contents

- [GitHub Spark Deployment](#github-spark-deployment-recommended)
- [Static Hosting Deployment](#static-hosting-deployment)
- [Self-Hosted Deployment](#self-hosted-deployment)
- [Environment Configuration](#environment-configuration)
- [Production Checklist](#production-checklist)
- [Troubleshooting](#troubleshooting)

## 🌟 GitHub Spark Deployment (Recommended)

CyberConnect is built specifically for GitHub Spark with native KV storage support.

### Prerequisites

- GitHub account
- GitHub Spark access
- Repository published to GitHub

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/yourusername/cyberconnect-platform.git
   git branch -M main
   git push -u origin main
   ```

2. **Enable GitHub Spark**
   - Go to repository settings
   - Navigate to GitHub Spark section
   - Enable Spark deployment

3. **Configure Environment**
   - Set up environment variables in Spark dashboard
   - Configure API keys for external services
   - Set domain/subdomain if needed

4. **Deploy**
   ```bash
   npm run build
   git add .
   git commit -m "Production build"
   git push
   ```

5. **Verify Deployment**
   - Visit your Spark URL
   - Test KV storage functionality
   - Verify all features work

### Automatic Deployments

GitHub Spark automatically deploys on push to main:
```bash
# Make changes
git add .
git commit -m "feat: add new feature"
git push
# Spark automatically rebuilds and deploys
```

## 🌐 Static Hosting Deployment

Deploy to Vercel, Netlify, or other static hosts.

### Build for Production

```bash
npm run build
# Output in dist/ directory
```

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Configure**
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

### Netlify Deployment

1. **Create `netlify.toml`**
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

### Cloudflare Pages

1. **Build locally**
   ```bash
   npm run build
   ```

2. **Deploy via Dashboard**
   - Go to Cloudflare Pages
   - Create new project
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set build output: `dist`

### Important Notes for Static Hosting

⚠️ **KV Storage Limitation**: Static hosting doesn't support GitHub Spark's KV storage. You'll need to:
- Implement alternative storage (localStorage)
- Set up backend API for persistence
- Use a different state management solution

## 🖥️ Self-Hosted Deployment

Run CyberConnect on your own server.

### Option 1: Node.js Server

1. **Setup Server**
   ```bash
   # On server
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Clone and Build**
   ```bash
   git clone https://github.com/yourusername/cyberconnect-platform.git
   cd cyberconnect-platform
   npm install
   npm run build
   ```

3. **Serve with nginx**
   ```nginx
   server {
       listen 80;
       server_name cyberconnect.yourdomain.com;
       
       root /var/www/cyberconnect/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       location /assets {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

4. **Enable HTTPS**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d cyberconnect.yourdomain.com
   ```

### Option 2: Docker Deployment

1. **Create `Dockerfile`**
   ```dockerfile
   FROM node:18-alpine as builder
   
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   
   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Create `nginx.conf`**
   ```nginx
   server {
       listen 80;
       server_name localhost;
       
       root /usr/share/nginx/html;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       gzip on;
       gzip_types text/css application/javascript application/json image/svg+xml;
       gzip_min_length 1000;
   }
   ```

3. **Build and Run**
   ```bash
   docker build -t cyberconnect .
   docker run -d -p 80:80 --name cyberconnect cyberconnect
   ```

### Option 3: Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  cyberconnect:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

Deploy:
```bash
docker-compose up -d
```

## ⚙️ Environment Configuration

### Required Environment Variables

For external API integrations:

```bash
# Bug Bounty Platforms (Optional)
VITE_HACKERONE_API_KEY=your_key_here
VITE_BUGCROWD_API_KEY=your_key_here
VITE_INTIGRITI_API_KEY=your_key_here

# Threat Intelligence (Optional)
VITE_SHODAN_API_KEY=your_key_here
VITE_VIRUSTOTAL_API_KEY=your_key_here

# Cloud Providers (Optional)
VITE_AWS_ACCESS_KEY=your_key_here
VITE_DIGITALOCEAN_TOKEN=your_token_here
```

### Setting Environment Variables

**GitHub Spark:**
- Set in Spark dashboard under Settings > Environment Variables

**Vercel/Netlify:**
- Set in project settings > Environment Variables
- Prefix with `VITE_` for client-side access

**Docker:**
```bash
docker run -d \
  -e VITE_HACKERONE_API_KEY=your_key \
  -p 80:80 cyberconnect
```

**Docker Compose:**
```yaml
environment:
  - VITE_HACKERONE_API_KEY=your_key
  - VITE_BUGCROWD_API_KEY=your_key
```

## ✅ Production Checklist

Before deploying to production:

### Security
- [ ] Remove all console.log statements with sensitive data
- [ ] API keys stored securely (environment variables)
- [ ] HTTPS enabled (SSL certificate)
- [ ] CSP headers configured
- [ ] Rate limiting implemented
- [ ] Input validation on all forms
- [ ] XSS protection enabled

### Performance
- [ ] Code minified and optimized (`npm run build`)
- [ ] Images compressed and optimized
- [ ] Lazy loading implemented for heavy components
- [ ] Service worker configured (if applicable)
- [ ] CDN configured for static assets
- [ ] Gzip/Brotli compression enabled
- [ ] Browser caching configured

### Functionality
- [ ] All features tested in production-like environment
- [ ] Cross-browser testing completed
- [ ] Mobile responsiveness verified
- [ ] Error boundaries implemented
- [ ] Loading states for all async operations
- [ ] Graceful degradation for unsupported features

### Monitoring
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Analytics set up (if needed)
- [ ] Performance monitoring enabled
- [ ] Uptime monitoring configured
- [ ] Log aggregation set up

### Documentation
- [ ] README updated with deployment info
- [ ] API documentation current
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Troubleshooting guide updated

## 🔧 Troubleshooting

### Build Failures

**Problem**: Build fails with TypeScript errors
```bash
# Solution: Run type check
npm run build -- --noCheck
```

**Problem**: Out of memory during build
```bash
# Solution: Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

### Runtime Issues

**Problem**: KV storage not working
- Ensure you're on GitHub Spark platform
- Check browser localStorage as fallback
- Verify KV API access

**Problem**: API calls failing
- Check environment variables are set
- Verify API keys are valid
- Check CORS configuration

**Problem**: Blank page after deployment
- Check browser console for errors
- Verify build output in dist/
- Check base URL in vite.config.ts
- Verify routing configuration

### Performance Issues

**Problem**: Slow initial load
```bash
# Analyze bundle size
npm run build
npx vite-bundle-visualizer
```

**Problem**: Slow animations
- Check for GPU acceleration (transform/opacity)
- Reduce animation complexity
- Use CSS animations over JS

### Common Errors

**"Module not found"**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**"Cannot find module '@/'"**
- Check tsconfig.json paths configuration
- Verify vite.config.ts aliases

**"Failed to load config"**
- Check vite.config.ts syntax
- Ensure all plugins are installed

## 📊 Post-Deployment

### Monitoring

Set up monitoring for:
- Uptime (UptimeRobot, Pingdom)
- Errors (Sentry, Rollbar)
- Performance (Lighthouse CI)
- Analytics (if needed)

### Backups

For GitHub Spark:
- KV data backed up automatically
- Repository is version controlled

For self-hosted:
```bash
# Backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf backup_$DATE.tar.gz /var/www/cyberconnect
```

### Updates

Keep dependencies updated:
```bash
npm audit
npm update
npm run build
# Test thoroughly
git commit -m "chore: update dependencies"
git push
```

## 🔄 Rollback Procedure

If issues occur after deployment:

**GitHub Spark:**
```bash
git revert HEAD
git push
```

**Docker:**
```bash
docker tag cyberconnect:latest cyberconnect:rollback
docker pull cyberconnect:previous
docker-compose up -d
```

**Static Hosting:**
- Use platform's rollback feature
- Or deploy previous build from git

## 📞 Support

If you encounter issues:
1. Check this troubleshooting guide
2. Review GitHub Issues
3. Check documentation
4. Open a new issue with details

## 🎉 Success!

Once deployed:
- ✅ Application is live and accessible
- ✅ All features working correctly
- ✅ Monitoring configured
- ✅ Backups automated
- ✅ Team notified

**Congratulations on deploying CyberConnect!** 🚀

---

For questions or improvements to this guide, please open an issue or PR.
