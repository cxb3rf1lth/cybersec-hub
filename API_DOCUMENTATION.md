# CyberConnect API Documentation

## Overview

CyberConnect's production API provides comprehensive integration with cybersecurity tools, bug bounty platforms, threat intelligence feeds, and collaboration services. This documentation covers all real API endpoints and integrations.

## Base URLs

- **Production**: `https://api.cyberconnect.io`
- **WebSocket**: `wss://api.cyberconnect.io`
- **Staging**: `https://staging-api.cyberconnect.io`

## Authentication

All API requests require authentication using JWT tokens.

### Get Access Token
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "username": "cybersec_researcher"
  }
}
```

### Using Access Token
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Bug Bounty Integration APIs

### Connect Platform
```http
POST /integrations/bug-bounty/connect
Content-Type: application/json
Authorization: Bearer {token}

{
  "platform": "hackerone",
  "apiKey": "your_api_key",
  "apiSecret": "your_api_secret"
}
```

### Get Programs
```http
GET /integrations/bug-bounty/programs
Authorization: Bearer {token}

Query Parameters:
- platform: hackerone|bugcrowd|intigriti|yeswehack
- status: active|paused|closed
- category: web|mobile|api|infrastructure
```

Response:
```json
{
  "programs": [
    {
      "id": "hp-123",
      "platform": "hackerone",
      "name": "Shopify Bug Bounty",
      "company": "Shopify",
      "bountyRange": "$500 - $25,000",
      "status": "active",
      "scope": ["*.shopify.com", "api.shopify.com"],
      "type": "web",
      "rewards": {
        "critical": "$15,000 - $25,000",
        "high": "$5,000 - $15,000",
        "medium": "$1,000 - $5,000",
        "low": "$500 - $1,000"
      },
      "url": "https://hackerone.com/shopify",
      "description": "Help secure the commerce platform...",
      "targets": ["shopify.com", "partners.shopify.com"],
      "outOfScope": ["*.blog.shopify.com"],
      "disclosed": 1247,
      "verified": 892,
      "lastUpdated": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

### Sync Platform Data
```http
POST /integrations/bug-bounty/{platformId}/sync
Authorization: Bearer {token}
```

## Threat Intelligence APIs

### Get Live Threat Feed
```http
GET /threat-intelligence/feed
Authorization: Bearer {token}

Query Parameters:
- source: cve|exploit-db|security-advisory|threat-intel
- severity: critical|high|medium|low|info
- limit: number (default: 20, max: 100)
- since: ISO date string
```

Response:
```json
{
  "threats": [
    {
      "id": "cve-2024-001",
      "source": "cve",
      "title": "Critical RCE in Apache Struts 2.5.x",
      "severity": "critical",
      "cveId": "CVE-2024-22234",
      "description": "Remote code execution vulnerability...",
      "timestamp": "2024-01-15T08:45:00Z",
      "tags": ["rce", "apache", "struts", "java"],
      "affectedProducts": ["Apache Struts 2.5.0-2.5.31"],
      "exploitation": "in-the-wild",
      "references": [
        "https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2024-22234"
      ]
    }
  ],
  "lastUpdate": "2024-01-15T10:00:00Z"
}
```

### Search Vulnerabilities
```http
GET /threat-intelligence/search
Authorization: Bearer {token}

Query Parameters:
- q: search query
- product: product name
- vendor: vendor name
- cvss_min: minimum CVSS score
- cvss_max: maximum CVSS score
```

## Virtual Lab APIs

### List Cloud Providers
```http
GET /virtual-lab/providers
Authorization: Bearer {token}
```

Response:
```json
{
  "providers": [
    {
      "id": "aws-provider",
      "name": "Amazon Web Services",
      "type": "aws",
      "connected": true,
      "region": "us-east-1",
      "quotas": {
        "maxInstances": 20,
        "currentInstances": 3,
        "maxCPU": 80,
        "currentCPU": 12
      },
      "billing": {
        "dailyLimit": 50,
        "currentUsage": 12.45,
        "currency": "USD"
      }
    }
  ]
}
```

### Create Virtual Machine
```http
POST /virtual-lab/vms
Content-Type: application/json
Authorization: Bearer {token}

{
  "templateId": "kali-linux-latest",
  "providerId": "aws-provider",
  "specs": {
    "cpu": 2,
    "memory": "4GB",
    "storage": "20GB"
  },
  "name": "PenTest Lab 1",
  "expiresIn": 86400
}
```

Response:
```json
{
  "vm": {
    "id": "vm-123abc",
    "name": "PenTest Lab 1",
    "status": "creating",
    "provider": "aws",
    "ipAddress": null,
    "sshPort": null,
    "specs": {
      "cpu": 2,
      "memory": "4GB",
      "storage": "20GB"
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "expiresAt": "2024-01-16T10:30:00Z",
    "cost": {
      "hourly": 0.085,
      "total": 0,
      "currency": "USD"
    }
  }
}
```

### Get VM Status
```http
GET /virtual-lab/vms/{vmId}
Authorization: Bearer {token}
```

### Destroy VM
```http
DELETE /virtual-lab/vms/{vmId}
Authorization: Bearer {token}
```

## Code Collaboration APIs

### Create Project
```http
POST /code/projects
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "SQL Injection Scanner",
  "description": "Advanced SQL injection detection tool",
  "language": "python",
  "category": "tool",
  "visibility": "public",
  "tags": ["sql-injection", "scanner", "automation"]
}
```

### Get Project
```http
GET /code/projects/{projectId}
Authorization: Bearer {token}
```

### Create File
```http
POST /code/projects/{projectId}/files
Content-Type: application/json
Authorization: Bearer {token}

{
  "path": "/src/scanner.py",
  "name": "scanner.py",
  "content": "#!/usr/bin/env python3\n# SQL Injection Scanner\n...",
  "language": "python"
}
```

### Update File (Collaborative Editing)
```http
PUT /code/projects/{projectId}/files/{fileId}
Content-Type: application/json
Authorization: Bearer {token}

{
  "operation": {
    "type": "insert",
    "index": 150,
    "content": "# Added new detection method\n",
    "userId": "user_123"
  }
}
```

### Add Comment
```http
POST /code/projects/{projectId}/files/{fileId}/comments
Content-Type: application/json
Authorization: Bearer {token}

{
  "line": 42,
  "content": "This could be vulnerable to time-based attacks",
  "type": "vulnerability",
  "severity": "medium"
}
```

## Messaging APIs

### Create Chat
```http
POST /messaging/chats
Content-Type: application/json
Authorization: Bearer {token}

{
  "type": "group",
  "name": "Red Team Alpha",
  "participants": ["user_123", "user_456", "user_789"],
  "settings": {
    "encryptionEnabled": true,
    "allowFileSharing": true
  }
}
```

### Send Message
```http
POST /messaging/chats/{chatId}/messages
Content-Type: application/json
Authorization: Bearer {token}

{
  "content": "Found a critical RCE in the target application",
  "type": "text",
  "encrypted": true
}
```

### Upload File
```http
POST /messaging/chats/{chatId}/files
Content-Type: multipart/form-data
Authorization: Bearer {token}

file: [binary data]
```

## Team Hunt APIs

### Create Team Hunt
```http
POST /team-hunts
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "FinTech Security Sprint",
  "platform": "hackerone",
  "targetCompany": "PayFlow Inc",
  "startDate": "2024-01-20T00:00:00Z",
  "endDate": "2024-02-20T23:59:59Z",
  "maxMembers": 5,
  "skillsRequired": ["web-app-testing", "api-security"],
  "bountyPool": "$50,000",
  "description": "Team hunt focusing on payment processing security"
}
```

### Join Hunt
```http
POST /team-hunts/{huntId}/join
Authorization: Bearer {token}
```

### Get Hunt Progress
```http
GET /team-hunts/{huntId}/progress
Authorization: Bearer {token}
```

## Partner Request APIs

### Create Partner Request
```http
POST /partner-requests
Content-Type: application/json
Authorization: Bearer {token}

{
  "toUserId": "user_456",
  "targetProgram": "Shopify Bug Bounty",
  "platform": "hackerone",
  "message": "Looking for a partner for web app testing",
  "skillsOffered": ["web-testing", "api-security"],
  "splitProposal": "50/50"
}
```

### Respond to Request
```http
PUT /partner-requests/{requestId}/respond
Content-Type: application/json
Authorization: Bearer {token}

{
  "response": "accepted"
}
```

## Earnings APIs

### Get Earnings Dashboard
```http
GET /earnings/dashboard
Authorization: Bearer {token}

Query Parameters:
- period: week|month|quarter|year
- teamId: optional team filter
```

Response:
```json
{
  "totalEarnings": 15750.00,
  "currentPeriod": 2350.00,
  "previousPeriod": 1890.00,
  "growth": 24.3,
  "currency": "USD",
  "breakdown": {
    "individual": 8950.00,
    "team": 6800.00
  },
  "recentPayouts": [
    {
      "id": "payout_123",
      "amount": 500.00,
      "platform": "hackerone",
      "program": "Shopify",
      "date": "2024-01-10T00:00:00Z",
      "status": "completed"
    }
  ]
}
```

## WebSocket Events

### Connection
```javascript
const ws = new WebSocket('wss://api.cyberconnect.io/ws?token=your_jwt_token')
```

### Real-time Collaboration
```json
{
  "type": "operation",
  "payload": {
    "projectId": "proj_123",
    "fileId": "file_456",
    "operation": {
      "type": "insert",
      "index": 100,
      "content": "new code",
      "userId": "user_789"
    }
  }
}
```

### Threat Intelligence Updates
```json
{
  "type": "threat_update",
  "payload": {
    "id": "threat_new_123",
    "title": "New critical vulnerability discovered",
    "severity": "critical",
    "source": "cve",
    "timestamp": "2024-01-15T10:45:00Z"
  }
}
```

### Messaging
```json
{
  "type": "message",
  "payload": {
    "chatId": "chat_123",
    "message": {
      "id": "msg_456",
      "senderId": "user_789",
      "content": "New vulnerability found!",
      "timestamp": "2024-01-15T10:46:00Z"
    }
  }
}
```

### Cursor Position (Code Collaboration)
```json
{
  "type": "cursor_position",
  "payload": {
    "projectId": "proj_123",
    "cursor": {
      "userId": "user_789",
      "userName": "Alice",
      "fileId": "file_456",
      "line": 42,
      "column": 15
    }
  }
}
```

## Rate Limits

- **API Requests**: 100 requests per minute per user
- **WebSocket Messages**: 10 messages per second per connection
- **File Uploads**: 50 uploads per hour per user
- **VM Creation**: 10 VMs per day per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642251600
```

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123abc"
  }
}
```

### Common Error Codes
- `UNAUTHORIZED` (401): Invalid or expired token
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid request data
- `RATE_LIMITED` (429): Rate limit exceeded
- `INTEGRATION_ERROR` (502): External API failure
- `QUOTA_EXCEEDED` (402): Usage quota exceeded

## SDK and Client Libraries

### JavaScript/TypeScript
```bash
npm install @cyberconnect/api-client
```

```javascript
import { CyberConnectClient } from '@cyberconnect/api-client'

const client = new CyberConnectClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.cyberconnect.io'
})

// Get bug bounty programs
const programs = await client.bugBounty.getPrograms({
  platform: 'hackerone',
  status: 'active'
})

// Create virtual machine
const vm = await client.virtualLab.createVM({
  templateId: 'kali-linux-latest',
  providerId: 'aws-provider',
  specs: { cpu: 2, memory: '4GB', storage: '20GB' }
})
```

### Python
```bash
pip install cyberconnect-api
```

```python
from cyberconnect import CyberConnectClient

client = CyberConnectClient(
    api_key='your_api_key',
    base_url='https://api.cyberconnect.io'
)

# Get threat intelligence feed
threats = client.threat_intelligence.get_feed(
    severity='critical',
    limit=50
)

# Create code project
project = client.code.create_project(
    name='Vulnerability Scanner',
    language='python',
    category='tool'
)
```

## Webhooks

### Configuration
```http
POST /webhooks
Content-Type: application/json
Authorization: Bearer {token}

{
  "url": "https://your-app.com/webhooks/cyberconnect",
  "events": ["threat.critical", "vm.created", "earning.received"],
  "secret": "your_webhook_secret"
}
```

### Event Format
```json
{
  "id": "evt_123abc",
  "type": "threat.critical",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "threat": {
      "id": "threat_456",
      "title": "Critical RCE discovered",
      "severity": "critical",
      "cveId": "CVE-2024-12345"
    }
  },
  "signature": "sha256=abc123..."
}
```

This comprehensive API documentation covers all real integrations and production functionality available in CyberConnect.