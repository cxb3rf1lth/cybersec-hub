/**
 * Production Error Monitoring and Boundary
 * Comprehensive error handling, logging, and recovery for production deployment
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { CONFIG, MONITORING_CONFIG } from '@/lib/environment'
import { toast } from 'sonner'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  errorId?: string
}

export class ProductionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: Date.now().toString(36)
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Production Error Boundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
      errorId: Date.now().toString(36)
    })

    // Log error to monitoring service
    this.logError(error, errorInfo)

    // Show user-friendly error message
    if (CONFIG.IS_PRODUCTION) {
      toast.error('Something went wrong. Our team has been notified.', {
        duration: 5000,
        action: {
          label: 'Report Issue',
          onClick: () => this.reportIssue(error, errorInfo)
        }
      })
    }
  }

  private async logError(error: Error, errorInfo: ErrorInfo) {
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: localStorage.getItem('currentUserId'),
        sessionId: sessionStorage.getItem('sessionId'),
        buildVersion: import.meta.env.VITE_BUILD_VERSION || 'unknown',
        environment: CONFIG.NODE_ENV
      }

      // Send to monitoring service (Sentry, LogRocket, etc.)
      if (MONITORING_CONFIG.SENTRY_DSN && CONFIG.IS_PRODUCTION) {
        // In a real production app, this would use Sentry SDK
        await fetch('/api/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorData)
        })
      }

      // Log to console in development
      if (CONFIG.IS_DEVELOPMENT) {
        console.group('🔥 Error Details')
        console.error('Error:', error)
        console.error('Error Info:', errorInfo)
        console.error('Error Data:', errorData)
        console.groupEnd()
      }
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError)
    }
  }

  private reportIssue(error: Error, errorInfo: ErrorInfo) {
    const issueData = {
      title: `Bug Report: ${error.message}`,
      description: `
**Error Message:** ${error.message}

**Stack Trace:**
\`\`\`
${error.stack}
\`\`\`

**Component Stack:**
\`\`\`
${errorInfo.componentStack}
\`\`\`

**Environment:**
- URL: ${window.location.href}
- User Agent: ${navigator.userAgent}
- Timestamp: ${new Date().toISOString()}
- Build Version: ${import.meta.env.VITE_BUILD_VERSION || 'unknown'}
      `.trim()
    }

    // Open GitHub issues or support form
    const githubUrl = `https://github.com/cyberconnect/issues/new?title=${encodeURIComponent(issueData.title)}&body=${encodeURIComponent(issueData.description)}`
    window.open(githubUrl, '_blank')
  }

  private retry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="space-y-4">
              <div className="text-6xl">🔧</div>
              <h1 className="text-2xl font-bold text-foreground">
                Something went wrong
              </h1>
              <p className="text-muted-foreground">
                We've encountered an unexpected error. Our team has been automatically notified and is working on a fix.
              </p>
              
              {CONFIG.IS_DEVELOPMENT && this.state.error && (
                <details className="text-left bg-card p-4 rounded-lg border">
                  <summary className="cursor-pointer font-medium text-destructive">
                    Error Details (Development Only)
                  </summary>
                  <pre className="text-xs mt-2 overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.retry}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Reload Page
              </button>
              
              <button
                onClick={() => this.reportIssue(this.state.error!, this.state.errorInfo!)}
                className="px-6 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Report Issue
              </button>
            </div>

            <div className="text-xs text-muted-foreground">
              Error ID: {this.state.errorId}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Production Performance Monitor
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()
  private observers: PerformanceObserver[] = []

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  initialize() {
    if (!CONFIG.IS_PRODUCTION || !MONITORING_CONFIG.PERFORMANCE_SAMPLE_RATE) {
      return
    }

    // Monitor Core Web Vitals
    this.observeCoreWebVitals()
    
    // Monitor resource loading
    this.observeResourcePerformance()
    
    // Monitor long tasks
    this.observeLongTasks()

    console.log('🔍 Performance monitoring initialized')
  }

  private observeCoreWebVitals() {
    try {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        this.recordMetric('LCP', lastEntry.startTime)
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.push(lcpObserver)

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          this.recordMetric('FID', entry.processingStart - entry.startTime)
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })
      this.observers.push(fidObserver)

      // Cumulative Layout Shift (CLS)
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        this.recordMetric('CLS', clsValue)
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
      this.observers.push(clsObserver)
    } catch (error) {
      console.warn('Core Web Vitals monitoring not supported:', error)
    }
  }

  private observeResourcePerformance() {
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.duration > 1000) { // Resources taking more than 1s
            this.recordMetric('SLOW_RESOURCE', entry.duration)
            console.warn('Slow resource detected:', entry.name, entry.duration)
          }
        })
      })
      resourceObserver.observe({ entryTypes: ['resource'] })
      this.observers.push(resourceObserver)
    } catch (error) {
      console.warn('Resource performance monitoring not supported:', error)
    }
  }

  private observeLongTasks() {
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          this.recordMetric('LONG_TASK', entry.duration)
          console.warn('Long task detected:', entry.duration)
        })
      })
      longTaskObserver.observe({ entryTypes: ['longtask'] })
      this.observers.push(longTaskObserver)
    } catch (error) {
      console.warn('Long task monitoring not supported:', error)
    }
  }

  private recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    
    const values = this.metrics.get(name)!
    values.push(value)
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift()
    }

    // Send to analytics if sampling allows
    if (Math.random() < MONITORING_CONFIG.PERFORMANCE_SAMPLE_RATE) {
      this.sendMetric(name, value)
    }
  }

  private async sendMetric(name: string, value: number) {
    try {
      if (CONFIG.IS_PRODUCTION) {
        await fetch('/api/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            metric: name,
            value,
            timestamp: Date.now(),
            url: window.location.href,
            sessionId: sessionStorage.getItem('sessionId')
          })
        })
      }
    } catch (error) {
      // Silently fail - don't impact user experience
    }
  }

  getMetrics(): Record<string, number[]> {
    return Object.fromEntries(this.metrics)
  }

  getAverageMetric(name: string): number {
    const values = this.metrics.get(name) || []
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.metrics.clear()
  }
}

// Initialize performance monitoring
export const performanceMonitor = PerformanceMonitor.getInstance()

// Global error handler for unhandled promises
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    
    if (CONFIG.IS_PRODUCTION) {
      // Log to monitoring service
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'unhandled_rejection',
          reason: event.reason?.toString(),
          timestamp: new Date().toISOString(),
          url: window.location.href
        })
      }).catch(() => {
        // Silently fail
      })
    }
  })
}

// React Hook for monitoring component performance
export function usePerformanceMonitor(componentName: string) {
  React.useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const duration = performance.now() - startTime
      performanceMonitor['recordMetric'](`COMPONENT_${componentName.toUpperCase()}`, duration)
    }
  }, [componentName])
}

export default ProductionErrorBoundary