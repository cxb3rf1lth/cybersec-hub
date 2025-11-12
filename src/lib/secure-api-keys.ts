/**
 * Secure API Key Manager
 * Uses Web Crypto API for proper encryption of API keys
 */

import { EnhancedEncryption, EncryptedData } from '@/lib/enhanced-security'
import { toast } from 'sonner'

export interface SecureAPIKey {
  platform: string
  encryptedKey: EncryptedData
  createdAt: string
  lastUsed: string
  status: 'active' | 'revoked' | 'expired'
}

export interface APIKeyValidationResult {
  valid: boolean
  error?: string
  capabilities?: string[]
  rateLimit?: {
    limit: number
    remaining: number
    reset: number
  }
}

/**
 * Secure API Key Storage and Management
 */
export class SecureAPIKeyManager {
  private static instance: SecureAPIKeyManager
  private encryption: EnhancedEncryption
  private keys: Map<string, SecureAPIKey> = new Map()
  private initialized: boolean = false

  private constructor() {
    this.encryption = EnhancedEncryption.getInstance()
  }

  static getInstance(): SecureAPIKeyManager {
    if (!SecureAPIKeyManager.instance) {
      SecureAPIKeyManager.instance = new SecureAPIKeyManager()
    }
    return SecureAPIKeyManager.instance
  }

  /**
   * Initialize with user password for encryption
   */
  async initialize(userPassword?: string): Promise<void> {
    if (this.initialized) return

    try {
      // Derive encryption key from user password if provided
      await this.encryption.initializeMasterKey(userPassword)
      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize API key manager:', error)
      throw new Error('Failed to initialize secure storage')
    }
  }

  /**
   * Store API key securely
   */
  async storeKey(platform: string, apiKey: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('API key manager not initialized. Call initialize() first.')
    }

    try {
      // Validate key format
      if (!apiKey || apiKey.trim().length === 0) {
        throw new Error('Invalid API key: Key cannot be empty')
      }

      // Check for common test/demo patterns
      if (apiKey.startsWith('demo_') || apiKey.startsWith('test_') || apiKey === 'placeholder') {
        throw new Error('Demo or test keys are not allowed in production')
      }

      // Encrypt the API key
      const encryptedKey = await this.encryption.encrypt(apiKey)

      const secureKey: SecureAPIKey = {
        platform,
        encryptedKey,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        status: 'active'
      }

      this.keys.set(platform, secureKey)

      // Note: In production, this should be stored server-side, not in browser storage
      // For now, we store in memory only for security
      console.warn(`API key for ${platform} stored in memory only. Implement server-side storage for production.`)

      toast.success(`API key for ${platform} stored securely`)
    } catch (error) {
      console.error(`Failed to store API key for ${platform}:`, error)
      throw error
    }
  }

  /**
   * Retrieve and decrypt API key
   */
  async getKey(platform: string): Promise<string | null> {
    if (!this.initialized) {
      throw new Error('API key manager not initialized')
    }

    try {
      const secureKey = this.keys.get(platform)

      if (!secureKey) {
        return null
      }

      if (secureKey.status !== 'active') {
        throw new Error(`API key for ${platform} is ${secureKey.status}`)
      }

      // Decrypt the key
      const decryptedKey = await this.encryption.decrypt(secureKey.encryptedKey)

      // Update last used timestamp
      secureKey.lastUsed = new Date().toISOString()
      this.keys.set(platform, secureKey)

      return decryptedKey
    } catch (error) {
      console.error(`Failed to retrieve API key for ${platform}:`, error)
      return null
    }
  }

  /**
   * Revoke an API key
   */
  async revokeKey(platform: string): Promise<void> {
    const key = this.keys.get(platform)
    if (key) {
      key.status = 'revoked'
      this.keys.set(platform, key)
      toast.success(`API key for ${platform} revoked`)
    }
  }

  /**
   * Remove API key completely
   */
  async removeKey(platform: string): Promise<void> {
    this.keys.delete(platform)
    toast.success(`API key for ${platform} removed`)
  }

  /**
   * List all stored platforms (without exposing keys)
   */
  listPlatforms(): string[] {
    return Array.from(this.keys.keys())
  }

  /**
   * Check if a platform has an active key
   */
  hasActiveKey(platform: string): boolean {
    const key = this.keys.get(platform)
    return key !== undefined && key.status === 'active'
  }

  /**
   * Validate API key format (basic validation)
   */
  validateKeyFormat(platform: string, apiKey: string): { valid: boolean; error?: string } {
    // Basic validations
    if (!apiKey || apiKey.trim().length === 0) {
      return { valid: false, error: 'API key cannot be empty' }
    }

    if (apiKey.length < 10) {
      return { valid: false, error: 'API key too short' }
    }

    if (apiKey.startsWith('demo_') || apiKey.startsWith('test_')) {
      return { valid: false, error: 'Demo/test keys not allowed' }
    }

    // Platform-specific validation
    const platformPatterns: Record<string, { pattern: RegExp; name: string }> = {
      hackerone: {
        pattern: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/,
        name: 'UUID format'
      },
      shodan: {
        pattern: /^[A-Za-z0-9]{32}$/,
        name: '32 character alphanumeric'
      },
      virustotal: {
        pattern: /^[a-f0-9]{64}$/,
        name: '64 character hex'
      }
    }

    const config = platformPatterns[platform.toLowerCase()]
    if (config && !config.pattern.test(apiKey)) {
      return {
        valid: false,
        error: `Invalid API key format for ${platform}. Expected: ${config.name}`
      }
    }

    return { valid: true }
  }

  /**
   * Clear all keys (use with caution)
   */
  clearAll(): void {
    this.keys.clear()
    toast.success('All API keys cleared')
  }
}

export default SecureAPIKeyManager
