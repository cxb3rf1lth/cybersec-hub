/**
 * Production Configuration
 * NO HARDCODED VALUES - All from environment variables
 * Validates configuration before app starts
 */

import { z } from 'zod'

/**
 * Environment variable schema
 */
const envSchema = z.object({
  // API Configuration
  VITE_API_BASE_URL: z.string().url('Invalid API base URL'),
  VITE_WS_BASE_URL: z.string().regex(/^wss?:\/\//, 'Invalid WebSocket URL'),

  // Environment
  MODE: z.enum(['development', 'production', 'test']).default('development'),

  // Optional Services
  VITE_SHODAN_API_KEY: z.string().optional(),
  VITE_VIRUSTOTAL_API_KEY: z.string().optional(),
  VITE_GITHUB_CLIENT_ID: z.string().optional(),

  // Feature Flags
  VITE_ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
  VITE_ENABLE_DEBUG: z.string().transform(val => val === 'true').default('false'),
  VITE_MOCK_APIS: z.string().transform(val => val === 'true').default('false'),

  // Security
  VITE_SESSION_TIMEOUT: z.string().transform(Number).default('3600000'), // 1 hour
  VITE_MAX_LOGIN_ATTEMPTS: z.string().transform(Number).default('5'),

  // Rate Limiting
  VITE_RATE_LIMIT_PER_MINUTE: z.string().transform(Number).default('60'),

  // Logging
  VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info')
})

export type EnvConfig = z.infer<typeof envSchema>

/**
 * Production Configuration Class
 */
export class ProductionConfig {
  private static instance: ProductionConfig
  private config: EnvConfig | null = null
  private validationErrors: string[] = []

  static getInstance(): ProductionConfig {
    if (!ProductionConfig.instance) {
      ProductionConfig.instance = new ProductionConfig()
    }
    return ProductionConfig.instance
  }

  /**
   * Initialize and validate configuration
   */
  initialize(): { valid: boolean; errors?: string[] } {
    try {
      // Get environment variables
      const env = {
        VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
        VITE_WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL,
        MODE: import.meta.env.MODE,
        VITE_SHODAN_API_KEY: import.meta.env.VITE_SHODAN_API_KEY,
        VITE_VIRUSTOTAL_API_KEY: import.meta.env.VITE_VIRUSTOTAL_API_KEY,
        VITE_GITHUB_CLIENT_ID: import.meta.env.VITE_GITHUB_CLIENT_ID,
        VITE_ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS,
        VITE_ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG,
        VITE_MOCK_APIS: import.meta.env.VITE_MOCK_APIS,
        VITE_SESSION_TIMEOUT: import.meta.env.VITE_SESSION_TIMEOUT,
        VITE_MAX_LOGIN_ATTEMPTS: import.meta.env.VITE_MAX_LOGIN_ATTEMPTS,
        VITE_RATE_LIMIT_PER_MINUTE: import.meta.env.VITE_RATE_LIMIT_PER_MINUTE,
        VITE_LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL
      }

      // Validate configuration
      const result = envSchema.safeParse(env)

      if (!result.success) {
        this.validationErrors = result.error.errors.map(
          err => `${err.path.join('.')}: ${err.message}`
        )

        // In production, fail hard on invalid config
        if (import.meta.env.MODE === 'production') {
          console.error('CRITICAL: Invalid production configuration!')
          console.error(this.validationErrors)
          throw new Error('Invalid configuration. Cannot start application.')
        }

        // In development, warn but continue
        console.warn('Configuration validation failed:', this.validationErrors)
        return { valid: false, errors: this.validationErrors }
      }

      this.config = result.data

      // Security checks for production
      if (this.isProduction()) {
        this.performSecurityChecks()
      }

      return { valid: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.validationErrors = [errorMessage]
      return { valid: false, errors: this.validationErrors }
    }
  }

  /**
   * Perform additional security checks for production
   */
  private performSecurityChecks(): void {
    const issues: string[] = []

    // Check for development URLs in production
    if (this.config!.VITE_API_BASE_URL.includes('localhost') ||
        this.config!.VITE_API_BASE_URL.includes('127.0.0.1')) {
      issues.push('API URL points to localhost in production')
    }

    // Check for HTTP in production (should be HTTPS)
    if (this.config!.VITE_API_BASE_URL.startsWith('http://')) {
      issues.push('API URL uses HTTP instead of HTTPS in production')
    }

    if (this.config!.VITE_WS_BASE_URL.startsWith('ws://')) {
      issues.push('WebSocket URL uses WS instead of WSS in production')
    }

    // Check if mock APIs are enabled in production
    if (this.config!.VITE_MOCK_APIS) {
      issues.push('CRITICAL: Mock APIs are enabled in production!')
    }

    // Check if debug is enabled in production
    if (this.config!.VITE_ENABLE_DEBUG) {
      issues.push('WARNING: Debug mode is enabled in production')
    }

    if (issues.length > 0) {
      console.error('SECURITY ISSUES DETECTED IN PRODUCTION:')
      issues.forEach(issue => console.error(`  - ${issue}`))

      // Throw error to prevent deployment with security issues
      throw new Error('Security checks failed. Fix issues before deploying.')
    }
  }

  /**
   * Get configuration value
   */
  get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    if (!this.config) {
      throw new Error('Configuration not initialized. Call initialize() first.')
    }
    return this.config[key]
  }

  /**
   * Check if running in production
   */
  isProduction(): boolean {
    return this.config?.MODE === 'production'
  }

  /**
   * Check if running in development
   */
  isDevelopment(): boolean {
    return this.config?.MODE === 'development'
  }

  /**
   * Check if running in test
   */
  isTest(): boolean {
    return this.config?.MODE === 'test'
  }

  /**
   * Check if mock APIs should be used
   */
  useMockAPIs(): boolean {
    return this.config?.VITE_MOCK_APIS === true
  }

  /**
   * Get API base URL
   */
  getAPIBaseURL(): string {
    return this.get('VITE_API_BASE_URL')
  }

  /**
   * Get WebSocket base URL
   */
  getWSBaseURL(): string {
    return this.get('VITE_WS_BASE_URL')
  }

  /**
   * Check if analytics is enabled
   */
  isAnalyticsEnabled(): boolean {
    return this.config?.VITE_ENABLE_ANALYTICS === true
  }

  /**
   * Check if debug mode is enabled
   */
  isDebugEnabled(): boolean {
    return this.config?.VITE_ENABLE_DEBUG === true
  }

  /**
   * Get log level
   */
  getLogLevel(): 'debug' | 'info' | 'warn' | 'error' {
    return this.get('VITE_LOG_LEVEL')
  }

  /**
   * Check if a service API key is configured
   */
  hasServiceKey(service: 'shodan' | 'virustotal' | 'github'): boolean {
    const keyMap = {
      shodan: 'VITE_SHODAN_API_KEY',
      virustotal: 'VITE_VIRUSTOTAL_API_KEY',
      github: 'VITE_GITHUB_CLIENT_ID'
    }

    const key = keyMap[service]
    return Boolean(this.config?.[key as keyof EnvConfig])
  }

  /**
   * Get service API key (use carefully!)
   */
  getServiceKey(service: 'shodan' | 'virustotal' | 'github'): string | undefined {
    const keyMap = {
      shodan: 'VITE_SHODAN_API_KEY',
      virustotal: 'VITE_VIRUSTOTAL_API_KEY',
      github: 'VITE_GITHUB_CLIENT_ID'
    }

    const key = keyMap[service]
    return this.config?.[key as keyof EnvConfig] as string | undefined
  }

  /**
   * Get all configuration (for debugging only)
   */
  getAll(): EnvConfig | null {
    return this.config
  }

  /**
   * Get validation errors
   */
  getValidationErrors(): string[] {
    return this.validationErrors
  }

  /**
   * Print configuration summary (safe - no sensitive data)
   */
  printSummary(): void {
    if (!this.config) {
      console.log('Configuration not initialized')
      return
    }

    console.log('=== Configuration Summary ===')
    console.log(`Environment: ${this.config.MODE}`)
    console.log(`API URL: ${this.config.VITE_API_BASE_URL}`)
    console.log(`WebSocket URL: ${this.config.VITE_WS_BASE_URL}`)
    console.log(`Mock APIs: ${this.config.VITE_MOCK_APIS ? 'Enabled' : 'Disabled'}`)
    console.log(`Analytics: ${this.config.VITE_ENABLE_ANALYTICS ? 'Enabled' : 'Disabled'}`)
    console.log(`Debug: ${this.config.VITE_ENABLE_DEBUG ? 'Enabled' : 'Disabled'}`)
    console.log(`Log Level: ${this.config.VITE_LOG_LEVEL}`)
    console.log(`Session Timeout: ${this.config.VITE_SESSION_TIMEOUT}ms`)
    console.log(`Rate Limit: ${this.config.VITE_RATE_LIMIT_PER_MINUTE} req/min`)
    console.log('Services configured:')
    console.log(`  - Shodan: ${this.hasServiceKey('shodan') ? 'Yes' : 'No'}`)
    console.log(`  - VirusTotal: ${this.hasServiceKey('virustotal') ? 'Yes' : 'No'}`)
    console.log(`  - GitHub: ${this.hasServiceKey('github') ? 'Yes' : 'No'}`)
    console.log('============================')
  }
}

// Create singleton instance
const productionConfig = ProductionConfig.getInstance()

// Initialize on module load
const initResult = productionConfig.initialize()

if (!initResult.valid) {
  console.error('Configuration initialization failed:', initResult.errors)
}

export default productionConfig
