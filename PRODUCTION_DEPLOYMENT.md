# Production Deployment Guide

## Overview

CyberConnect is now fully integrated with real APIs and production-ready services. This guide covers deployment, configuration, and operational requirements for running the platform in a live environment.

## Architecture

### Frontend (React/Vite)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **State Management**: Persistent state with `useKV` hook + local React state
- **Real-time**: WebSocket connections for collaboration and messaging
- **Styling**: Tailwind CSS with custom cyberpunk theme

### Backend Services Required

#### 1. API Gateway & Authentication
- **Endpoint**: `https://api.cyberconnect.io`
- **Authentication**: JWT tokens with refresh mechanism
- **Rate Limiting**: Per-user and per-IP limits
- **CORS**: Configured for production domain

#### 2. WebSocket Server
- **Endpoint**: `wss://api.cyberconnect.io`
- **Protocols**: Real-time messaging, code collaboration, presence
- **Scaling**: Redis for pub/sub across multiple instances
- **Authentication**: JWT validation on connection

#### 3. Database
- **Primary**: MongoDB or PostgreSQL
- **Caching**: Redis for sessions and real-time data
- **File Storage**: AWS S3, Google Cloud Storage, or similar
- **Search**: Elasticsearch for vulnerability and project search

#### 4. Container Orchestration
- **Platform**: Kubernetes or Docker Swarm
- **VM Providers**: AWS, DigitalOcean, GCP integration
- **Container Registry**: Private registry for custom security tool images
- **Networking**: VPN/VPC setup for isolated lab environments

## Required API Keys & Integrations

### Bug Bounty Platforms
```bash
# HackerOne
HACKERONE_API_KEY=your_hackerone_api_key
HACKERONE_API_SECRET=your_hackerone_secret

# Bugcrowd
BUGCROWD_API_KEY=your_bugcrowd_api_key

# Intigriti
INTIGRITI_API_KEY=your_intigriti_api_key

# YesWeHack
YESWEHACK_API_KEY=your_yeswehack_api_key
```

### Threat Intelligence
```bash
# Shodan (for IoT/network reconnaissance)
SHODAN_API_KEY=your_shodan_api_key

# CVE/NVD (public APIs - no key required)
# ExploitDB (public API - no key required)

# ProjectDiscovery (for Nuclei templates)
PROJECTDISCOVERY_API_KEY=your_pd_api_key
```

### Cloud Providers
```bash
# AWS (for EC2 instances)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1

# DigitalOcean (for droplets)
DIGITALOCEAN_API_TOKEN=your_do_token

# Google Cloud Platform
GCP_PROJECT_ID=your_gcp_project
GCP_CREDENTIALS_JSON=path_to_service_account.json

# Azure
AZURE_SUBSCRIPTION_ID=your_azure_subscription
AZURE_CLIENT_ID=your_azure_client_id
AZURE_CLIENT_SECRET=your_azure_secret
```

### Developer Tools
```bash
# GitHub (for code sharing/integration)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_secret

# Slack (for notifications)
SLACK_WEBHOOK_URL=your_slack_webhook

# Discord (for community integration)
DISCORD_BOT_TOKEN=your_discord_bot_token
```

## Environment Configuration

### Frontend (.env.production)
```bash
VITE_API_BASE_URL=https://api.cyberconnect.io
VITE_WS_BASE_URL=wss://api.cyberconnect.io
VITE_APP_ENV=production
VITE_VAPID_PUBLIC_KEY=your_push_notification_key
VITE_GITHUB_CLIENT_ID=your_github_client_id
```

### Backend Environment Variables
```bash
# Database
DATABASE_URL=mongodb://username:password@cluster.mongodb.net/cyberconnect
REDIS_URL=redis://username:password@redis-server:6379

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_256_bits_minimum
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# File Upload
AWS_S3_BUCKET=cyberconnect-files
AWS_S3_REGION=us-east-1
MAX_FILE_SIZE=104857600  # 100MB

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=100
RATE_LIMIT_WEBSOCKET_PER_SECOND=10

# Security
ENCRYPTION_KEY=your_32_byte_encryption_key_for_messages
CORS_ORIGIN=https://cyberconnect.io

# Monitoring
SENTRY_DSN=your_sentry_dsn_for_error_tracking
NEW_RELIC_LICENSE_KEY=your_newrelic_key

# Email Service
SENDGRID_API_KEY=your_sendgrid_key
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
```

## Deployment Steps

### 1. Frontend Deployment

#### Build for Production
```bash
npm run build
```

#### Deploy to CDN (Recommended)
```bash
# Upload to AWS S3 + CloudFront
aws s3 sync dist/ s3://cyberconnect-frontend --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"

# Or deploy to Vercel/Netlify
vercel --prod
# or
netlify deploy --prod --dir=dist
```

### 2. Backend Deployment

#### Container Deployment (Docker)
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000 3001
CMD ["npm", "start"]
```

```bash
# Build and deploy
docker build -t cyberconnect-api .
docker run -p 3000:3000 -p 3001:3001 --env-file .env.production cyberconnect-api
```

#### Kubernetes Deployment
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cyberconnect-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: cyberconnect-api
  template:
    metadata:
      labels:
        app: cyberconnect-api
    spec:
      containers:
      - name: api
        image: cyberconnect/api:latest
        ports:
        - containerPort: 3000
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: cyberconnect-secrets
              key: database-url
---
apiVersion: v1
kind: Service
metadata:
  name: cyberconnect-api-service
spec:
  selector:
    app: cyberconnect-api
  ports:
  - name: http
    port: 80
    targetPort: 3000
  - name: websocket
    port: 3001
    targetPort: 3001
  type: LoadBalancer
```

### 3. Database Setup

#### MongoDB Collections
```javascript
// Initialize MongoDB collections with indexes
db.createCollection("users")
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "username": 1 }, { unique: true })

db.createCollection("code_projects")
db.code_projects.createIndex({ "createdBy": 1, "visibility": 1 })
db.code_projects.createIndex({ "category": 1, "tags": 1 })

db.createCollection("messages")
db.messages.createIndex({ "chatId": 1, "timestamp": 1 })

db.createCollection("virtual_machines")
db.virtual_machines.createIndex({ "createdBy": 1, "status": 1 })

db.createCollection("bug_bounty_programs")
db.bug_bounty_programs.createIndex({ "platform": 1, "status": 1 })

db.createCollection("threat_feeds")
db.threat_feeds.createIndex({ "source": 1, "severity": 1, "timestamp": -1 })
```

### 4. Security Configuration

#### SSL/TLS Setup
```bash
# Get SSL certificate (Let's Encrypt)
certbot --nginx -d api.cyberconnect.io -d cyberconnect.io

# Or use AWS ACM, Cloudflare, etc.
```

#### Firewall Rules
```bash
# Allow only necessary ports
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw allow 3001  # WebSocket
ufw enable
```

#### Security Headers (Nginx)
```nginx
server {
    listen 443 ssl;
    server_name cyberconnect.io;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' wss://api.cyberconnect.io https://api.cyberconnect.io";
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Monitoring & Observability

### Health Checks
```javascript
// API health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: checkDatabaseConnection(),
      redis: checkRedisConnection(),
      websocket: checkWebSocketServer(),
      external_apis: checkExternalAPIs()
    }
  }
  res.json(health)
})
```

### Logging
```javascript
// Structured logging with Winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
})
```

### Metrics & Alerts
```yaml
# Prometheus configuration
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'cyberconnect-api'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'

  - job_name: 'cyberconnect-websocket'
    static_configs:
      - targets: ['localhost:3001']

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

## Performance Optimization

### CDN Configuration
- Static assets served via CloudFront/CloudFlare
- Gzip compression enabled
- Browser caching headers set appropriately
- Image optimization and WebP conversion

### Database Optimization
- Connection pooling
- Query optimization with proper indexes
- Read replicas for read-heavy operations
- Caching frequently accessed data in Redis

### Application Optimization
- Code splitting and lazy loading
- Bundle size optimization
- WebSocket connection pooling
- Rate limiting and request throttling

## Security Considerations

### Data Protection
- All API keys stored encrypted in database
- Personal data encrypted at rest
- Secure communication over HTTPS/WSS only
- Regular security audits and penetration testing

### Access Control
- Role-based permissions (Owner, Admin, Member, Read-only)
- API key rotation mechanism
- Session management with secure tokens
- Multi-factor authentication support

### Compliance
- GDPR compliance for EU users
- SOC 2 compliance for enterprise clients
- Regular vulnerability assessments
- Incident response procedures

## Scaling Strategy

### Horizontal Scaling
- Load balancers for API servers
- Database sharding for large datasets
- Redis clustering for session management
- CDN for global content delivery

### Vertical Scaling
- Auto-scaling groups based on CPU/memory usage
- Database connection pooling
- Caching strategies for expensive operations
- Background job processing with queues

## Backup & Recovery

### Database Backups
```bash
# MongoDB backup
mongodump --uri="mongodb://cluster.mongodb.net/cyberconnect" --out=/backups/$(date +%Y%m%d)

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR
mongodump --uri="$DATABASE_URL" --out="$BACKUP_DIR"
aws s3 cp $BACKUP_DIR s3://cyberconnect-backups/ --recursive
```

### File Storage Backups
```bash
# S3 cross-region replication
aws s3api put-bucket-replication --bucket cyberconnect-files --replication-configuration file://replication.json
```

### Disaster Recovery
- RTO (Recovery Time Objective): 4 hours
- RPO (Recovery Point Objective): 1 hour
- Multi-region deployment capability
- Database point-in-time recovery
- Infrastructure as Code for rapid rebuilding

## Cost Optimization

### Cloud Resources
- Reserved instances for predictable workloads
- Spot instances for development environments
- Auto-scaling to handle traffic spikes
- Resource monitoring and right-sizing

### API Usage
- Caching to reduce external API calls
- Rate limiting to prevent quota exhaustion
- Bulk operations where possible
- Monitoring and alerting on usage costs

## Launch Checklist

### Pre-Production
- [ ] All environment variables configured
- [ ] SSL certificates installed
- [ ] Database migrations completed
- [ ] API integrations tested
- [ ] Load testing completed
- [ ] Security scan performed
- [ ] Backup procedures tested
- [ ] Monitoring and alerting configured

### Production Launch
- [ ] DNS records updated
- [ ] CDN configured
- [ ] Load balancers configured
- [ ] Health checks passing
- [ ] Logs flowing correctly
- [ ] Metrics being collected
- [ ] Error tracking operational
- [ ] Team notifications configured

### Post-Launch
- [ ] Monitor system performance
- [ ] Verify all integrations working
- [ ] Check error rates and response times
- [ ] Validate user registration flow
- [ ] Test critical user journeys
- [ ] Monitor external API usage
- [ ] Review security alerts
- [ ] Document any issues for future reference

## Support & Maintenance

### Regular Maintenance
- Weekly security updates
- Monthly dependency updates
- Quarterly penetration testing
- Annual security audits

### Support Channels
- In-app support chat
- Email support with SLA
- Community forums
- Documentation and knowledge base

This production deployment guide ensures CyberConnect runs reliably and securely in a live environment with all real integrations functional.