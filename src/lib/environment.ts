/**
 * Production Environment Configuration
 * Environment variables and runtime configuration for production deployment
 */

// Environment detection
export const NODE_ENV = process.env.NODE_ENV || 'development'
export const IS_PRODUCTION = NODE_ENV === 'production'
export const IS_DEVELOPMENT = NODE_ENV === 'development'

// API Configuration
export const API_ENDPOINTS = {
  production: {
    API_BASE_URL: 'https://api.cyberconnect.io',
    WS_BASE_URL: 'wss://ws.cyberconnect.io',
    CDN_BASE_URL: 'https://cdn.cyberconnect.io',
    AUTH_URL: 'https://auth.cyberconnect.io'
  },
  staging: {
    API_BASE_URL: 'https://api-staging.cyberconnect.io',
    WS_BASE_URL: 'wss://ws-staging.cyberconnect.io',
    CDN_BASE_URL: 'https://cdn-staging.cyberconnect.io',
    AUTH_URL: 'https://auth-staging.cyberconnect.io'
  },
  development: {
    API_BASE_URL: 'http://localhost:3001',
    WS_BASE_URL: 'ws://localhost:3002',
    CDN_BASE_URL: 'http://localhost:3003',
    AUTH_URL: 'http://localhost:3004'
  }
}

// Current environment endpoints
const currentEnv = IS_PRODUCTION ? 'production' : IS_DEVELOPMENT ? 'development' : 'staging'
export const ENDPOINTS = API_ENDPOINTS[currentEnv]

// Feature Flags
export const FEATURE_FLAGS = {
  // Core Features
  REAL_TIME_MESSAGING: true,
  CODE_COLLABORATION: true,
  VIRTUAL_LABS: true,
  BUG_BOUNTY_INTEGRATION: true,
  THREAT_INTELLIGENCE: true,
  
  // Advanced Features
  AI_ASSISTANCE: IS_PRODUCTION,
  VIDEO_CALLS: false, // Coming soon
  SCREEN_SHARING: false, // Coming soon
  VOICE_CHAT: false, // Coming soon
  
  // Security Features
  END_TO_END_ENCRYPTION: true,
  TWO_FACTOR_AUTH: IS_PRODUCTION,
  SESSION_RECORDING: IS_PRODUCTION,
  
  // Integration Features
  GITHUB_INTEGRATION: true,
  SLACK_INTEGRATION: IS_PRODUCTION,
  DISCORD_INTEGRATION: true,
  
  // Analytics
  TELEMETRY: IS_PRODUCTION,
  ERROR_TRACKING: true,
  PERFORMANCE_MONITORING: IS_PRODUCTION,
}

// Resource Limits
export const LIMITS = {
  // User Limits
  MAX_VMS_PER_USER: IS_PRODUCTION ? 5 : 10,
  MAX_PROJECTS_PER_USER: IS_PRODUCTION ? 100 : 1000,
  MAX_TEAMS_PER_USER: IS_PRODUCTION ? 10 : 50,
  MAX_FILES_PER_PROJECT: 1000,
  
  // File Limits
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_TOTAL_STORAGE: IS_PRODUCTION ? 10 * 1024 * 1024 * 1024 : 100 * 1024 * 1024 * 1024, // 10GB prod, 100GB dev
  
  // API Limits
  API_RATE_LIMIT: IS_PRODUCTION ? 1000 : 10000, // requests per hour
  WEBSOCKET_CONNECTIONS: IS_PRODUCTION ? 10 : 100,
  
  // VM Limits
  VM_MAX_CPU: 8,
  VM_MAX_MEMORY: 32, // GB
  VM_MAX_STORAGE: 500, // GB
  VM_MAX_RUNTIME: 24 * 60, // 24 hours in minutes
}

// Timeouts
export const TIMEOUTS = {
  API_REQUEST: 30000, // 30 seconds
  VM_CREATION: 600000, // 10 minutes
  FILE_UPLOAD: 300000, // 5 minutes
  WEBSOCKET_RECONNECT: 30000, // 30 seconds
  SESSION_TIMEOUT: 8 * 60 * 60 * 1000, // 8 hours
}

// Security Configuration
export const SECURITY_CONFIG = {
  // Password requirements
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_SYMBOLS: true,
  PASSWORD_REQUIRE_NUMBERS: true,
  PASSWORD_REQUIRE_UPPERCASE: true,
  
  // Session security
  SESSION_COOKIE_SECURE: IS_PRODUCTION,
  SESSION_COOKIE_HTTPONLY: true,
  SESSION_COOKIE_SAMESITE: 'strict' as const,
  
  // CSRF protection
  CSRF_PROTECTION: IS_PRODUCTION,
  
  // Rate limiting
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: IS_PRODUCTION ? 100 : 1000,
  
  // Content Security Policy
  CSP_ENABLED: IS_PRODUCTION,
}

// Monitoring and Analytics
export const MONITORING_CONFIG = {
  // Error tracking
  SENTRY_DSN: process.env.REACT_APP_SENTRY_DSN,
  SENTRY_ENVIRONMENT: currentEnv,
  
  // Analytics
  GOOGLE_ANALYTICS_ID: process.env.REACT_APP_GA_ID,
  MIXPANEL_TOKEN: process.env.REACT_APP_MIXPANEL_TOKEN,
  
  // Performance monitoring
  PERFORMANCE_SAMPLE_RATE: IS_PRODUCTION ? 0.1 : 1.0,
  ERROR_SAMPLE_RATE: IS_PRODUCTION ? 0.25 : 1.0,
}

// External Service Configuration
export const EXTERNAL_SERVICES = {
  // Bug Bounty Platforms
  HACKERONE_API_URL: 'https://api.hackerone.com/v1',
  BUGCROWD_API_URL: 'https://api.bugcrowd.com/v2',
  INTIGRITI_API_URL: 'https://api.intigriti.com/external',
  YESWEHACK_API_URL: 'https://api.yeswehack.com',
  
  // Threat Intelligence
  SHODAN_API_URL: 'https://api.shodan.io',
  VIRUSTOTAL_API_URL: 'https://www.virustotal.com/vtapi/v2',
  CVE_API_URL: 'https://cve.circl.lu/api',
  NVD_API_URL: 'https://services.nvd.nist.gov/rest/json',
  
  // Code hosting
  GITHUB_API_URL: 'https://api.github.com',
  GITLAB_API_URL: 'https://gitlab.com/api/v4',
  
  // Cloud providers for VMs
  AWS_REGIONS: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
  GCP_ZONES: ['us-central1-a', 'europe-west1-b', 'asia-east1-a'],
  AZURE_REGIONS: ['eastus', 'westeurope', 'southeastasia'],
}

// VM Templates and Images
export const VM_TEMPLATES = {
  'kali-linux': {
    name: 'Kali Linux',
    description: 'Full Kali Linux penetration testing environment',
    image: 'kalilinux/kali-rolling:latest',
    defaultResources: { cpu: 2, memory: 4, storage: 40 },
    category: 'penetration-testing',
    tools: ['nmap', 'metasploit', 'burpsuite', 'wireshark', 'sqlmap']
  },
  'parrot-security': {
    name: 'Parrot Security OS',
    description: 'Parrot Security operating system for ethical hackers',
    image: 'parrotsec/security:latest',
    defaultResources: { cpu: 2, memory: 4, storage: 40 },
    category: 'penetration-testing',
    tools: ['anonsurf', 'john', 'hashcat', 'aircrack-ng', 'recon-ng']
  },
  'ubuntu-security': {
    name: 'Ubuntu Security Lab',
    description: 'Ubuntu with security research tools',
    image: 'ubuntu:22.04',
    defaultResources: { cpu: 2, memory: 2, storage: 20 },
    category: 'general',
    tools: ['docker', 'git', 'python3', 'nodejs', 'go']
  },
  'windows-security': {
    name: 'Windows Security Lab',
    description: 'Windows environment for security testing',
    image: 'mcr.microsoft.com/windows/servercore:ltsc2022',
    defaultResources: { cpu: 4, memory: 8, storage: 80 },
    category: 'windows-security',
    tools: ['powershell', 'sysinternals', 'wireshark', 'procmon']
  }
}

// Development-specific configuration
export const DEV_CONFIG = IS_DEVELOPMENT ? {
  MOCK_APIS: true,
  BYPASS_AUTH: false,
  VERBOSE_LOGGING: true,
  ENABLE_REACT_DEVTOOLS: true,
  HOT_RELOAD: true,
} : {}

// Production-specific configuration
export const PROD_CONFIG = IS_PRODUCTION ? {
  MINIFY_ASSETS: true,
  ENABLE_SERVICE_WORKER: true,
  PRELOAD_CRITICAL_RESOURCES: true,
  LAZY_LOAD_COMPONENTS: true,
} : {}

// Validation function to ensure all required environment variables are set
export function validateEnvironment(): { valid: boolean; missing: string[] } {
  const required = IS_PRODUCTION ? [
    'REACT_APP_API_URL',
    'REACT_APP_WS_URL',
    'REACT_APP_SENTRY_DSN',
  ] : []

  const missing = required.filter(key => !process.env[key])
  
  return {
    valid: missing.length === 0,
    missing
  }
}

// Initialize environment validation
const envValidation = validateEnvironment()
if (!envValidation.valid) {
  console.warn('Missing required environment variables:', envValidation.missing)
  if (IS_PRODUCTION) {
    throw new Error(`Missing required environment variables: ${envValidation.missing.join(', ')}`)
  }
}

// Export consolidated configuration
export const CONFIG = {
  NODE_ENV,
  IS_PRODUCTION,
  IS_DEVELOPMENT,
  ENDPOINTS,
  FEATURE_FLAGS,
  LIMITS,
  TIMEOUTS,
  SECURITY_CONFIG,
  MONITORING_CONFIG,
  EXTERNAL_SERVICES,
  VM_TEMPLATES,
  ...(IS_DEVELOPMENT ? DEV_CONFIG : {}),
  ...(IS_PRODUCTION ? PROD_CONFIG : {}),
}

export default CONFIG