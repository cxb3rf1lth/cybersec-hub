#!/bin/bash

# CyberConnect AWS Deployment Script
# Deploys to S3 + CloudFront (AWS Free Tier compatible)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}   CyberConnect AWS Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Configuration
BUCKET_NAME="${CYBERCONNECT_BUCKET:-cyberconnect-app-$(date +%s)}"
REGION="${AWS_REGION:-us-east-1}"
CREATE_CLOUDFRONT="${CREATE_CLOUDFRONT:-false}"

echo -e "${YELLOW}Configuration:${NC}"
echo "  Bucket Name: $BUCKET_NAME"
echo "  Region: $REGION"
echo "  CloudFront: $CREATE_CLOUDFRONT"
echo ""

# Check prerequisites
echo -e "${YELLOW}[1/6]${NC} Checking prerequisites..."

if ! command -v aws &> /dev/null; then
    echo -e "${RED}✗ AWS CLI not installed${NC}"
    echo "Install from: https://aws.amazon.com/cli/"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not installed${NC}"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo -e "${RED}✗ Must run from project root directory${NC}"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}✗ AWS credentials not configured${NC}"
    echo "Run: aws configure"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites check passed${NC}"
echo ""

# Build application
echo -e "${YELLOW}[2/6]${NC} Building production bundle..."
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}✗ Build failed - dist/ directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build completed${NC}"
echo ""

# Create S3 bucket
echo -e "${YELLOW}[3/6]${NC} Creating S3 bucket..."

if aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
    aws s3 mb s3://$BUCKET_NAME --region $REGION
    echo -e "${GREEN}✓ Bucket created${NC}"
else
    echo -e "${YELLOW}⚠ Bucket already exists, using existing bucket${NC}"
fi

# Configure static website hosting
echo -e "${YELLOW}[4/6]${NC} Configuring static website hosting..."

aws s3 website s3://$BUCKET_NAME \
  --index-document index.html \
  --error-document index.html

# Set bucket policy
cat > /tmp/bucket-policy.json << EOF
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
  --policy file:///tmp/bucket-policy.json

# Disable block public access
aws s3api put-public-access-block \
  --bucket $BUCKET_NAME \
  --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

echo -e "${GREEN}✓ Website hosting configured${NC}"
echo ""

# Upload files
echo -e "${YELLOW}[5/6]${NC} Uploading files to S3..."

# Upload static assets with long cache
aws s3 sync dist/ s3://$BUCKET_NAME/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html" \
  --exclude "*.json"

# Upload HTML files with no cache
aws s3 sync dist/ s3://$BUCKET_NAME/ \
  --cache-control "public, max-age=0, must-revalidate" \
  --exclude "*" \
  --include "*.html"

# Upload JSON files
aws s3 sync dist/ s3://$BUCKET_NAME/ \
  --cache-control "public, max-age=300" \
  --exclude "*" \
  --include "*.json"

echo -e "${GREEN}✓ Files uploaded${NC}"
echo ""

# Get website URL
WEBSITE_URL="http://${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com"

# Create CloudFront distribution (optional)
if [ "$CREATE_CLOUDFRONT" = "true" ]; then
    echo -e "${YELLOW}[6/6]${NC} Creating CloudFront distribution..."
    echo "This will take 10-15 minutes..."

    # Create distribution
    DISTRIBUTION_ID=$(aws cloudfront create-distribution \
      --origin-domain-name "${BUCKET_NAME}.s3.amazonaws.com" \
      --default-root-object index.html \
      --query 'Distribution.Id' \
      --output text)

    echo "Distribution ID: $DISTRIBUTION_ID"
    echo "Waiting for deployment..."

    aws cloudfront wait distribution-deployed --id $DISTRIBUTION_ID

    CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution \
      --id $DISTRIBUTION_ID \
      --query 'Distribution.DomainName' \
      --output text)

    echo -e "${GREEN}✓ CloudFront distribution created${NC}"
    echo ""
else
    echo -e "${YELLOW}[6/6]${NC} Skipping CloudFront (set CREATE_CLOUDFRONT=true to enable)"
    echo ""
fi

# Deployment complete
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}   Deployment Successful! 🎉${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Application URLs:${NC}"
echo "  S3 Website: $WEBSITE_URL"

if [ "$CREATE_CLOUDFRONT" = "true" ]; then
    echo "  CloudFront: https://$CLOUDFRONT_DOMAIN"
fi

echo ""
echo -e "${YELLOW}Deployment Information:${NC}"
echo "  Bucket: s3://$BUCKET_NAME"
echo "  Region: $REGION"
echo "  Files: $(aws s3 ls s3://$BUCKET_NAME --recursive | wc -l)"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Test your application at the URL above"
echo "  2. Configure API keys in Settings"
echo "  3. (Optional) Set up custom domain"
echo "  4. (Optional) Enable CloudFront for HTTPS"
echo ""
echo -e "${YELLOW}Update Command:${NC}"
echo "  npm run build && aws s3 sync dist/ s3://$BUCKET_NAME/ --delete"
echo ""
echo -e "${YELLOW}Delete Command:${NC}"
echo "  aws s3 rb s3://$BUCKET_NAME --force"
echo ""

# Save deployment info
cat > deployment-info.txt << EOF
Deployment Date: $(date)
Bucket Name: $BUCKET_NAME
Region: $REGION
Website URL: $WEBSITE_URL
EOF

if [ "$CREATE_CLOUDFRONT" = "true" ]; then
    echo "CloudFront ID: $DISTRIBUTION_ID" >> deployment-info.txt
    echo "CloudFront URL: https://$CLOUDFRONT_DOMAIN" >> deployment-info.txt
fi

echo -e "${GREEN}Deployment info saved to: deployment-info.txt${NC}"
