/**
 * Production Monitoring & Logging
 * Comprehensive application monitoring and error tracking
 */

import productionConfig from '@/lib/production-config'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  timestamp: number
  level: LogLevel
  message: string
  context?: Record<string, any>
  error?: Error
  userId?: string
  sessionId?: string
}

export interface PerformanceMetric {
  name: string
  value: number
  unit: 'ms' | 'bytes' | 'count'
  timestamp: number
  tags?: Record<string, string>
}

export interface HealthCheck {
  service: string
  status: 'healthy' | 'degraded' | 'down'
  latency?: number
  error?: string
  timestamp: number
}

/**
 * Production Logger
 * Structured logging with levels and context
 */
export class ProductionLogger {
  private static instance: ProductionLogger
  private logs: LogEntry[] = []
  private maxLogsInMemory = 1000
  private sessionId: string

  private constructor() {
    this.sessionId = this.generateSessionId()
  }

  static getInstance(): ProductionLogger {
    if (!ProductionLogger.instance) {
      ProductionLogger.instance = new ProductionLogger()
    }
    return ProductionLogger.instance
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context)
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context)
  }

  /**
   * Log warning
   */
  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context)
  }

  /**
   * Log error
   */
  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log('error', message, { ...context, error })
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    const configuredLevel = productionConfig.getLogLevel()

    // Check if this log level should be logged
    if (!this.shouldLog(level, configuredLevel)) {
      return
    }

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      context,
      sessionId: this.sessionId
    }

    // Add to in-memory logs
    this.logs.push(entry)

    // Trim logs if exceeding max
    if (this.logs.length > this.maxLogsInMemory) {
      this.logs.shift()
    }

    // Console output
    this.logToConsole(entry)

    // Send to backend in production
    if (productionConfig.isProduction() && (level === 'error' || level === 'warn')) {
      this.sendToBackend(entry)
    }
  }

  /**
   * Check if log level should be logged
   */
  private shouldLog(level: LogLevel, configuredLevel: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    const levelIndex = levels.indexOf(level)
    const configuredIndex = levels.indexOf(configuredLevel)
    return levelIndex >= configuredIndex
  }

  /**
   * Log to console with formatting
   */
  private logToConsole(entry: LogEntry) {
    const timestamp = new Date(entry.timestamp).toISOString()
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}]`

    switch (entry.level) {
      case 'debug':
        console.debug(prefix, entry.message, entry.context || '')
        break
      case 'info':
        console.info(prefix, entry.message, entry.context || '')
        break
      case 'warn':
        console.warn(prefix, entry.message, entry.context || '')
        break
      case 'error':
        console.error(prefix, entry.message, entry.context || '')
        break
    }
  }

  /**
   * Send log to backend
   */
  private async sendToBackend(entry: LogEntry) {
    try {
      const apiUrl = productionConfig.getAPIBaseURL()

      await fetch(`${apiUrl}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry),
        credentials: 'include'
      })
    } catch (error) {
      // Silently fail - don't want logging to break the app
      console.error('Failed to send log to backend:', error)
    }
  }

  /**
   * Get recent logs
   */
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count)
  }

  /**
   * Clear logs
   */
  clearLogs() {
    this.logs = []
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level)
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}

/**
 * Performance Monitor
 * Track performance metrics and send to analytics
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetric[] = []
  private observers: PerformanceObserver[] = []

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  /**
   * Initialize performance monitoring
   */
  initialize() {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver(entries => {
          entries.getEntries().forEach(entry => {
            this.recordMetric('long_task', entry.duration, 'ms', {
              name: entry.name,
              type: entry.entryType
            })
          })
        })

        longTaskObserver.observe({ entryTypes: ['longtask'] })
        this.observers.push(longTaskObserver)
      } catch (error) {
        console.warn('Long task observer not supported')
      }

      // Monitor resource loading
      try {
        const resourceObserver = new PerformanceObserver(entries => {
          entries.getEntries().forEach(entry => {
            const resourceEntry = entry as PerformanceResourceTiming
            this.recordMetric('resource_load', resourceEntry.duration, 'ms', {
              name: resourceEntry.name,
              type: resourceEntry.initiatorType
            })
          })
        })

        resourceObserver.observe({ entryTypes: ['resource'] })
        this.observers.push(resourceObserver)
      } catch (error) {
        console.warn('Resource observer not supported')
      }
    }

    // Monitor page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.recordMetric('page_hidden', 1, 'count')
      } else {
        this.recordMetric('page_visible', 1, 'count')
      }
    })
  }

  /**
   * Record a custom metric
   */
  recordMetric(
    name: string,
    value: number,
    unit: 'ms' | 'bytes' | 'count',
    tags?: Record<string, string>
  ) {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags
    }

    this.metrics.push(metric)

    // Send to analytics if enabled
    if (productionConfig.isAnalyticsEnabled()) {
      this.sendMetricToAnalytics(metric)
    }
  }

  /**
   * Measure function execution time
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    try {
      const result = await fn()
      const duration = performance.now() - start
      this.recordMetric(name, duration, 'ms')
      return result
    } catch (error) {
      const duration = performance.now() - start
      this.recordMetric(`${name}_error`, duration, 'ms')
      throw error
    }
  }

  /**
   * Send metric to analytics backend
   */
  private async sendMetricToAnalytics(metric: PerformanceMetric) {
    try {
      const apiUrl = productionConfig.getAPIBaseURL()

      await fetch(`${apiUrl}/analytics/metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metric),
        credentials: 'include'
      })
    } catch (error) {
      // Silently fail
      console.error('Failed to send metric to analytics:', error)
    }
  }

  /**
   * Get core web vitals
   */
  getCoreWebVitals(): { LCP?: number; FID?: number; CLS?: number } {
    const vitals: { LCP?: number; FID?: number; CLS?: number } = {}

    // Get paint timing (LCP approximation)
    const paintEntries = performance.getEntriesByType('paint')
    const lcp = paintEntries.find(entry => entry.name === 'largest-contentful-paint')
    if (lcp) {
      vitals.LCP = lcp.startTime
    }

    return vitals
  }

  /**
   * Get recent metrics
   */
  getRecentMetrics(count: number = 100): PerformanceMetric[] {
    return this.metrics.slice(-count)
  }

  /**
   * Cleanup observers
   */
  destroy() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

/**
 * Health Monitor
 * Monitor application and service health
 */
export class HealthMonitor {
  private static instance: HealthMonitor
  private healthChecks: HealthCheck[] = []
  private checkInterval: NodeJS.Timeout | null = null

  static getInstance(): HealthMonitor {
    if (!HealthMonitor.instance) {
      HealthMonitor.instance = new HealthMonitor()
    }
    return HealthMonitor.instance
  }

  /**
   * Start health monitoring
   */
  startMonitoring(intervalMs: number = 60000) {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }

    // Run initial check
    this.runHealthChecks()

    // Schedule periodic checks
    this.checkInterval = setInterval(() => {
      this.runHealthChecks()
    }, intervalMs)
  }

  /**
   * Stop health monitoring
   */
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  /**
   * Run all health checks
   */
  private async runHealthChecks() {
    const checks = [
      this.checkAPIHealth(),
      this.checkWebSocketHealth(),
      this.checkBrowserStorage()
    ]

    const results = await Promise.allSettled(checks)

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        this.healthChecks.push(result.value)
      }
    })

    // Keep only last 100 health checks
    if (this.healthChecks.length > 100) {
      this.healthChecks = this.healthChecks.slice(-100)
    }
  }

  /**
   * Check API health
   */
  private async checkAPIHealth(): Promise<HealthCheck> {
    try {
      const start = performance.now()
      const apiUrl = productionConfig.getAPIBaseURL()

      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })

      const latency = performance.now() - start

      if (response.ok) {
        return {
          service: 'api',
          status: latency < 1000 ? 'healthy' : 'degraded',
          latency,
          timestamp: Date.now()
        }
      } else {
        return {
          service: 'api',
          status: 'down',
          error: `HTTP ${response.status}`,
          timestamp: Date.now()
        }
      }
    } catch (error) {
      return {
        service: 'api',
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      }
    }
  }

  /**
   * Check WebSocket health
   */
  private async checkWebSocketHealth(): Promise<HealthCheck> {
    try {
      const wsUrl = productionConfig.getWSBaseURL()

      return new Promise((resolve) => {
        const start = performance.now()
        const ws = new WebSocket(wsUrl)

        const timeout = setTimeout(() => {
          ws.close()
          resolve({
            service: 'websocket',
            status: 'down',
            error: 'Connection timeout',
            timestamp: Date.now()
          })
        }, 5000)

        ws.onopen = () => {
          clearTimeout(timeout)
          const latency = performance.now() - start
          ws.close()
          resolve({
            service: 'websocket',
            status: 'healthy',
            latency,
            timestamp: Date.now()
          })
        }

        ws.onerror = () => {
          clearTimeout(timeout)
          ws.close()
          resolve({
            service: 'websocket',
            status: 'down',
            error: 'Connection failed',
            timestamp: Date.now()
          })
        }
      })
    } catch (error) {
      return {
        service: 'websocket',
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      }
    }
  }

  /**
   * Check browser storage availability
   */
  private async checkBrowserStorage(): Promise<HealthCheck> {
    try {
      // Test localStorage
      const testKey = '__health_check__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)

      return {
        service: 'storage',
        status: 'healthy',
        timestamp: Date.now()
      }
    } catch (error) {
      return {
        service: 'storage',
        status: 'down',
        error: 'LocalStorage unavailable',
        timestamp: Date.now()
      }
    }
  }

  /**
   * Get latest health status
   */
  getHealthStatus(): Record<string, HealthCheck> {
    const latest: Record<string, HealthCheck> = {}

    this.healthChecks.forEach(check => {
      if (!latest[check.service] || latest[check.service].timestamp < check.timestamp) {
        latest[check.service] = check
      }
    })

    return latest
  }

  /**
   * Get all health checks
   */
  getAllHealthChecks(): HealthCheck[] {
    return this.healthChecks
  }

  /**
   * Check if system is healthy
   */
  isSystemHealthy(): boolean {
    const status = this.getHealthStatus()
    return Object.values(status).every(check => check.status === 'healthy')
  }
}

// Export singleton instances
export const logger = ProductionLogger.getInstance()
export const performanceMonitor = PerformanceMonitor.getInstance()
export const healthMonitor = HealthMonitor.getInstance()

// Initialize monitoring in production
if (productionConfig.isProduction()) {
  performanceMonitor.initialize()
  healthMonitor.startMonitoring()
}

export default {
  logger,
  performanceMonitor,
  healthMonitor
}
