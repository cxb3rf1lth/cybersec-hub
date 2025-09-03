# CyberConnect Production API Configuration

## Overview

CyberConnect integrates with multiple cybersecurity platforms and services to provide real-time threat intelligence, bug bounty data, and security tools. This document explains how to configure API keys for production deployment.

## Supported Integrations

### Bug Bounty Platforms

#### HackerOne
- **API Documentation**: https://api.hackerone.com/customer-resources/
- **Required Scopes**: `program:read`, `report:read`
- **Authentication**: Bearer token
- **Rate Limits**: 500 requests/hour (free), 5000/hour (professional)
- **Features**: Program sync, report submission, payout tracking

#### Bugcrowd
- **API Documentation**: https://docs.bugcrowd.com/api/
- **Required Scopes**: `user:read`, `program:read`
- **Authentication**: Bearer token
- **Rate Limits**: 1000 requests/hour
- **Features**: Program sync, submission tracking, earnings data

#### Intigriti
- **API Documentation**: https://docs.intigriti.com/
- **Required Scopes**: `external:researcher`
- **Authentication**: Bearer token
- **Rate Limits**: 500 requests/hour
- **Features**: Program access, submission management

#### YesWeHack
- **API Documentation**: https://docs.yeswehack.com/
- **Required Scopes**: `user:read`
- **Authentication**: Bearer token
- **Rate Limits**: 300 requests/hour
- **Features**: Program listing, report submission

### Threat Intelligence & Security Tools

#### Shodan
- **API Documentation**: https://developer.shodan.io/
- **Required Scopes**: `search`
- **Authentication**: API key
- **Rate Limits**: 100 results/month (free), 10000/month (paid)
- **Features**: Internet-wide device scanning, vulnerability discovery

#### VirusTotal
- **API Documentation**: https://developers.virustotal.com/
- **Required Scopes**: `public_api`
- **Authentication**: API key
- **Rate Limits**: 4 requests/minute (free), 1000/minute (paid)
- **Features**: File/URL analysis, malware detection

#### National Vulnerability Database (NVD)
- **API Documentation**: https://nvd.nist.gov/developers
- **Required Scopes**: `public`
- **Authentication**: API key (optional, increases rate limits)
- **Rate Limits**: 5 requests/30 seconds (no key), 50/30 seconds (with key)
- **Features**: CVE details, vulnerability data

#### CVE Search (CIRCL)
- **API Documentation**: https://cve.circl.lu/api/
- **Required Scopes**: None (public API)
- **Authentication**: None
- **Rate Limits**: Fair usage policy
- **Features**: CVE search, vulnerability timeline

### Project Discovery Tools

#### Nuclei Templates
- **API Documentation**: https://docs.projectdiscovery.io/
- **Required Scopes**: `public_repo`
- **Authentication**: GitHub token
- **Rate Limits**: 5000 requests/hour
- **Features**: Template repository access, update notifications

#### Chaos (Project Discovery)
- **API Documentation**: https://chaos.projectdiscovery.io/
- **Required Scopes**: `dns:read`
- **Authentication**: Bearer token
- **Rate Limits**: Varies by plan
- **Features**: Subdomain enumeration, DNS data

### Security Feeds

#### GitHub Security Advisories
- **API Documentation**: https://docs.github.com/en/rest/security-advisories
- **Required Scopes**: `security_events`
- **Authentication**: GitHub token
- **Rate Limits**: 5000 requests/hour
- **Features**: Security advisory feeds, vulnerability notifications

#### Exploit Database
- **API Documentation**: https://www.exploit-db.com/api
- **Required Scopes**: None (public API)
- **Authentication**: None
- **Rate Limits**: Fair usage policy
- **Features**: Exploit search, recent exploit feeds

## Setting Up API Keys

### 1. Through the Application

1. Open CyberConnect and log in
2. Go to Profile Settings (click your avatar)
3. Navigate to the "Integrations" tab
4. Click "Manage API Keys"
5. Select the service you want to configure
6. Enter your API key and save

### 2. Environment Variables (Docker/Production)

For production deployments, you can also set API keys via environment variables:

```bash
# Bug Bounty Platforms
CYBERCONNECT_HACKERONE_API_KEY=your_hackerone_key
CYBERCONNECT_BUGCROWD_API_KEY=your_bugcrowd_key
CYBERCONNECT_INTIGRITI_API_KEY=your_intigriti_key
CYBERCONNECT_YESWEHACK_API_KEY=your_yeswehack_key

# Threat Intelligence
CYBERCONNECT_SHODAN_API_KEY=your_shodan_key
CYBERCONNECT_VIRUSTOTAL_API_KEY=your_virustotal_key
CYBERCONNECT_NVD_API_KEY=your_nvd_key

# Project Discovery
CYBERCONNECT_CHAOS_API_KEY=your_chaos_key
CYBERCONNECT_GITHUB_TOKEN=your_github_token
```

### 3. Obtaining API Keys

#### HackerOne
1. Go to https://hackerone.com/settings/api_token
2. Generate a new API token
3. Copy the token and paste it in CyberConnect

#### Bugcrowd
1. Go to https://bugcrowd.com/user/api
2. Create a new API key
3. Copy the key and configure in CyberConnect

#### Shodan
1. Register at https://shodan.io/
2. Go to https://account.shodan.io/
3. Copy your API key
4. Configure in CyberConnect

#### VirusTotal
1. Register at https://virustotal.com/
2. Go to https://www.virustotal.com/gui/my-apikey
3. Copy your API key
4. Configure in CyberConnect

#### GitHub (for Security Advisories and Nuclei)
1. Go to https://github.com/settings/tokens
2. Generate a new personal access token
3. Select appropriate scopes: `public_repo`, `security_events`
4. Copy the token and configure in CyberConnect

## Security Considerations

### API Key Storage
- All API keys are encrypted and stored securely
- Keys are never logged or transmitted in plain text
- Keys can be revoked and updated at any time

### Rate Limiting
- CyberConnect respects all API rate limits
- Requests are automatically throttled to prevent limit violations
- Rate limit status is displayed in the API key management interface

### Permissions
- Only use API keys with minimal required permissions
- Regularly rotate API keys for enhanced security
- Monitor API key usage through provider dashboards

## Troubleshooting

### Common Issues

1. **Invalid API Key**
   - Verify the key is correct and active
   - Check if the API key has required scopes
   - Ensure the service is not experiencing downtime

2. **Rate Limit Exceeded**
   - Wait for the rate limit window to reset
   - Consider upgrading to a higher-tier plan
   - Reduce the frequency of requests

3. **Service Unavailable**
   - Check the service status page
   - Verify network connectivity
   - Try again after a few minutes

### Support

For additional help:
- Check service-specific documentation
- Contact the respective API provider support
- Create an issue in the CyberConnect repository

## Production Deployment Checklist

- [ ] All required API keys configured
- [ ] API key validation successful
- [ ] Rate limits configured appropriately
- [ ] Environment variables set (if using Docker)
- [ ] Network access verified to all services
- [ ] Monitoring and alerting configured
- [ ] Backup/fallback mechanisms tested