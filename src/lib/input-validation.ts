/**
 * Input Validation Module
 * Comprehensive validation using Zod for all user inputs and API data
 */

import { z } from 'zod'

/**
 * Common validation schemas
 */

// Email validation
export const emailSchema = z.string().email('Invalid email address')

// URL validation (with optional protocol)
export const urlSchema = z.string().url('Invalid URL').or(
  z.string().regex(/^([a-z0-9-]+\.)+[a-z0-9]{2,}(\/.*)?$/i, 'Invalid domain')
)

// IP address validation (IPv4 and IPv6)
export const ipv4Schema = z.string().regex(
  /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/,
  'Invalid IPv4 address'
)

export const ipv6Schema = z.string().regex(
  /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/,
  'Invalid IPv6 address'
)

export const ipSchema = ipv4Schema.or(ipv6Schema)

// CIDR notation validation
export const cidrSchema = z.string().regex(
  /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}\/(3[0-2]|[12]?[0-9])$/,
  'Invalid CIDR notation'
)

// Domain validation
export const domainSchema = z.string().regex(
  /^([a-z0-9-]+\.)+[a-z0-9]{2,}$/i,
  'Invalid domain name'
)

// Port validation
export const portSchema = z.number().int().min(1).max(65535)

// CVE ID validation
export const cveSchema = z.string().regex(
  /^CVE-\d{4}-\d{4,}$/,
  'Invalid CVE format (expected: CVE-YYYY-NNNNN)'
)

// API Key validation (minimum security requirements)
export const apiKeySchema = z.string()
  .min(10, 'API key too short')
  .refine(
    (key) => !key.startsWith('demo_') && !key.startsWith('test_') && key !== 'placeholder',
    'Demo or test keys are not allowed'
  )

// Username validation
export const usernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')

// Password validation (strong password requirements)
export const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

/**
 * Bug Bounty & Security Schemas
 */

// Vulnerability severity
export const severitySchema = z.enum(['critical', 'high', 'medium', 'low', 'info'])

// Bug bounty report
export const bugBountyReportSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  severity: severitySchema,
  target: urlSchema.or(domainSchema).or(ipSchema),
  steps: z.string().min(20, 'Steps to reproduce must be detailed'),
  impact: z.string().min(20, 'Impact description required'),
  cve: cveSchema.optional(),
  attachments: z.array(z.object({
    name: z.string(),
    type: z.string(),
    size: z.number().max(10 * 1024 * 1024, 'File size must be under 10MB')
  })).optional()
})

// Target configuration for scanning
export const scanTargetSchema = z.object({
  id: z.string().uuid().optional(),
  target: urlSchema.or(domainSchema).or(ipSchema).or(cidrSchema),
  type: z.enum(['domain', 'ip', 'cidr', 'url']),
  ports: z.array(portSchema).optional(),
  excludePorts: z.array(portSchema).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().max(500).optional()
})

// API connection request
export const apiConnectionSchema = z.object({
  platform: z.string().min(1),
  apiKey: apiKeySchema,
  additionalConfig: z.record(z.any()).optional()
})

/**
 * User & Team Schemas
 */

// User profile
export const userProfileSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  website: urlSchema.optional(),
  location: z.string().max(100).optional()
})

// Team creation
export const teamSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(500).optional(),
  isPrivate: z.boolean().default(false),
  maxMembers: z.number().int().min(2).max(100).optional()
})

/**
 * Message & Chat Schemas
 */

// Message validation
export const messageSchema = z.object({
  chatId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  type: z.enum(['text', 'code', 'file', 'image']).default('text'),
  metadata: z.record(z.any()).optional()
})

/**
 * Environment Configuration Schema
 */

export const environmentConfigSchema = z.object({
  API_BASE_URL: urlSchema,
  WS_BASE_URL: z.string().regex(/^wss?:\/\//, 'Invalid WebSocket URL'),
  GITHUB_CLIENT_ID: z.string().min(20).optional(),
  SHODAN_API_KEY: apiKeySchema.optional(),
  VIRUSTOTAL_API_KEY: apiKeySchema.optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  ENABLE_ANALYTICS: z.boolean().default(false),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info')
})

/**
 * Validation utility functions
 */

export class InputValidator {
  /**
   * Validate and sanitize input
   */
  static validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
    try {
      const result = schema.parse(data)
      return { success: true, data: result }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        return { success: false, errors }
      }
      return { success: false, errors: ['Validation failed'] }
    }
  }

  /**
   * Sanitize HTML to prevent XSS
   */
  static sanitizeHTML(input: string): string {
    const div = document.createElement('div')
    div.textContent = input
    return div.innerHTML
  }

  /**
   * Sanitize SQL input (basic protection)
   */
  static sanitizeSQL(input: string): string {
    return input.replace(/['";\\]/g, '')
  }

  /**
   * Validate target for security scanning
   */
  static validateScanTarget(target: string): { valid: boolean; type?: string; error?: string } {
    // Check URL
    const urlResult = urlSchema.safeParse(target)
    if (urlResult.success) {
      return { valid: true, type: 'url' }
    }

    // Check domain
    const domainResult = domainSchema.safeParse(target)
    if (domainResult.success) {
      return { valid: true, type: 'domain' }
    }

    // Check IP
    const ipResult = ipSchema.safeParse(target)
    if (ipResult.success) {
      return { valid: true, type: 'ip' }
    }

    // Check CIDR
    const cidrResult = cidrSchema.safeParse(target)
    if (cidrResult.success) {
      return { valid: true, type: 'cidr' }
    }

    return { valid: false, error: 'Invalid target format' }
  }

  /**
   * Check if input contains suspicious patterns (potential injection attacks)
   */
  static containsSuspiciousPatterns(input: string): { suspicious: boolean; reason?: string } {
    const suspiciousPatterns = [
      { pattern: /<script/i, reason: 'Potential XSS attack' },
      { pattern: /javascript:/i, reason: 'Potential XSS attack' },
      { pattern: /on\w+\s*=/i, reason: 'Potential XSS attack (event handler)' },
      { pattern: /union\s+select/i, reason: 'Potential SQL injection' },
      { pattern: /;\s*drop\s+table/i, reason: 'Potential SQL injection' },
      { pattern: /\.\.\/\.\.\//,reason: 'Potential path traversal' },
      { pattern: /%00/, reason: 'Null byte injection' },
      { pattern: /\$\{.*\}/, reason: 'Potential template injection' }
    ]

    for (const { pattern, reason } of suspiciousPatterns) {
      if (pattern.test(input)) {
        return { suspicious: true, reason }
      }
    }

    return { suspicious: false }
  }

  /**
   * Validate rate limit not exceeded
   */
  static checkRateLimit(key: string, maxRequests: number, windowMs: number): { allowed: boolean; retryAfter?: number } {
    const now = Date.now()
    const storageKey = `ratelimit_${key}`

    try {
      const stored = localStorage.getItem(storageKey)
      const data = stored ? JSON.parse(stored) : { count: 0, resetTime: now + windowMs }

      // Reset if window expired
      if (now >= data.resetTime) {
        data.count = 0
        data.resetTime = now + windowMs
      }

      // Check if limit exceeded
      if (data.count >= maxRequests) {
        const retryAfter = Math.ceil((data.resetTime - now) / 1000)
        return { allowed: false, retryAfter }
      }

      // Increment and save
      data.count++
      localStorage.setItem(storageKey, JSON.stringify(data))

      return { allowed: true }
    } catch (error) {
      console.error('Rate limit check failed:', error)
      return { allowed: true } // Fail open to avoid blocking legitimate users
    }
  }
}

export default InputValidator
