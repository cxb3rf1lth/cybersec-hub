/**
 * Production Backend Configuration
 * Environment variables and API endpoints for production deployment
 */

// Environment Configuration
export const ENV = {
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.cyberconnect.io',
  WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL || 'wss://api.cyberconnect.io',
  
  // Third-party API endpoints
  HACKERONE_API: 'https://api.hackerone.com/v1',
  BUGCROWD_API: 'https://api.bugcrowd.com/v2',
  INTIGRITI_API: 'https://api.intigriti.com/external',
  YESWEHACK_API: 'https://api.yeswehack.com/programs',
  SHODAN_API: 'https://api.shodan.io',
  PROJECTDISCOVERY_API: 'https://api.projectdiscovery.io/v1',
  CVE_API: 'https://services.nvd.nist.gov/rest/json/cves/2.0',
  EXPLOITDB_API: 'https://www.exploit-db.com/api/v1',
  
  // Cloud Provider APIs
  AWS_API: 'https://ec2.amazonaws.com',
  GCP_API: 'https://compute.googleapis.com/compute/v1',
  AZURE_API: 'https://management.azure.com',
  DIGITALOCEAN_API: 'https://api.digitalocean.com/v2',
  VULTR_API: 'https://api.vultr.com/v2',
  
  // File upload limits
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_FILE_TYPES: [
    'text/plain',
    'text/markdown',
    'application/json',
    'application/javascript',
    'text/javascript',
    'application/typescript',
    'text/x-python',
    'text/x-go',
    'text/x-rust',
    'text/x-c',
    'text/x-cpp',
    'text/x-shell',
    'application/x-powershell',
    'application/sql',
    'text/html',
    'text/css',
    'application/xml',
    'text/yaml',
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'application/pdf'
  ],
  
  // Rate limiting
  RATE_LIMITS: {
    API_REQUESTS_PER_MINUTE: 100,
    WEBSOCKET_MESSAGES_PER_SECOND: 10,
    FILE_UPLOADS_PER_HOUR: 50,
    VULNERABILITY_SCANS_PER_DAY: 20
  },
  
  // Feature flags
  FEATURES: {
    REAL_TIME_COLLABORATION: true,
    CLOUD_VM_PROVISIONING: true,
    THREAT_INTELLIGENCE_FEEDS: true,
    ENCRYPTED_MESSAGING: true,
    GITHUB_INTEGRATION: true,
    DOCKER_CONTAINERS: true,
    VULNERABILITY_SCANNING: true,
    TEAM_EARNINGS_TRACKING: true,
    MARKETPLACE: true,
    LIVE_STREAMING: false, // Beta feature
    AI_VULNERABILITY_ANALYSIS: false // Beta feature
  }
}

// API Request Configuration
export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000, // 1 second base delay with exponential backoff
  
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'CyberConnect/1.0'
  }
}

// WebSocket Configuration
export const WS_CONFIG = {
  reconnectInterval: 5000, // 5 seconds
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000, // 30 seconds
  messageQueueSize: 1000,
  
  channels: {
    MESSAGING: 'messaging',
    CODE_COLLABORATION: 'code-collab',
    THREAT_INTELLIGENCE: 'threat-intel',
    TEAM_HUNTS: 'team-hunts',
    VM_STATUS: 'vm-status',
    USER_PRESENCE: 'user-presence'
  }
}

// Security Configuration
export const SECURITY_CONFIG = {
  // Content Security Policy
  CSP: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", 'https://api.cyberconnect.io'],
    'connect-src': ["'self'", 'wss://api.cyberconnect.io', 'https://api.cyberconnect.io', 'https://api.github.com'],
    'img-src': ["'self'", 'data:', 'https:'],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com']
  },
  
  // API Key validation patterns
  API_KEY_PATTERNS: {
    hackerone: /^[a-f0-9-]{36}$/,
    bugcrowd: /^[A-Za-z0-9]{40}$/,
    intigriti: /^[A-Za-z0-9_-]{32,}$/,
    shodan: /^[A-Za-z0-9]{32}$/,
    github: /^gh[a-z]_[A-Za-z0-9]{36}$/,
    aws: /^AKIA[A-Z0-9]{16}$/,
    digitalocean: /^[A-Za-z0-9]{64}$/
  },
  
  // Encryption settings
  ENCRYPTION: {
    algorithm: 'AES-GCM',
    keyLength: 256,
    ivLength: 12,
    tagLength: 16
  }
}

// Database Configuration (for backend)
export const DB_CONFIG = {
  // Collections/Tables
  COLLECTIONS: {
    USERS: 'users',
    PROJECTS: 'code_projects', 
    MESSAGES: 'messages',
    CHATS: 'chats',
    VIRTUAL_MACHINES: 'virtual_machines',
    BUG_BOUNTY_PROGRAMS: 'bug_bounty_programs',
    THREAT_FEEDS: 'threat_feeds',
    TEAM_HUNTS: 'team_hunts',
    EARNINGS: 'earnings',
    INVITATIONS: 'invitations',
    API_KEYS: 'api_keys_encrypted',
    AUDIT_LOGS: 'audit_logs'
  },
  
  // Indexes for performance
  INDEXES: [
    { collection: 'users', fields: ['email', 'username'], unique: true },
    { collection: 'code_projects', fields: ['createdBy', 'visibility', 'category'] },
    { collection: 'messages', fields: ['chatId', 'timestamp'] },
    { collection: 'chats', fields: ['participants.userId', 'type'] },
    { collection: 'virtual_machines', fields: ['createdBy', 'status', 'provider'] },
    { collection: 'bug_bounty_programs', fields: ['platform', 'status', 'lastUpdated'] },
    { collection: 'threat_feeds', fields: ['source', 'severity', 'timestamp'] },
    { collection: 'team_hunts', fields: ['status', 'platform', 'startDate'] },
    { collection: 'earnings', fields: ['userId', 'teamId', 'date'] },
    { collection: 'audit_logs', fields: ['userId', 'action', 'timestamp'] }
  ]
}

// Monitoring and Analytics
export const MONITORING_CONFIG = {
  // Error tracking
  ERROR_TRACKING: {
    enabled: ENV.NODE_ENV === 'production',
    sampleRate: 0.1, // 10% of errors
    beforeSend: (error: Error) => {
      // Filter out sensitive information
      const sensitivePatterns = [
        /api[_-]?key/i,
        /password/i,
        /token/i,
        /secret/i,
        /credential/i
      ]
      
      let message = error.message
      sensitivePatterns.forEach(pattern => {
        message = message.replace(pattern, '[REDACTED]')
      })
      
      return { ...error, message }
    }
  },
  
  // Performance monitoring
  PERFORMANCE: {
    enabled: ENV.NODE_ENV === 'production',
    sampleRate: 0.1, // 10% of transactions
    tracingOrigins: ['api.cyberconnect.io', /^\//],
    routingInstrumentation: true
  },
  
  // Usage analytics
  ANALYTICS: {
    enabled: ENV.NODE_ENV === 'production',
    events: [
      'project_created',
      'vm_launched',
      'message_sent',
      'vulnerability_found',
      'team_hunt_joined',
      'integration_connected',
      'file_shared',
      'code_collaborated'
    ]
  }
}

// Notification Configuration
export const NOTIFICATION_CONFIG = {
  // Push notifications
  PUSH: {
    vapidPublicKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
    enabled: 'Notification' in window && 'serviceWorker' in navigator
  },
  
  // Email notifications
  EMAIL: {
    types: [
      'security_alert',
      'team_invitation',
      'vulnerability_found',
      'hunt_started',
      'earnings_received',
      'system_maintenance'
    ]
  },
  
  // In-app notifications
  IN_APP: {
    maxVisible: 5,
    autoHideDelay: 5000, // 5 seconds
    persistence: true // Store in localStorage
  }
}

// Development/Testing Configuration
export const DEV_CONFIG = {
  // Mock data
  USE_MOCK_DATA: ENV.NODE_ENV === 'development',
  MOCK_DELAY: 1000, // 1 second delay for API calls
  
  // Debug features
  DEBUG: {
    API_CALLS: ENV.NODE_ENV === 'development',
    WEBSOCKET_MESSAGES: ENV.NODE_ENV === 'development',
    STATE_CHANGES: ENV.NODE_ENV === 'development',
    PERFORMANCE: ENV.NODE_ENV === 'development'
  },
  
  // Test accounts
  TEST_ACCOUNTS: {
    admin: { email: 'admin@cyberconnect.dev', password: 'dev123!' },
    researcher: { email: 'researcher@cyberconnect.dev', password: 'dev123!' },
    teamlead: { email: 'teamlead@cyberconnect.dev', password: 'dev123!' }
  }
}

// Validation helpers
export function validateEnvironment(): string[] {
  const errors: string[] = []
  
  if (!ENV.API_BASE_URL) {
    errors.push('VITE_API_BASE_URL is required')
  }
  
  if (!ENV.WS_BASE_URL) {
    errors.push('VITE_WS_BASE_URL is required')
  }
  
  if (ENV.NODE_ENV === 'production' && !NOTIFICATION_CONFIG.PUSH.vapidPublicKey) {
    errors.push('VITE_VAPID_PUBLIC_KEY is required for production')
  }
  
  return errors
}

// Initialize configuration
export function initializeConfiguration(): void {
  const errors = validateEnvironment()
  
  if (errors.length > 0) {
    console.error('Configuration errors:', errors)
    if (ENV.NODE_ENV === 'production') {
      throw new Error(`Configuration validation failed: ${errors.join(', ')}`)
    }
  }
  
  // Set up global error handling
  if (ENV.NODE_ENV === 'production') {
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error)
      // Send to monitoring service
    })
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      // Send to monitoring service
    })
  }
  
  // Initialize performance monitoring
  if (MONITORING_CONFIG.PERFORMANCE.enabled) {
    // Initialize performance monitoring service
    console.log('Performance monitoring initialized')
  }
  
  // Set up CSP if supported
  if (ENV.NODE_ENV === 'production' && 'securitypolicyviolation' in window) {
    window.addEventListener('securitypolicyviolation', (event) => {
      console.warn('CSP violation:', event.violatedDirective, event.blockedURI)
    })
  }
}

// Export configuration object
export const CONFIG = {
  ENV,
  API_CONFIG,
  WS_CONFIG,
  SECURITY_CONFIG,
  DB_CONFIG,
  MONITORING_CONFIG,
  NOTIFICATION_CONFIG,
  DEV_CONFIG
}

export default CONFIG