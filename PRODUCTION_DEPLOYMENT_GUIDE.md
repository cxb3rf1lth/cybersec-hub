# 🚀 Production Deployment Guide

## ⚠️ CRITICAL SECURITY IMPROVEMENTS

This guide documents the major security enhancements made to prepare CyberConnect for production deployment.

---

## 🔐 Security Fixes Applied

### 1. **Replaced Trivial Encryption with Web Crypto API**

**Problem:** API keys were "encrypted" using reversible base64 + string reversal
```typescript
// OLD - INSECURE
private encryptKey(key: string): string {
  return btoa(key).split('').reverse().join('')
}
```

**Solution:** Implemented proper AES-GCM encryption with PBKDF2 key derivation
- File: `src/lib/secure-api-keys.ts`
- Uses browser's Web Crypto API
- 256-bit AES-GCM encryption
- 100,000 PBKDF2 iterations
- Random IV and salt for each encryption

### 2. **Eliminated Demo Tokens**

**Problem:** Application created fake `demo_` tokens when authentication failed
```typescript
// OLD - DANGEROUS
const demoToken = 'demo_' + btoa(Date.now().toString())
```

**Solution:** Authentication now fails explicitly with user-facing errors
- File: `src/lib/secure-auth.ts`
- No fallback to demo/test tokens
- All authentication goes through real backend
- Implements proper session management

### 3. **Fixed Authentication Storage**

**Problem:** Auth tokens stored in plain localStorage
```typescript
// OLD - INSECURE
localStorage.setItem('auth_token', JSON.stringify(tokenData))
```

**Solution:** Session management without localStorage
- Tokens stored in httpOnly cookies (server-side)
- In-memory session data only
- Automatic session expiry and cleanup
- No sensitive data accessible to JavaScript

### 4. **Removed Mock Data Fallbacks**

**Problem:** Application showed fake data when APIs failed, indistinguishable from real data

**Solution:**
- Clear error messages when APIs unavailable
- No fake bug bounty programs or threat feeds
- User explicitly informed when using demo mode

### 5. **Implemented Input Validation**

**New File:** `src/lib/input-validation.ts`
- Comprehensive Zod schemas for all inputs
- XSS prevention
- SQL injection protection
- Validates URLs, IPs, domains, CVEs, etc.
- Detects suspicious patterns

### 6. **Added Circuit Breaker Pattern**

**New File:** `src/lib/circuit-breaker.ts`
- Prevents cascading failures
- Automatic retry with exponential backoff
- Graceful degradation
- Per-service circuit breaking

### 7. **Environment Configuration Validation**

**New File:** `src/lib/production-config.ts`
- Validates all environment variables at startup
- Fails hard in production if misconfigured
- Detects security issues (HTTP in production, localhost URLs, etc.)
- Type-safe configuration access

---

## 📋 Pre-Deployment Checklist

### Required Environment Variables

Create `.env.production` file with these required variables:

```bash
# REQUIRED
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_WS_BASE_URL=wss://ws.yourdomain.com

# CRITICAL FLAGS
VITE_MOCK_APIS=false
VITE_ENABLE_DEBUG=false

# OPTIONAL SERVICES
VITE_SHODAN_API_KEY=your_real_shodan_key
VITE_VIRUSTOTAL_API_KEY=your_real_virustotal_key
VITE_GITHUB_CLIENT_ID=your_github_client_id

# SECURITY
VITE_SESSION_TIMEOUT=3600000
VITE_MAX_LOGIN_ATTEMPTS=5
VITE_RATE_LIMIT_PER_MINUTE=60

# ANALYTICS & LOGGING
VITE_ENABLE_ANALYTICS=true
VITE_LOG_LEVEL=info
```

### Pre-Deployment Verification

Run this checklist before deploying:

```bash
# 1. Check environment configuration
npm run check-config  # Validates all env vars

# 2. Run security audit
npm audit --production

# 3. Check for hardcoded secrets
grep -r "demo_\|test_\|placeholder" src/

# 4. Verify HTTPS/WSS usage
grep -r "http://\|ws://" src/lib/

# 5. Build for production
npm run build

# 6. Test production build
npm run preview
```

### Security Validation

✅ **API URLs**
- [ ] VITE_API_BASE_URL uses HTTPS (not HTTP)
- [ ] VITE_WS_BASE_URL uses WSS (not WS)
- [ ] No localhost or 127.0.0.1 in production URLs

✅ **Feature Flags**
- [ ] VITE_MOCK_APIS=false
- [ ] VITE_ENABLE_DEBUG=false

✅ **API Keys**
- [ ] No test/demo keys in production
- [ ] Keys from production services only
- [ ] Keys stored securely (environment variables, not in code)

✅ **Authentication**
- [ ] Backend implements httpOnly cookies
- [ ] HTTPS enabled on all domains
- [ ] CORS properly configured

✅ **Rate Limiting**
- [ ] Server-side rate limiting implemented
- [ ] Client-side limits are reasonable

---

## 🏗️ Backend Requirements

### Authentication Endpoints

Your backend must implement these endpoints:

#### POST /auth/login
```typescript
// Request
{
  "email": "user@example.com",
  "password": "securepassword"
}

// Response (200 OK)
{
  "userId": "user_123",
  "email": "user@example.com",
  "username": "user123"
}
// Sets httpOnly cookie: auth_token=...
```

#### POST /auth/register
```typescript
// Request
{
  "email": "user@example.com",
  "username": "user123",
  "password": "securepassword"
}

// Response (201 Created)
{
  "message": "Registration successful"
}
```

#### POST /auth/logout
```typescript
// Response (200 OK)
{
  "message": "Logged out successfully"
}
// Clears auth_token cookie
```

#### POST /auth/refresh
```typescript
// Response (200 OK)
{
  "message": "Token refreshed"
}
// Updates auth_token cookie
```

### Security Audit Endpoint

#### POST /security/audit
```typescript
// Request
{
  "timestamp": 1234567890,
  "event": "login_failed",
  "severity": "medium",
  "details": {...},
  "userAgent": "..."
}

// Response (202 Accepted)
{
  "logged": true
}
```

### Cookie Configuration

Ensure auth cookies use these settings:
```
Set-Cookie: auth_token=<token>;
  HttpOnly;
  Secure;
  SameSite=Strict;
  Max-Age=3600;
  Path=/
```

---

## 📊 Monitoring & Logging

### Circuit Breaker Monitoring

```typescript
import { CircuitBreakerManager } from '@/lib/circuit-breaker'

// Get status of all services
const breaker = CircuitBreakerManager.getInstance()
const stats = breaker.getAllStats()

// Example response:
{
  "hackerone_api": {
    "state": "CLOSED",
    "failures": 0,
    "successes": 145,
    "totalRequests": 145,
    "totalFailures": 0
  },
  "shodan_api": {
    "state": "OPEN",
    "failures": 5,
    "nextAttemptTime": 1234567890
  }
}
```

### Security Audit Logs

```typescript
import { SecureAuthManager } from '@/lib/secure-auth'

// Get recent security events
const auth = SecureAuthManager.getInstance()
const logs = auth.getAuditLogs(100)

// Events logged:
// - login_success
// - login_failed
// - login_attempt_locked
// - logout
// - session_expired
// - account_locked
```

---

## 🔧 Production Build

### Build Configuration

```bash
# Install dependencies
npm ci --production

# Build with production optimizations
NODE_ENV=production npm run build

# Output: dist/
```

### Deployment Platforms

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
vercel env add VITE_API_BASE_URL production
```

#### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Set environment variables
netlify env:set VITE_API_BASE_URL "https://api.yourdomain.com"
```

#### Docker
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🧪 Testing Production Build

### Manual Testing Checklist

1. **Authentication**
   - [ ] Login with valid credentials
   - [ ] Login with invalid credentials (should fail)
   - [ ] Session expires after timeout
   - [ ] Logout works correctly

2. **API Connections**
   - [ ] Connect to bug bounty platforms with real keys
   - [ ] Test API key validation
   - [ ] Verify rate limiting works
   - [ ] Test circuit breaker on API failure

3. **Security**
   - [ ] No console errors about missing encryption
   - [ ] No demo/test tokens visible
   - [ ] API keys not visible in localStorage
   - [ ] HTTPS enforced on all requests

4. **Error Handling**
   - [ ] API failures show user-friendly errors
   - [ ] Network errors handled gracefully
   - [ ] Circuit breaker prevents API spam

---

## 🚨 Known Limitations

### Client-Side Security

**Limitation:** Some security measures are client-side only

**Mitigation Required:**
- Implement server-side rate limiting
- Store API keys server-side (not in browser)
- Validate all inputs server-side
- Implement CSRF protection server-side

### API Key Storage

**Current:** Keys stored in-memory only (lost on refresh)

**Future Enhancement:**
- Implement secure server-side key vault
- Use OAuth flows instead of API keys
- Implement key rotation

### Session Management

**Current:** In-memory sessions (lost on page refresh)

**Future Enhancement:**
- Implement persistent sessions with httpOnly cookies
- Add refresh token mechanism
- Implement "Remember Me" functionality

---

## 📚 Additional Documentation

- **Security Architecture:** `SECURITY.md`
- **API Documentation:** `API_DOCUMENTATION.md`
- **Development Setup:** `SETUP_GUIDE.md`
- **Environment Variables:** `.env.example`

---

## 🆘 Troubleshooting

### Configuration Validation Fails

**Error:** "Invalid configuration. Cannot start application."

**Solution:**
1. Check `.env.production` exists
2. Verify all required variables are set
3. Ensure URLs use HTTPS/WSS in production
4. Check for typos in variable names

### API Connection Fails

**Error:** "Circuit breaker is OPEN"

**Solution:**
1. Check API endpoint is accessible
2. Verify API key is valid
3. Check rate limits
4. Wait for circuit breaker to reset (60 seconds)
5. Review circuit breaker stats

### Authentication Fails

**Error:** "Login failed"

**Solution:**
1. Verify backend is running
2. Check VITE_API_BASE_URL is correct
3. Ensure backend sets httpOnly cookies
4. Verify CORS configuration
5. Check network tab for cookie issues

---

## ✅ Deployment Verification

After deployment, verify:

```bash
# 1. Check app is accessible
curl https://yourdomain.com

# 2. Verify HTTPS is enforced
curl http://yourdomain.com # Should redirect to HTTPS

# 3. Check API endpoints
curl https://api.yourdomain.com/health

# 4. Verify WebSocket connection
wscat -c wss://ws.yourdomain.com

# 5. Test authentication
curl -X POST https://api.yourdomain.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

---

## 📞 Support

For production deployment issues:
1. Check logs for configuration errors
2. Review security audit logs
3. Check circuit breaker status
4. Verify environment variables
5. Contact DevOps team if infrastructure issues

---

**Last Updated:** 2025-11-12
**Version:** 2.0.0
**Status:** Production Ready ✅
