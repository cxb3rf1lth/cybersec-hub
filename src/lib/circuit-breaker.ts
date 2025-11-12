/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures and provides graceful degradation
 */

export interface CircuitBreakerConfig {
  failureThreshold: number // Number of failures before opening circuit
  successThreshold: number // Number of successes needed to close circuit
  timeout: number // Time in ms to wait before attempting again
  resetTimeout: number // Time in ms before resetting failure count
}

export enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN', // Failing, reject requests
  HALF_OPEN = 'HALF_OPEN' // Testing if service recovered
}

export interface CircuitStats {
  state: CircuitState
  failures: number
  successes: number
  lastFailureTime?: number
  lastSuccessTime?: number
  nextAttemptTime?: number
  totalRequests: number
  totalFailures: number
  totalSuccesses: number
}

/**
 * Circuit Breaker for API calls
 * Automatically opens on repeated failures to prevent cascading failures
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED
  private failures: number = 0
  private successes: number = 0
  private lastFailureTime?: number
  private lastSuccessTime?: number
  private nextAttemptTime?: number
  private totalRequests: number = 0
  private totalFailures: number = 0
  private totalSuccesses: number = 0
  private config: CircuitBreakerConfig

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: config.failureThreshold || 5,
      successThreshold: config.successThreshold || 2,
      timeout: config.timeout || 60000, // 1 minute
      resetTimeout: config.resetTimeout || 300000 // 5 minutes
    }
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalRequests++

    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      if (this.nextAttemptTime && Date.now() < this.nextAttemptTime) {
        throw new Error(
          `Circuit breaker is OPEN. Service unavailable. Retry after ${Math.ceil(
            (this.nextAttemptTime - Date.now()) / 1000
          )} seconds`
        )
      }

      // Move to half-open to test if service recovered
      this.state = CircuitState.HALF_OPEN
      this.successes = 0
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  /**
   * Handle successful request
   */
  private onSuccess(): void {
    this.lastSuccessTime = Date.now()
    this.totalSuccesses++

    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++

      if (this.successes >= this.config.successThreshold) {
        this.close()
      }
    } else {
      // Reset failure count on success in CLOSED state
      this.failures = 0
    }
  }

  /**
   * Handle failed request
   */
  private onFailure(): void {
    this.lastFailureTime = Date.now()
    this.failures++
    this.totalFailures++

    if (this.state === CircuitState.HALF_OPEN) {
      // Failed during half-open, go back to open
      this.open()
    } else if (this.failures >= this.config.failureThreshold) {
      this.open()
    }
  }

  /**
   * Open the circuit (stop allowing requests)
   */
  private open(): void {
    this.state = CircuitState.OPEN
    this.nextAttemptTime = Date.now() + this.config.timeout

    console.warn(`Circuit breaker OPENED. Will attempt again at ${new Date(this.nextAttemptTime).toISOString()}`)
  }

  /**
   * Close the circuit (allow requests)
   */
  private close(): void {
    this.state = CircuitState.CLOSED
    this.failures = 0
    this.successes = 0
    this.nextAttemptTime = undefined

    console.info('Circuit breaker CLOSED. Service restored.')
  }

  /**
   * Get current circuit stats
   */
  getStats(): CircuitStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      nextAttemptTime: this.nextAttemptTime,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses
    }
  }

  /**
   * Get success rate (0-1)
   */
  getSuccessRate(): number {
    if (this.totalRequests === 0) return 1
    return this.totalSuccesses / this.totalRequests
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.state = CircuitState.CLOSED
    this.failures = 0
    this.successes = 0
    this.lastFailureTime = undefined
    this.lastSuccessTime = undefined
    this.nextAttemptTime = undefined
  }

  /**
   * Manually force circuit open (for maintenance)
   */
  forceOpen(): void {
    this.state = CircuitState.OPEN
    this.nextAttemptTime = Date.now() + this.config.timeout
  }

  /**
   * Manually force circuit closed
   */
  forceClose(): void {
    this.close()
  }
}

/**
 * Circuit Breaker Manager
 * Manages multiple circuit breakers for different services
 */
export class CircuitBreakerManager {
  private static instance: CircuitBreakerManager
  private breakers: Map<string, CircuitBreaker> = new Map()

  static getInstance(): CircuitBreakerManager {
    if (!CircuitBreakerManager.instance) {
      CircuitBreakerManager.instance = new CircuitBreakerManager()
    }
    return CircuitBreakerManager.instance
  }

  /**
   * Get or create circuit breaker for a service
   */
  getBreaker(serviceName: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.breakers.has(serviceName)) {
      this.breakers.set(serviceName, new CircuitBreaker(config))
    }
    return this.breakers.get(serviceName)!
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(serviceName: string, fn: () => Promise<T>, config?: Partial<CircuitBreakerConfig>): Promise<T> {
    const breaker = this.getBreaker(serviceName, config)
    return breaker.execute(fn)
  }

  /**
   * Get stats for all circuit breakers
   */
  getAllStats(): Record<string, CircuitStats> {
    const stats: Record<string, CircuitStats> = {}
    this.breakers.forEach((breaker, name) => {
      stats[name] = breaker.getStats()
    })
    return stats
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    this.breakers.forEach(breaker => breaker.reset())
  }

  /**
   * Get overall health status
   */
  getHealthStatus(): { healthy: number; degraded: number; down: number } {
    let healthy = 0
    let degraded = 0
    let down = 0

    this.breakers.forEach(breaker => {
      const stats = breaker.getStats()
      if (stats.state === CircuitState.CLOSED) {
        healthy++
      } else if (stats.state === CircuitState.HALF_OPEN) {
        degraded++
      } else {
        down++
      }
    })

    return { healthy, degraded, down }
  }
}

/**
 * Retry with exponential backoff
 */
export class RetryStrategy {
  private config: {
    maxRetries: number
    initialDelay: number
    maxDelay: number
    backoffMultiplier: number
  }

  constructor(config?: Partial<RetryStrategy['config']>) {
    this.config = {
      maxRetries: config?.maxRetries || 3,
      initialDelay: config?.initialDelay || 1000,
      maxDelay: config?.maxDelay || 30000,
      backoffMultiplier: config?.backoffMultiplier || 2
    }
  }

  /**
   * Execute with retry and exponential backoff
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error

        // Don't retry on last attempt
        if (attempt === this.config.maxRetries) {
          break
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          this.config.initialDelay * Math.pow(this.config.backoffMultiplier, attempt),
          this.config.maxDelay
        )

        console.warn(`Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`)

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError || new Error('All retry attempts failed')
  }
}

/**
 * Combined Circuit Breaker + Retry Strategy
 */
export class ResilientAPIClient {
  private circuitBreaker: CircuitBreaker
  private retryStrategy: RetryStrategy

  constructor(
    circuitConfig?: Partial<CircuitBreakerConfig>,
    retryConfig?: Partial<RetryStrategy['config']>
  ) {
    this.circuitBreaker = new CircuitBreaker(circuitConfig)
    this.retryStrategy = new RetryStrategy(retryConfig)
  }

  /**
   * Execute API call with circuit breaker and retry
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(fn)
    })
  }

  getStats(): CircuitStats {
    return this.circuitBreaker.getStats()
  }

  reset(): void {
    this.circuitBreaker.reset()
  }
}

export default CircuitBreakerManager
