/**
 * Secure Authentication Manager
 * NO demo tokens, NO localStorage for sensitive data
 * Implements secure session management
 */

import { EnhancedEncryption, SecurityAuditLog } from '@/lib/enhanced-security'
import { InputValidator, emailSchema, passwordSchema } from '@/lib/input-validation'
import { toast } from 'sonner'

export interface AuthToken {
  accessToken: string
  refreshToken: string
  expiresAt: number
  tokenType: 'Bearer'
  userId: string
}

export interface AuthSession {
  userId: string
  email: string
  username: string
  createdAt: number
  expiresAt: number
  lastActivity: number
}

export interface AuthConfig {
  sessionTimeout: number // milliseconds
  refreshThreshold: number // milliseconds before expiry to refresh
  maxLoginAttempts: number
  lockoutDuration: number // milliseconds
}

const DEFAULT_AUTH_CONFIG: AuthConfig = {
  sessionTimeout: 3600000, // 1 hour
  refreshThreshold: 300000, // 5 minutes
  maxLoginAttempts: 5,
  lockoutDuration: 900000 // 15 minutes
}

/**
 * Secure Authentication Manager
 * CRITICAL: Never stores tokens in localStorage
 * Uses secure in-memory storage with automatic cleanup
 */
export class SecureAuthManager {
  private static instance: SecureAuthManager
  private session: AuthSession | null = null
  private sessionCheckInterval: NodeJS.Timeout | null = null
  private config: AuthConfig
  private loginAttempts: Map<string, { count: number; lockUntil: number }> = new Map()
  private auditLogs: SecurityAuditLog[] = []

  private constructor(config: Partial<AuthConfig> = {}) {
    this.config = { ...DEFAULT_AUTH_CONFIG, ...config }
    this.startSessionMonitoring()
  }

  static getInstance(config?: Partial<AuthConfig>): SecureAuthManager {
    if (!SecureAuthManager.instance) {
      SecureAuthManager.instance = new SecureAuthManager(config)
    }
    return SecureAuthManager.instance
  }

  /**
   * Authenticate user with credentials
   * NO DEMO TOKENS - All authentication must go through real backend
   */
  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate inputs
      const emailValidation = InputValidator.validate(emailSchema, email)
      if (!emailValidation.success) {
        return { success: false, error: emailValidation.errors[0] }
      }

      const passwordValidation = InputValidator.validate(passwordSchema, password)
      if (!passwordValidation.success) {
        return { success: false, error: passwordValidation.errors[0] }
      }

      // Check for account lockout
      const lockout = this.checkLockout(email)
      if (lockout.locked) {
        this.logSecurityEvent('login_attempt_locked', 'medium', { email })
        return {
          success: false,
          error: `Account locked. Try again in ${Math.ceil(lockout.remainingTime! / 60000)} minutes`
        }
      }

      // CRITICAL: Make real API call to backend
      // DO NOT create demo tokens here
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.cyberconnect.io'

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Include httpOnly cookies
      })

      if (!response.ok) {
        // Record failed attempt
        this.recordLoginAttempt(email, false)
        this.logSecurityEvent('login_failed', 'medium', { email })

        if (response.status === 401) {
          return { success: false, error: 'Invalid email or password' }
        }
        if (response.status === 429) {
          return { success: false, error: 'Too many login attempts. Please try again later' }
        }

        throw new Error(`Login failed: ${response.statusText}`)
      }

      const data = await response.json()

      // Record successful attempt
      this.recordLoginAttempt(email, true)

      // Create session (token is in httpOnly cookie, not accessible to JS)
      this.session = {
        userId: data.userId,
        email: data.email,
        username: data.username,
        createdAt: Date.now(),
        expiresAt: Date.now() + this.config.sessionTimeout,
        lastActivity: Date.now()
      }

      this.logSecurityEvent('login_success', 'low', { userId: data.userId })
      toast.success('Logged in successfully')

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      this.logSecurityEvent('login_error', 'high', { error: (error as Error).message })
      return {
        success: false,
        error: 'Login failed. Please check your credentials and try again.'
      }
    }
  }

  /**
   * Register new user
   */
  async register(email: string, username: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate all inputs
      const emailValidation = InputValidator.validate(emailSchema, email)
      if (!emailValidation.success) {
        return { success: false, error: emailValidation.errors[0] }
      }

      const passwordValidation = InputValidator.validate(passwordSchema, password)
      if (!passwordValidation.success) {
        return { success: false, error: passwordValidation.errors[0] }
      }

      // Make real API call
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.cyberconnect.io'

      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, username, password }),
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        return { success: false, error: error.message || 'Registration failed' }
      }

      this.logSecurityEvent('user_registered', 'low', { email, username })
      toast.success('Registration successful! Please log in.')

      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Registration failed. Please try again.' }
    }
  }

  /**
   * Logout and clear session
   */
  async logout(): Promise<void> {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.cyberconnect.io'

      // Call backend to invalidate session
      await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })

      this.logSecurityEvent('logout', 'low', { userId: this.session?.userId })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear session regardless of backend response
      this.clearSession()
      toast.success('Logged out successfully')
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (!this.session) return false

    const now = Date.now()

    // Check if session expired
    if (now >= this.session.expiresAt) {
      this.clearSession()
      this.logSecurityEvent('session_expired', 'low', { userId: this.session.userId })
      return false
    }

    // Check for inactivity
    const inactivityTimeout = 1800000 // 30 minutes
    if (now - this.session.lastActivity > inactivityTimeout) {
      this.clearSession()
      this.logSecurityEvent('session_inactive', 'low', { userId: this.session.userId })
      toast.error('Session expired due to inactivity')
      return false
    }

    // Update last activity
    this.session.lastActivity = now

    return true
  }

  /**
   * Get current session
   */
  getSession(): AuthSession | null {
    if (!this.isAuthenticated()) return null
    return this.session
  }

  /**
   * Refresh authentication
   */
  async refreshAuth(): Promise<boolean> {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.cyberconnect.io'

      const response = await fetch(`${apiUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include' // Send refresh token cookie
      })

      if (!response.ok) {
        this.clearSession()
        return false
      }

      const data = await response.json()

      // Update session
      if (this.session) {
        this.session.expiresAt = Date.now() + this.config.sessionTimeout
        this.session.lastActivity = Date.now()
      }

      return true
    } catch (error) {
      console.error('Token refresh failed:', error)
      this.clearSession()
      return false
    }
  }

  /**
   * Start session monitoring
   */
  private startSessionMonitoring(): void {
    // Check session every minute
    this.sessionCheckInterval = setInterval(() => {
      if (!this.session) return

      const now = Date.now()
      const timeUntilExpiry = this.session.expiresAt - now

      // Refresh if close to expiry
      if (timeUntilExpiry < this.config.refreshThreshold && timeUntilExpiry > 0) {
        this.refreshAuth()
      }

      // Check for expiry
      if (timeUntilExpiry <= 0) {
        this.clearSession()
        toast.error('Your session has expired. Please log in again.')
      }
    }, 60000) // Check every minute
  }

  /**
   * Stop session monitoring (cleanup)
   */
  destroy(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval)
      this.sessionCheckInterval = null
    }
    this.clearSession()
  }

  /**
   * Clear session data
   */
  private clearSession(): void {
    this.session = null
  }

  /**
   * Record login attempt for brute force protection
   */
  private recordLoginAttempt(email: string, success: boolean): void {
    if (success) {
      // Clear attempts on successful login
      this.loginAttempts.delete(email)
      return
    }

    const attempts = this.loginAttempts.get(email) || { count: 0, lockUntil: 0 }
    attempts.count++

    // Lock account after max attempts
    if (attempts.count >= this.config.maxLoginAttempts) {
      attempts.lockUntil = Date.now() + this.config.lockoutDuration
      this.logSecurityEvent('account_locked', 'high', { email, attempts: attempts.count })
    }

    this.loginAttempts.set(email, attempts)
  }

  /**
   * Check if account is locked
   */
  private checkLockout(email: string): { locked: boolean; remainingTime?: number } {
    const attempts = this.loginAttempts.get(email)
    if (!attempts) return { locked: false }

    const now = Date.now()
    if (attempts.lockUntil > now) {
      return { locked: true, remainingTime: attempts.lockUntil - now }
    }

    // Lockout expired, reset
    this.loginAttempts.delete(email)
    return { locked: false }
  }

  /**
   * Log security event
   */
  private logSecurityEvent(event: string, severity: SecurityAuditLog['severity'], details: any): void {
    const log: SecurityAuditLog = {
      timestamp: Date.now(),
      event,
      severity,
      details,
      userAgent: navigator.userAgent
    }

    this.auditLogs.push(log)

    // Keep only last 1000 logs in memory
    if (this.auditLogs.length > 1000) {
      this.auditLogs.shift()
    }

    // In production, send to backend
    this.sendAuditLogToBackend(log)
  }

  /**
   * Send audit log to backend
   */
  private async sendAuditLogToBackend(log: SecurityAuditLog): Promise<void> {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.cyberconnect.io'

      await fetch(`${apiUrl}/security/audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(log),
        credentials: 'include'
      })
    } catch (error) {
      // Silently fail audit logging to avoid disrupting user experience
      console.error('Failed to send audit log:', error)
    }
  }

  /**
   * Get recent audit logs (for admin/debugging)
   */
  getAuditLogs(limit: number = 100): SecurityAuditLog[] {
    return this.auditLogs.slice(-limit)
  }
}

export default SecureAuthManager
