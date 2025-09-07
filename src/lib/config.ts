/**
 * Production Configuration Management
 * Handles API keys, environment variables, and security settings
 */

import { useKVWithFallback } from '@/lib/kv-fallback';

export interface APIKeyConfig {
  platform: string
  keyType: 'public' | 'private' | 'oauth'
  required: boolean
  description: string
  docsUrl: string
  testEndpoint?: string
  scopesRequired?: string[]
}

export interface SecurityConfig {
  encryptionEnabled: boolean
  keyRotationInterval: number
  maxRetries: number
  timeoutMs: number
  rateLimitSettings: {
    requestsPerMinute: number
    burstLimit: number
  }
}

// Platform-specific API configuration
export const API_CONFIGS: Record<string, APIKeyConfig> = {
  hackerone: {
    platform: 'HackerOne',
    keyType: 'private',
    required: true,
    description: 'HackerOne API token for accessing bug bounty programs and reports',
    docsUrl: 'https://api.hackerone.com/',
    testEndpoint: '/programs',
    scopesRequired: ['program:read', 'report:read']
  },
  bugcrowd: {
    platform: 'Bugcrowd',
    keyType: 'private', 
    required: true,
    description: 'Bugcrowd API key for program and submission data',
    docsUrl: 'https://docs.bugcrowd.com/api/',
    testEndpoint: '/programs',
    scopesRequired: ['read:programs', 'read:submissions']
  },
  intigriti: {
    platform: 'Intigriti',
    keyType: 'oauth',
    required: true,
    description: 'Intigriti OAuth token for researcher program access',
    docsUrl: 'https://docs.intigriti.com/api/',
    testEndpoint: '/researcher/programs',
    scopesRequired: ['read:programs', 'read:submissions']
  },
  yeswehack: {
    platform: 'YesWeHack',
    keyType: 'private',
    required: true,
    description: 'YesWeHack API key for program and vulnerability data',
    docsUrl: 'https://docs.yeswehack.com/api/',
    testEndpoint: '/programs',
    scopesRequired: ['programs:read']
  },
  shodan: {
    platform: 'Shodan',
    keyType: 'public',
    required: true,
    description: 'Shodan API key for Internet-connected device scanning',
    docsUrl: 'https://developer.shodan.io/api',
    testEndpoint: '/api-info',
    scopesRequired: ['query', 'scan']
  },
  projectdiscovery: {
    platform: 'ProjectDiscovery',
    keyType: 'private',
    required: false,
    description: 'ProjectDiscovery Cloud API key for nuclei templates and scanning',
    docsUrl: 'https://docs.projectdiscovery.io/api/',
    testEndpoint: '/nuclei/templates',
    scopesRequired: ['templates:read', 'scans:write']
  },
  virustotal: {
    platform: 'VirusTotal',
    keyType: 'public',
    required: false,
    description: 'VirusTotal API key for malware and URL analysis',
    docsUrl: 'https://developers.virustotal.com/reference',
    testEndpoint: '/api-info',
    scopesRequired: ['scan', 'read']
  },
  alienvault: {
    platform: 'AlienVault OTX',
    keyType: 'public',
    required: false,
    description: 'AlienVault Open Threat Exchange API key for threat intelligence',
    docsUrl: 'https://otx.alienvault.com/api',
    testEndpoint: '/api/v1/user/me',
    scopesRequired: ['read']
  }
};

// Security configuration
export const SECURITY_CONFIG: SecurityConfig = {
  encryptionEnabled: true,
  keyRotationInterval: 2592000000, // 30 days in milliseconds
  maxRetries: 3,
  timeoutMs: 30000,
  rateLimitSettings: {
    requestsPerMinute: 60,
    burstLimit: 10
  }
};

// Environment-specific settings
export const ENVIRONMENT_CONFIG = {
  development: {
    logLevel: 'debug',
    enableMocking: true,
    strictSSL: false
  },
  production: {
    logLevel: 'error',
    enableMocking: false,
    strictSSL: true
  }
};

/**
 * Secure API Key Management Hook
 */
export function useAPIKeys() {
  const [encryptedKeys, setEncryptedKeys] = useKVWithFallback<Record<string, string>>('encrypted_api_keys', {});
  const [keyMetadata, setKeyMetadata] = useKVWithFallback<Record<string, { 
    created: string
    lastUsed: string
    rotationDue: boolean
    usage: number
  }>>('api_key_metadata', {});

  // Simple encryption for client-side storage (in production, use proper encryption)
  const encryptKey = (key: string): string => {
    return btoa(key).split('').reverse().join('');
  };

  const decryptKey = (encryptedKey: string): string => {
    return atob(encryptedKey.split('').reverse().join(''));
  };

  const setAPIKey = (platform: string, apiKey: string) => {
    const encrypted = encryptKey(apiKey);
    const now = new Date().toISOString();
    
    setEncryptedKeys(current => ({
      ...current,
      [platform]: encrypted
    }));

    setKeyMetadata(current => ({
      ...current,
      [platform]: {
        created: current[platform]?.created || now,
        lastUsed: now,
        rotationDue: false,
        usage: (current[platform]?.usage || 0) + 1
      }
    }));
  };

  const getAPIKey = (platform: string): string | null => {
    const encrypted = encryptedKeys[platform];
    if (!encrypted) {return null;}

    // Update last used timestamp
    const now = new Date().toISOString();
    setKeyMetadata(current => ({
      ...current,
      [platform]: {
        ...current[platform],
        lastUsed: now,
        usage: (current[platform]?.usage || 0) + 1
      }
    }));

    return decryptKey(encrypted);
  };

  const removeAPIKey = (platform: string) => {
    setEncryptedKeys(current => {
      const updated = { ...current };
      delete updated[platform];
      return updated;
    });

    setKeyMetadata(current => {
      const updated = { ...current };
      delete updated[platform];
      return updated;
    });
  };

  const isKeyExpired = (platform: string): boolean => {
    const metadata = keyMetadata[platform];
    if (!metadata) {return false;}

    const created = new Date(metadata.created).getTime();
    const now = Date.now();
    return (now - created) > SECURITY_CONFIG.keyRotationInterval;
  };

  const getAllPlatformStatuses = () => {
    return Object.keys(API_CONFIGS).map(platform => ({
      platform,
      config: API_CONFIGS[platform],
      hasKey: !!encryptedKeys[platform],
      metadata: keyMetadata[platform],
      expired: isKeyExpired(platform)
    }));
  };

  return {
    setAPIKey,
    getAPIKey,
    removeAPIKey,
    isKeyExpired,
    getAllPlatformStatuses,
    keyMetadata
  };
}

/**
 * API Key Validation and Testing
 */
export class APIKeyValidator {
  static patterns: Record<string, RegExp> = {
    hackerone: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/,
    bugcrowd: /^[A-Za-z0-9]{40,}$/,
    intigriti: /^[A-Za-z0-9_-]{32,}$/,
    yeswehack: /^[A-Za-z0-9]{32,}$/,
    shodan: /^[A-Za-z0-9]{32}$/,
    projectdiscovery: /^pd_[A-Za-z0-9]{40}$/,
    virustotal: /^[a-f0-9]{64}$/,
    alienvault: /^[a-f0-9]{64}$/
  };

  static validateFormat(platform: string, apiKey: string): boolean {
    if (!apiKey || apiKey.length < 8) {return false;}
    
    const pattern = this.patterns[platform];
    return pattern ? pattern.test(apiKey) : apiKey.length >= 16;
  }

  static async testConnection(platform: string, apiKey: string): Promise<{
    valid: boolean
    error?: string
    info?: any
  }> {
    const config = API_CONFIGS[platform];
    if (!config || !config.testEndpoint) {
      return { valid: false, error: 'No test endpoint configured' };
    }

    try {
      // Import API client dynamically to avoid circular dependencies
      const { apiClient, API_CONFIG } = await import('./api');
      
      const platformConfig = API_CONFIG[platform as keyof typeof API_CONFIG];
      if (!platformConfig) {
        return { valid: false, error: 'Platform not configured' };
      }

      // Test the API key with a simple request
      const response = await apiClient.request(
        platform as any,
        config.testEndpoint,
        { method: 'GET' },
        apiKey
      );

      return { 
        valid: true, 
        info: {
          platform: config.platform,
          scopes: config.scopesRequired,
          testEndpoint: config.testEndpoint,
          response: response
        }
      };
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }
}

/**
 * Rate Limiting and Quota Management
 */
export class QuotaManager {
  private quotas = new Map<string, {
    requests: number
    resetTime: number
    limit: number
    burst: number
  }>();

  checkQuota(platform: string): boolean {
    const quota = this.quotas.get(platform);
    const now = Date.now();

    if (!quota) {
      // Initialize quota for new platform
      this.quotas.set(platform, {
        requests: 1,
        resetTime: now + 60000, // Reset in 1 minute
        limit: SECURITY_CONFIG.rateLimitSettings.requestsPerMinute,
        burst: SECURITY_CONFIG.rateLimitSettings.burstLimit
      });
      return true;
    }

    // Reset if time window passed
    if (now > quota.resetTime) {
      quota.requests = 0;
      quota.resetTime = now + 60000;
    }

    // Check if within limits
    if (quota.requests >= quota.limit) {
      return false;
    }

    quota.requests++;
    return true;
  }

  getRemainingQuota(platform: string): number {
    const quota = this.quotas.get(platform);
    if (!quota) {return SECURITY_CONFIG.rateLimitSettings.requestsPerMinute;}

    const now = Date.now();
    if (now > quota.resetTime) {
      return quota.limit;
    }

    return Math.max(0, quota.limit - quota.requests);
  }

  getQuotaResetTime(platform: string): number {
    const quota = this.quotas.get(platform);
    return quota?.resetTime || Date.now() + 60000;
  }
}

// Global quota manager instance
export const quotaManager = new QuotaManager();

/**
 * Secure Configuration Store
 */
export function useSecureConfig() {
  const [config, setConfig] = useKVWithFallback<{
    security: SecurityConfig
    enabledPlatforms: string[]
    lastSync: Record<string, string>
    syncIntervals: Record<string, number>
  }>('secure_config', {
    security: SECURITY_CONFIG,
    enabledPlatforms: ['hackerone', 'bugcrowd', 'intigriti', 'shodan'],
    lastSync: {},
    syncIntervals: {
      hackerone: 300000, // 5 minutes
      bugcrowd: 600000,  // 10 minutes
      intigriti: 900000, // 15 minutes
      shodan: 1800000,   // 30 minutes
      cve: 3600000       // 1 hour
    }
  });

  const updateSyncTime = (platform: string) => {
    setConfig(current => ({
      ...current,
      lastSync: {
        ...current.lastSync,
        [platform]: new Date().toISOString()
      }
    }));
  };

  const setSyncInterval = (platform: string, intervalMs: number) => {
    setConfig(current => ({
      ...current,
      syncIntervals: {
        ...current.syncIntervals,
        [platform]: intervalMs
      }
    }));
  };

  const enablePlatform = (platform: string) => {
    setConfig(current => ({
      ...current,
      enabledPlatforms: [...new Set([...current.enabledPlatforms, platform])]
    }));
  };

  const disablePlatform = (platform: string) => {
    setConfig(current => ({
      ...current,
      enabledPlatforms: current.enabledPlatforms.filter(p => p !== platform)
    }));
  };

  return {
    config,
    updateSyncTime,
    setSyncInterval,
    enablePlatform,
    disablePlatform,
    setConfig
  };
}