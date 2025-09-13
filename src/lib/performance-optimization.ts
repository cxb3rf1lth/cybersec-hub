/**
 * Performance Optimization Module
 * Provides lazy loading, caching, and performance monitoring utilities
 */

import { lazy, ComponentType, LazyExoticComponent } from 'react'

// Performance metrics interface
export interface PerformanceMetrics {
  componentLoadTime: Record<string, number>
  apiResponseTimes: Record<string, number[]>
  memoryUsage: Record<string, number>
  renderTimes: Record<string, number[]>
  bundleLoadTime: number
  initialPageLoad: number
}

// Cache interface for API responses
export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
  key: string
}

/**
 * Performance Monitor Class
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetrics = {
    componentLoadTime: {},
    apiResponseTimes: {},
    memoryUsage: {},
    renderTimes: {},
    bundleLoadTime: 0,
    initialPageLoad: 0
  }
  private observers: PerformanceObserver[] = []

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  initialize(): void {
    if (typeof window === 'undefined') return

    // Measure initial page load
    this.metrics.initialPageLoad = performance.now()

    // Observe long tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // Tasks longer than 50ms
              console.warn(`Long task detected: ${entry.duration}ms`)
            }
          }
        })
        longTaskObserver.observe({ entryTypes: ['longtask'] })
        this.observers.push(longTaskObserver)
      } catch (e) {
        console.log('Long task observer not supported')
      }

      // Observe resource loading
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name.includes('.js') || entry.name.includes('.css')) {
              const loadTime = entry.responseEnd - entry.startTime
              if (loadTime > 1000) { // Resources taking longer than 1s
                console.warn(`Slow resource load: ${entry.name} took ${loadTime}ms`)
              }
            }
          }
        })
        resourceObserver.observe({ entryTypes: ['resource'] })
        this.observers.push(resourceObserver)
      } catch (e) {
        console.log('Resource observer not supported')
      }
    }

    // Monitor memory usage periodically
    setInterval(() => {
      this.recordMemoryUsage()
    }, 30000) // Every 30 seconds
  }

  recordComponentLoad(componentName: string, loadTime: number): void {
    this.metrics.componentLoadTime[componentName] = loadTime
  }

  recordApiResponse(endpoint: string, responseTime: number): void {
    if (!this.metrics.apiResponseTimes[endpoint]) {
      this.metrics.apiResponseTimes[endpoint] = []
    }
    this.metrics.apiResponseTimes[endpoint].push(responseTime)
    
    // Keep only last 50 measurements
    if (this.metrics.apiResponseTimes[endpoint].length > 50) {
      this.metrics.apiResponseTimes[endpoint] = this.metrics.apiResponseTimes[endpoint].slice(-50)
    }
  }

  recordRenderTime(componentName: string, renderTime: number): void {
    if (!this.metrics.renderTimes[componentName]) {
      this.metrics.renderTimes[componentName] = []
    }
    this.metrics.renderTimes[componentName].push(renderTime)
    
    // Keep only last 20 measurements
    if (this.metrics.renderTimes[componentName].length > 20) {
      this.metrics.renderTimes[componentName] = this.metrics.renderTimes[componentName].slice(-20)
    }
  }

  private recordMemoryUsage(): void {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      this.metrics.memoryUsage[Date.now()] = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      }
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  getAverageApiResponseTime(endpoint: string): number {
    const times = this.metrics.apiResponseTimes[endpoint]
    if (!times || times.length === 0) return 0
    return times.reduce((sum, time) => sum + time, 0) / times.length
  }

  getAverageRenderTime(componentName: string): number {
    const times = this.metrics.renderTimes[componentName]
    if (!times || times.length === 0) return 0
    return times.reduce((sum, time) => sum + time, 0) / times.length
  }

  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

/**
 * Intelligent Cache Manager
 */
export class CacheManager {
  private static instance: CacheManager
  private cache = new Map<string, CacheEntry>()
  private maxSize = 1000
  private cleanupInterval: NodeJS.Timeout | null = null

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  initialize(): void {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 300000)
  }

  set<T>(key: string, data: T, ttlMs: number = 300000): void { // Default 5 minutes TTL
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
      key
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  getSize(): number {
    return this.cache.size
  }

  getStats(): { size: number; hitRate: number; memoryUsage: number } {
    const size = this.cache.size
    const memoryUsage = JSON.stringify(Array.from(this.cache.values())).length
    
    return {
      size,
      hitRate: 0, // Would need to track hits/misses for this
      memoryUsage
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.cache.clear()
  }
}

/**
 * Component Lazy Loading Utilities
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  componentName: string
): LazyExoticComponent<T> {
  const performanceMonitor = PerformanceMonitor.getInstance()
  
  return lazy(async () => {
    const start = performance.now()
    
    try {
      const component = await importFunc()
      const loadTime = performance.now() - start
      performanceMonitor.recordComponentLoad(componentName, loadTime)
      
      if (loadTime > 1000) {
        console.warn(`Slow component load: ${componentName} took ${loadTime}ms`)
      }
      
      return component
    } catch (error) {
      console.error(`Failed to load component ${componentName}:`, error)
      throw error
    }
  })
}

/**
 * API Response Caching Wrapper
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  apiFunction: T,
  getCacheKey: (...args: Parameters<T>) => string,
  ttlMs: number = 300000
): T {
  const cache = CacheManager.getInstance()
  const performanceMonitor = PerformanceMonitor.getInstance()

  return (async (...args: Parameters<T>) => {
    const cacheKey = getCacheKey(...args)
    
    // Try to get from cache first
    const cachedData = cache.get(cacheKey)
    if (cachedData) {
      return cachedData
    }

    // Execute API call and measure performance
    const start = performance.now()
    try {
      const result = await apiFunction(...args)
      const responseTime = performance.now() - start
      
      // Record performance metrics
      performanceMonitor.recordApiResponse(cacheKey, responseTime)
      
      // Cache the result
      cache.set(cacheKey, result, ttlMs)
      
      return result
    } catch (error) {
      const responseTime = performance.now() - start
      performanceMonitor.recordApiResponse(`${cacheKey}_error`, responseTime)
      throw error
    }
  }) as T
}

/**
 * Render Performance Wrapper
 */
export function withRenderTracking<P extends object>(
  Component: ComponentType<P>,
  componentName: string
): ComponentType<P> {
  const performanceMonitor = PerformanceMonitor.getInstance()

  return function TrackedComponent(props: P) {
    const start = performance.now()
    
    const result = Component(props)
    
    // Use setTimeout to measure after render
    setTimeout(() => {
      const renderTime = performance.now() - start
      performanceMonitor.recordRenderTime(componentName, renderTime)
    }, 0)

    return result
  }
}

/**
 * Bundle Splitting Utilities
 */
export const LazyComponents = {
  // Lazy load major components for better initial bundle size
  TUIInterface: createLazyComponent(
    () => import('@/components/tui/TUIInterface'),
    'TUIInterface'
  ),
  BugBountyDashboard: createLazyComponent(
    () => import('@/components/bug-bounty/BugBountyDashboard'),
    'BugBountyDashboard'
  ),
  VirtualLabView: createLazyComponent(
    () => import('@/components/virtual-lab/EnhancedVirtualLabView'),
    'VirtualLabView'
  ),
  RedTeamDashboard: createLazyComponent(
    () => import('@/components/red-team/RedTeamDashboard'),
    'RedTeamDashboard'
  ),
  MarketplaceView: createLazyComponent(
    () => import('@/components/marketplace/MarketplaceView'),
    'MarketplaceView'
  )
}

/**
 * Resource Loading Optimization
 */
export function preloadComponent(importFunc: () => Promise<any>): void {
  // Preload component in the background
  requestIdleCallback(() => {
    importFunc().catch(error => {
      console.warn('Failed to preload component:', error)
    })
  })
}

/**
 * Image Optimization Utilities
 */
export function createOptimizedImageLoader(src: string, options?: {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpg' | 'png'
}): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      // Could implement image compression here
      resolve(src)
    }
    
    img.onerror = reject
    img.src = src
  })
}

// Global instances
export const performanceMonitor = PerformanceMonitor.getInstance()
export const cacheManager = CacheManager.getInstance()

// Initialize performance monitoring
export function initializePerformanceOptimization(): void {
  performanceMonitor.initialize()
  cacheManager.initialize()
  
  // Preload critical components after initial load
  setTimeout(() => {
    preloadComponent(() => import('@/components/tui/TUIInterface'))
  }, 2000)
}

// Export performance hooks for React components
export function usePerformanceMetrics() {
  return {
    getMetrics: () => performanceMonitor.getMetrics(),
    getAverageApiTime: (endpoint: string) => performanceMonitor.getAverageApiResponseTime(endpoint),
    getAverageRenderTime: (component: string) => performanceMonitor.getAverageRenderTime(component),
    getCacheStats: () => cacheManager.getStats()
  }
}