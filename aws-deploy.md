# AWS Free Tier Deployment Guide for CyberConnect

## Overview
Deploy CyberConnect to AWS Free Tier using S3 + CloudFront for static hosting.

---

## Prerequisites

- AWS Account (Free Tier eligible)
- AWS CLI installed and configured
- Node.js 18+ installed locally
- Git repository access

---

## Architecture (Free Tier Optimized)

```
┌─────────────┐
│   Route 53  │  (Optional - $0.50/month for hosted zone)
└──────┬──────┘
       │
┌──────▼──────┐
│ CloudFront  │  (Free: 1TB data transfer out/month)
└──────┬──────┘
       │
┌──────▼──────┐
│  S3 Bucket  │  (Free: 5GB storage, 20k GET, 2k PUT requests/month)
└─────────────┘
```

**Estimated Monthly Cost**: $0-$2 (well within free tier limits)

---

## Step 1: Build Production Bundle

```bash
# Clone and checkout the production branch
git clone https://github.com/cxb3rf1lth/cybersec-hub.git
cd cybersec-hub
git checkout claude/test-unfinished-app-01Muyw5h6iAeiYWWvcnt3Shy

# Install dependencies
npm install

# Build optimized production bundle
npm run build

# Verify build output
ls -lh dist/
```

---

## Step 2: Create S3 Bucket

```bash
# Set variables
BUCKET_NAME="cyberconnect-app-$(date +%s)"  # Unique bucket name
REGION="us-east-1"  # Use us-east-1 for free tier benefits

# Create bucket
aws s3 mb s3://$BUCKET_NAME --region $REGION

# Enable static website hosting
aws s3 website s3://$BUCKET_NAME \
  --index-document index.html \
  --error-document index.html

# Set bucket policy for public read access
cat > bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${BUCKET_NAME}/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --bucket $BUCKET_NAME \
  --policy file://bucket-policy.json

# Disable block public access
aws s3api put-public-access-block \
  --bucket $BUCKET_NAME \
  --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
```

---

## Step 3: Upload Application to S3

```bash
# Upload all files from dist/ to S3
aws s3 sync dist/ s3://$BUCKET_NAME/ \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "index.html" \
  --exclude "*.html"

# Upload HTML files with shorter cache
aws s3 sync dist/ s3://$BUCKET_NAME/ \
  --exclude "*" \
  --include "*.html" \
  --cache-control "public, max-age=0, must-revalidate"

# Set correct content types
aws s3 cp dist/ s3://$BUCKET_NAME/ \
  --recursive \
  --content-type "text/html" \
  --exclude "*" \
  --include "*.html"

aws s3 cp dist/ s3://$BUCKET_NAME/ \
  --recursive \
  --content-type "text/css" \
  --exclude "*" \
  --include "*.css"

aws s3 cp dist/ s3://$BUCKET_NAME/ \
  --recursive \
  --content-type "application/javascript" \
  --exclude "*" \
  --include "*.js"

echo "Application uploaded successfully!"
echo "S3 Website URL: http://${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com"
```

---

## Step 4: Create CloudFront Distribution (Optional but Recommended)

CloudFront provides:
- HTTPS support
- Better performance via CDN
- Custom domain support
- 1TB/month free data transfer

```bash
# Create CloudFront distribution configuration
cat > cloudfront-config.json << EOF
{
  "CallerReference": "cyberconnect-$(date +%s)",
  "Comment": "CyberConnect Application",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-${BUCKET_NAME}",
        "DomainName": "${BUCKET_NAME}.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-${BUCKET_NAME}",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "Compress": true,
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  },
  "Enabled": true,
  "PriceClass": "PriceClass_100"
}
EOF

# Create distribution
DISTRIBUTION_ID=$(aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json \
  --query 'Distribution.Id' \
  --output text)

echo "CloudFront Distribution ID: $DISTRIBUTION_ID"
echo "Waiting for distribution to deploy (this takes 10-15 minutes)..."

# Wait for distribution to be deployed
aws cloudfront wait distribution-deployed \
  --id $DISTRIBUTION_ID

# Get CloudFront domain
CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution \
  --id $DISTRIBUTION_ID \
  --query 'Distribution.DomainName' \
  --output text)

echo "✓ CloudFront Distribution deployed!"
echo "Access your application at: https://$CLOUDFRONT_DOMAIN"
```

---

## Step 5: Configure Custom Domain (Optional)

If you have a domain name:

```bash
# 1. Create Route 53 Hosted Zone (if needed)
aws route53 create-hosted-zone \
  --name yourdomain.com \
  --caller-reference $(date +%s)

# 2. Request SSL Certificate in ACM (must be in us-east-1)
aws acm request-certificate \
  --domain-name yourdomain.com \
  --subject-alternative-names "www.yourdomain.com" \
  --validation-method DNS \
  --region us-east-1

# 3. Validate certificate (follow DNS validation instructions)

# 4. Update CloudFront distribution with custom domain and certificate
# (Use AWS Console for this step - easier than CLI)
```

---

## Deployment Script (Automated)

Save as `deploy-to-aws.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Deploying CyberConnect to AWS..."

# Configuration
BUCKET_NAME="${CYBERCONNECT_BUCKET:-cyberconnect-app-$(date +%s)}"
REGION="${AWS_REGION:-us-east-1}"

echo "📦 Building application..."
npm run build

echo "☁️  Creating S3 bucket: $BUCKET_NAME..."
aws s3 mb s3://$BUCKET_NAME --region $REGION || echo "Bucket may already exist"

echo "🌐 Configuring static website hosting..."
aws s3 website s3://$BUCKET_NAME \
  --index-document index.html \
  --error-document index.html

echo "📤 Uploading files to S3..."
aws s3 sync dist/ s3://$BUCKET_NAME/ \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "index.html"

aws s3 sync dist/ s3://$BUCKET_NAME/ \
  --exclude "*" \
  --include "*.html" \
  --cache-control "public, max-age=0, must-revalidate"

echo "🔓 Setting bucket policy..."
cat > /tmp/policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::${BUCKET_NAME}/*"
  }]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file:///tmp/policy.json

aws s3api put-public-access-block \
  --bucket $BUCKET_NAME \
  --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

echo "✅ Deployment complete!"
echo "🌍 Website URL: http://${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com"
echo ""
echo "💡 Next steps:"
echo "   1. Test the application at the URL above"
echo "   2. (Optional) Set up CloudFront for HTTPS and better performance"
echo "   3. (Optional) Configure custom domain in Route 53"
```

Make it executable:
```bash
chmod +x deploy-to-aws.sh
```

Run it:
```bash
./deploy-to-aws.sh
```

---

## Environment Variables (For Production)

Create `.env.production`:

```env
# API Endpoints (configure your own backend if needed)
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_WS_BASE_URL=wss://api.yourdomain.com

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true

# Environment
VITE_ENV=production
```

---

## Monitoring & Maintenance

### View S3 Access Logs
```bash
aws s3 ls s3://$BUCKET_NAME --recursive --human-readable
```

### Check CloudFront Metrics
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name Requests \
  --dimensions Name=DistributionId,Value=$DISTRIBUTION_ID \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Sum
```

### Update Application
```bash
# Build new version
npm run build

# Sync to S3
aws s3 sync dist/ s3://$BUCKET_NAME/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"
```

---

## Cost Optimization

### Free Tier Limits (Monthly)
- **S3**: 5 GB storage, 20,000 GET requests, 2,000 PUT requests
- **CloudFront**: 1 TB data transfer out, 10,000,000 HTTP requests
- **Route 53**: $0.50/hosted zone (not free)

### Tips to Stay in Free Tier
1. ✅ Enable CloudFront compression
2. ✅ Set proper cache headers
3. ✅ Use CloudFront for static assets
4. ✅ Monitor usage in AWS Billing Dashboard
5. ✅ Set up billing alerts

---

## Troubleshooting

### Application shows blank page
- Check browser console for errors
- Verify all files uploaded to S3
- Check S3 bucket policy is public
- Ensure index.html has correct paths

### 403 Forbidden errors
- Check bucket policy allows public read
- Verify block public access is disabled
- Check IAM permissions

### CloudFront not updating
- Create cache invalidation
- Wait 10-15 minutes for distribution deployment
- Clear browser cache

---

## Security Checklist

✅ Enable HTTPS via CloudFront
✅ Set Content Security Policy headers
✅ Enable S3 access logging
✅ Set up AWS CloudWatch alarms
✅ Use AWS WAF for CloudFront (if needed)
✅ Enable MFA on AWS root account
✅ Use IAM roles with least privilege

---

## Production-Ready Checklist

✅ Build optimized bundle (`npm run build`)
✅ Upload to S3 with proper caching
✅ Configure CloudFront distribution
✅ Enable HTTPS
✅ Set up custom domain (optional)
✅ Configure error pages (404 -> index.html for SPA routing)
✅ Enable compression
✅ Set up monitoring and alerts
✅ Test application thoroughly
✅ Document deployment process

---

## Support

For issues:
1. Check AWS Free Tier usage: https://console.aws.amazon.com/billing/home#/freetier
2. Review CloudWatch logs
3. Check GitHub issues: https://github.com/cxb3rf1lth/cybersec-hub/issues

---

**Deployment Time**: ~15-20 minutes (including CloudFront)
**Monthly Cost**: $0-$2 (within free tier)
**Scalability**: Handles thousands of users on free tier
