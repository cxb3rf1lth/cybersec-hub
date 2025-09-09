/**
 * Enhanced Security Module
 * Provides robust encryption, validation, and security features
 */

import { useKVWithFallback } from '@/lib/kv-fallback'

// Security constants
const ENCRYPTION_ALGORITHM = 'AES-GCM'
const KEY_DERIVATION_ITERATIONS = 100000
const SALT_LENGTH = 32
const IV_LENGTH = 12
const TAG_LENGTH = 16

export interface SecurityConfig {
  encryptionEnabled: boolean
  keyRotationInterval: number
  maxRetries: number
  timeoutMs: number
  sessionTimeout: number
  csrfProtection: boolean
  rateLimitSettings: {
    requestsPerMinute: number
    burstLimit: number
    windowMs: number
  }
  passwordPolicy: {
    minLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumbers: boolean
    requireSpecialChars: boolean
  }
}

export interface EncryptedData {
  data: string
  salt: string
  iv: string
  timestamp: number
  version: string
}

export interface SecurityAuditLog {
  timestamp: number
  event: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  details: any
  userAgent?: string
  ip?: string
}

// Enhanced security configuration
export const ENHANCED_SECURITY_CONFIG: SecurityConfig = {
  encryptionEnabled: true,
  keyRotationInterval: 1209600000, // 14 days in milliseconds  
  maxRetries: 3,
  timeoutMs: 30000,
  sessionTimeout: 3600000, // 1 hour
  csrfProtection: true,
  rateLimitSettings: {
    requestsPerMinute: 60,
    burstLimit: 10,
    windowMs: 60000
  },
  passwordPolicy: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  }
}

/**
 * Enhanced Encryption Service using Web Crypto API
 */
export class EnhancedEncryption {
  private static instance: EnhancedEncryption
  private masterKey: CryptoKey | null = null

  static getInstance(): EnhancedEncryption {
    if (!EnhancedEncryption.instance) {
      EnhancedEncryption.instance = new EnhancedEncryption()
    }
    return EnhancedEncryption.instance
  }

  async initializeMasterKey(password?: string): Promise<void> {
    if (this.masterKey) return

    try {
      // In production, derive from user password or secure key
      const keyMaterial = password || 'CyberConnect-SecureMasterKey-2024'
      const encoder = new TextEncoder()
      const keyData = encoder.encode(keyMaterial)

      // Import key material for PBKDF2
      const baseKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        'PBKDF2',
        false,
        ['deriveKey']
      )

      // Generate salt for key derivation
      const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))

      // Derive master key
      this.masterKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: KEY_DERIVATION_ITERATIONS,
          hash: 'SHA-256'
        },
        baseKey,
        {
          name: ENCRYPTION_ALGORITHM,
          length: 256
        },
        false,
        ['encrypt', 'decrypt']
      )
    } catch (error) {
      console.error('Failed to initialize master key:', error)
      throw new Error('Encryption initialization failed')
    }
  }

  async encrypt(plaintext: string): Promise<EncryptedData> {
    if (!this.masterKey) {
      await this.initializeMasterKey()
    }

    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(plaintext)

      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))

      // Generate random salt for this encryption
      const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))

      // Encrypt data
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: ENCRYPTION_ALGORITHM,
          iv: iv
        },
        this.masterKey!,
        data
      )

      // Convert to base64 strings
      const encryptedData = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)))
      const ivB64 = btoa(String.fromCharCode(...iv))
      const saltB64 = btoa(String.fromCharCode(...salt))

      return {
        data: encryptedData,
        salt: saltB64,
        iv: ivB64,
        timestamp: Date.now(),
        version: '1.0'
      }
    } catch (error) {
      console.error('Encryption failed:', error)
      throw new Error('Failed to encrypt data')
    }
  }

  async decrypt(encryptedData: EncryptedData): Promise<string> {
    if (!this.masterKey) {
      await this.initializeMasterKey()
    }

    try {
      // Convert from base64
      const data = Uint8Array.from(atob(encryptedData.data), c => c.charCodeAt(0))
      const iv = Uint8Array.from(atob(encryptedData.iv), c => c.charCodeAt(0))

      // Decrypt data
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: ENCRYPTION_ALGORITHM,
          iv: iv
        },
        this.masterKey!,
        data
      )

      const decoder = new TextDecoder()
      return decoder.decode(decryptedBuffer)
    } catch (error) {
      console.error('Decryption failed:', error)
      throw new Error('Failed to decrypt data')
    }
  }

  generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  async hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
    const encoder = new TextEncoder()
    const passwordData = encoder.encode(password)
    
    // Generate salt if not provided
    const saltBytes = salt 
      ? Uint8Array.from(atob(salt), c => c.charCodeAt(0))
      : crypto.getRandomValues(new Uint8Array(SALT_LENGTH))

    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordData,
      'PBKDF2',
      false,
      ['deriveBits']
    )

    // Derive hash
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBytes,
        iterations: KEY_DERIVATION_ITERATIONS,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    )

    const hash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
    const saltB64 = btoa(String.fromCharCode(...saltBytes))

    return { hash, salt: saltB64 }
  }

  validatePasswordPolicy(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    const policy = ENHANCED_SECURITY_CONFIG.passwordPolicy

    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters long`)
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    if (policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    return { valid: errors.length === 0, errors }
  }
}

/**
 * Rate Limiting Service
 */
export class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number; blocked: boolean }>()
  private config = ENHANCED_SECURITY_CONFIG.rateLimitSettings

  checkLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const window = this.requests.get(identifier)

    if (!window || now > window.resetTime) {
      // Initialize or reset window
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.config.windowMs,
        blocked: false
      })
      return {
        allowed: true,
        remaining: this.config.requestsPerMinute - 1,
        resetTime: now + this.config.windowMs
      }
    }

    if (window.blocked) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: window.resetTime
      }
    }

    if (window.count >= this.config.requestsPerMinute) {
      window.blocked = true
      return {
        allowed: false,
        remaining: 0,
        resetTime: window.resetTime
      }
    }

    window.count++
    return {
      allowed: true,
      remaining: this.config.requestsPerMinute - window.count,
      resetTime: window.resetTime
    }
  }

  reset(identifier: string): void {
    this.requests.delete(identifier)
  }

  getStatus(identifier: string): { requests: number; remaining: number; resetTime: number } | null {
    const window = this.requests.get(identifier)
    if (!window) return null

    return {
      requests: window.count,
      remaining: Math.max(0, this.config.requestsPerMinute - window.count),
      resetTime: window.resetTime
    }
  }
}

/**
 * Security Audit Logger
 */
export class SecurityAuditLogger {
  private logs: SecurityAuditLog[] = []
  private maxLogs = 10000

  log(event: string, severity: SecurityAuditLog['severity'], details: any): void {
    const logEntry: SecurityAuditLog = {
      timestamp: Date.now(),
      event,
      severity,
      details,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      ip: 'Unknown' // In production, get from server
    }

    this.logs.unshift(logEntry)

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    // Log to console for development
    if (severity === 'critical' || severity === 'high') {
      console.warn(`[SECURITY ${severity.toUpperCase()}] ${event}:`, details)
    }
  }

  getLogs(filter?: { severity?: SecurityAuditLog['severity']; event?: string; since?: number }): SecurityAuditLog[] {
    let filteredLogs = this.logs

    if (filter) {
      filteredLogs = this.logs.filter(log => {
        if (filter.severity && log.severity !== filter.severity) return false
        if (filter.event && !log.event.includes(filter.event)) return false
        if (filter.since && log.timestamp < filter.since) return false
        return true
      })
    }

    return filteredLogs
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  clearLogs(): void {
    this.logs = []
  }
}

/**
 * CSRF Protection
 */
export class CSRFProtection {
  private tokens = new Map<string, { token: string; expires: number }>()
  private tokenExpiry = 3600000 // 1 hour

  generateToken(sessionId: string): string {
    const token = EnhancedEncryption.getInstance().generateSecureToken(32)
    this.tokens.set(sessionId, {
      token,
      expires: Date.now() + this.tokenExpiry
    })
    return token
  }

  validateToken(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId)
    if (!stored) return false

    if (Date.now() > stored.expires) {
      this.tokens.delete(sessionId)
      return false
    }

    return stored.token === token
  }

  refreshToken(sessionId: string): string {
    return this.generateToken(sessionId)
  }

  removeToken(sessionId: string): void {
    this.tokens.delete(sessionId)
  }

  cleanExpired(): void {
    const now = Date.now()
    for (const [sessionId, data] of this.tokens.entries()) {
      if (now > data.expires) {
        this.tokens.delete(sessionId)
      }
    }
  }
}

// Global instances
export const enhancedEncryption = EnhancedEncryption.getInstance()
export const rateLimiter = new RateLimiter()
export const securityLogger = new SecurityAuditLogger()
export const csrfProtection = new CSRFProtection()

/**
 * React Hook for Enhanced Security Management
 */
export function useEnhancedSecurity() {
  const [securityConfig, setSecurityConfig] = useKVWithFallback<SecurityConfig>('security_config', ENHANCED_SECURITY_CONFIG)
  const [sessionId] = useKVWithFallback<string>('session_id', () => enhancedEncryption.generateSecureToken())

  const encryptData = async (data: string): Promise<string> => {
    try {
      const encrypted = await enhancedEncryption.encrypt(data)
      return JSON.stringify(encrypted)
    } catch (error) {
      securityLogger.log('encryption_failed', 'high', { error: error.message })
      throw error
    }
  }

  const decryptData = async (encryptedString: string): Promise<string> => {
    try {
      const encrypted: EncryptedData = JSON.parse(encryptedString)
      return await enhancedEncryption.decrypt(encrypted)
    } catch (error) {
      securityLogger.log('decryption_failed', 'high', { error: error.message })
      throw error
    }
  }

  const checkRateLimit = (identifier: string) => {
    const result = rateLimiter.checkLimit(identifier)
    if (!result.allowed) {
      securityLogger.log('rate_limit_exceeded', 'medium', { identifier, ...result })
    }
    return result
  }

  const generateCSRFToken = () => {
    return csrfProtection.generateToken(sessionId)
  }

  const validateCSRFToken = (token: string) => {
    const valid = csrfProtection.validateToken(sessionId, token)
    if (!valid) {
      securityLogger.log('csrf_validation_failed', 'high', { sessionId, token: token.slice(-8) })
    }
    return valid
  }

  const logSecurityEvent = (event: string, severity: SecurityAuditLog['severity'], details: any) => {
    securityLogger.log(event, severity, details)
  }

  const validatePassword = (password: string) => {
    return enhancedEncryption.validatePasswordPolicy(password)
  }

  const hashPassword = async (password: string, salt?: string) => {
    return enhancedEncryption.hashPassword(password, salt)
  }

  const getSecurityLogs = (filter?: Parameters<typeof securityLogger.getLogs>[0]) => {
    return securityLogger.getLogs(filter)
  }

  return {
    securityConfig,
    setSecurityConfig,
    encryptData,
    decryptData,
    checkRateLimit,
    generateCSRFToken,
    validateCSRFToken,
    logSecurityEvent,
    validatePassword,
    hashPassword,
    getSecurityLogs,
    sessionId
  }
}

// Initialize security services
export async function initializeSecurityServices(): Promise<void> {
  try {
    // Initialize encryption
    await enhancedEncryption.initializeMasterKey()
    
    // Clean expired CSRF tokens periodically
    setInterval(() => {
      csrfProtection.cleanExpired()
    }, 300000) // Every 5 minutes

    securityLogger.log('security_services_initialized', 'low', { 
      timestamp: Date.now(),
      services: ['encryption', 'rate_limiter', 'csrf_protection', 'audit_logger']
    })
  } catch (error) {
    securityLogger.log('security_initialization_failed', 'critical', { error: error.message })
    throw error
  }
}