/**
 * Production-Ready Error Boundary
 * Catches React errors and provides graceful error handling
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorCount: number
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error('Error Boundary caught an error:', error, errorInfo)

    // Update state with error details
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }))

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Send error to backend for logging (production)
    if (import.meta.env.MODE === 'production') {
      this.reportErrorToBackend(error, errorInfo)
    }

    // Log security event if error seems security-related
    if (this.isSecurityRelated(error)) {
      this.logSecurityEvent(error, errorInfo)
    }
  }

  /**
   * Check if error is security-related
   */
  private isSecurityRelated(error: Error): boolean {
    const securityKeywords = [
      'unauthorized',
      'forbidden',
      'authentication',
      'csrf',
      'xss',
      'injection',
      'token',
      'permission'
    ]

    const errorMessage = error.message.toLowerCase()
    return securityKeywords.some(keyword => errorMessage.includes(keyword))
  }

  /**
   * Log security-related errors
   */
  private async logSecurityEvent(error: Error, errorInfo: ErrorInfo) {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL

      await fetch(`${apiUrl}/security/audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          timestamp: Date.now(),
          event: 'client_error_security',
          severity: 'high',
          details: {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack
          },
          userAgent: navigator.userAgent
        }),
        credentials: 'include'
      })
    } catch (err) {
      console.error('Failed to log security event:', err)
    }
  }

  /**
   * Report error to backend
   */
  private async reportErrorToBackend(error: Error, errorInfo: ErrorInfo) {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL

      await fetch(`${apiUrl}/errors/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString()
        }),
        credentials: 'include'
      })
    } catch (err) {
      // Silently fail - don't want error reporting to cause more errors
      console.error('Failed to report error to backend:', err)
    }
  }

  /**
   * Reset error state
   */
  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  /**
   * Reload page
   */
  private handleReload = () => {
    window.location.reload()
  }

  /**
   * Go to home page
   */
  private handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error, errorInfo, errorCount } = this.state
      const isDevelopment = import.meta.env.MODE === 'development'

      // Too many errors - suggest reload
      if (errorCount > 3) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-red-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-red-100 dark:bg-red-900 p-4 rounded-full">
                  <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">
                Multiple Errors Detected
              </h1>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                The application has encountered {errorCount} errors. Please reload the page to continue.
              </p>
              <button
                onClick={this.handleReload}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Reload Application
              </button>
            </div>
          </div>
        )
      }

      // Standard error display
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
            {/* Error Icon */}
            <div className="flex items-center justify-center mb-6">
              <div className="bg-red-100 dark:bg-red-900 p-4 rounded-full">
                <Bug className="w-12 h-12 text-red-600 dark:text-red-400" />
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2">
              Something Went Wrong
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              We're sorry, but an unexpected error occurred. Our team has been notified.
            </p>

            {/* Error Details (Development Only) */}
            {isDevelopment && error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h2 className="font-semibold text-red-900 dark:text-red-400 mb-2">
                  Error Details (Development Only)
                </h2>
                <p className="text-sm text-red-800 dark:text-red-300 font-mono mb-2">
                  {error.message}
                </p>
                {error.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200">
                      View Stack Trace
                    </summary>
                    <pre className="mt-2 p-2 bg-white dark:bg-gray-900 rounded text-xs overflow-auto max-h-48 text-gray-700 dark:text-gray-300">
                      {error.stack}
                    </pre>
                  </details>
                )}
                {errorInfo && errorInfo.componentStack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200">
                      View Component Stack
                    </summary>
                    <pre className="mt-2 p-2 bg-white dark:bg-gray-900 rounded text-xs overflow-auto max-h-48 text-gray-700 dark:text-gray-300">
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Home className="w-5 h-5" />
                Go Home
              </button>
            </div>

            {/* Additional Help */}
            <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>If this problem persists, please contact support.</p>
              {isDevelopment && (
                <p className="mt-2">
                  Error Count: {errorCount}
                </p>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook to use error boundary programmatically
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return setError
}

export default ErrorBoundary
