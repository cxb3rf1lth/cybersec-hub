/**
 * Stability Checker and Runtime Validator
 * Comprehensive system for detecting and preventing common React/TypeScript bugs
 */

import React from 'react';
import { CONFIG } from '@/lib/environment';
import { toast } from 'sonner';

export interface StabilityIssue {
  type: 'memory-leak' | 'infinite-loop' | 'state-mutation' | 'async-race' | 'dependency-cycle' | 'performance'
  severity: 'low' | 'medium' | 'high' | 'critical'
  component?: string
  description: string
  suggestion: string
  timestamp: string
}

export interface StabilityReport {
  issues: StabilityIssue[]
  performance: {
    memoryUsage: number
    renderCount: number
    errorCount: number
    warningCount: number
  }
  health: 'healthy' | 'degraded' | 'critical'
  timestamp: string
}

class StabilityChecker {
  private issues: StabilityIssue[] = [];
  private renderCounts = new Map<string, number>();
  private memorySnapshots: number[] = [];
  private intervalHandles = new Set<NodeJS.Timeout>();
  private errorCount = 0;
  private warningCount = 0;
  private isMonitoring = false;

  constructor() {
    this.setupErrorTracking();
    this.setupPerformanceMonitoring();
  }

  private setupErrorTracking() {
    // Track console errors
    const originalError = console.error;
    console.error = (...args) => {
      this.errorCount++;
      this.logIssue({
        type: 'async-race',
        severity: 'medium',
        description: `Console error: ${args.join(' ')}`,
        suggestion: 'Check error logs and fix underlying issues',
        timestamp: new Date().toISOString()
      });
      originalError.apply(console, args);
    };

    // Track console warnings
    const originalWarn = console.warn;
    console.warn = (...args) => {
      this.warningCount++;
      originalWarn.apply(console, args);
    };

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logIssue({
        type: 'async-race',
        severity: 'high',
        description: `Unhandled promise rejection: ${event.reason}`,
        suggestion: 'Add proper error handling to async operations',
        timestamp: new Date().toISOString()
      });
    });
  }

  private setupPerformanceMonitoring() {
    if (!CONFIG.IS_PRODUCTION) {
      setInterval(() => {
        this.checkMemoryUsage();
        this.validateIntervals();
      }, 30000); // Check every 30 seconds
    }
  }

  private checkMemoryUsage() {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      const currentUsage = memInfo.usedJSHeapSize / 1024 / 1024; // MB
      
      this.memorySnapshots.push(currentUsage);
      if (this.memorySnapshots.length > 10) {
        this.memorySnapshots.shift();
      }

      // Check for memory leaks (consistently increasing memory usage)
      if (this.memorySnapshots.length >= 5) {
        const trend = this.calculateMemoryTrend();
        if (trend > 5) { // More than 5MB increase per check
          this.logIssue({
            type: 'memory-leak',
            severity: 'high',
            description: `Potential memory leak detected. Memory usage increasing by ${trend.toFixed(2)}MB per check`,
            suggestion: 'Check for uncleaned intervals, event listeners, or state subscriptions',
            timestamp: new Date().toISOString()
          });
        }
      }
    }
  }

  private calculateMemoryTrend(): number {
    if (this.memorySnapshots.length < 2) {return 0;}
    
    const recentSnapshots = this.memorySnapshots.slice(-5);
    const increases = [];
    
    for (let i = 1; i < recentSnapshots.length; i++) {
      increases.push(recentSnapshots[i] - recentSnapshots[i - 1]);
    }
    
    return increases.reduce((sum, increase) => sum + increase, 0) / increases.length;
  }

  private validateIntervals() {
    // Check for excessive intervals
    if (this.intervalHandles.size > 50) {
      this.logIssue({
        type: 'memory-leak',
        severity: 'medium',
        description: `High number of active intervals detected: ${this.intervalHandles.size}`,
        suggestion: 'Ensure all intervals are properly cleaned up in useEffect cleanup functions',
        timestamp: new Date().toISOString()
      });
    }
  }

  public registerInterval(handle: NodeJS.Timeout) {
    this.intervalHandles.add(handle);
  }

  public unregisterInterval(handle: NodeJS.Timeout) {
    this.intervalHandles.delete(handle);
    clearInterval(handle);
  }

  public trackRender(componentName: string) {
    const count = this.renderCounts.get(componentName) || 0;
    this.renderCounts.set(componentName, count + 1);

    // Check for excessive re-renders
    if (count > 100) {
      this.logIssue({
        type: 'infinite-loop',
        severity: 'high',
        component: componentName,
        description: `Component ${componentName} has re-rendered ${count} times`,
        suggestion: 'Check for missing dependencies in useEffect or infinite state updates',
        timestamp: new Date().toISOString()
      });
    }
  }

  public validateStateUpdate(componentName: string, newState: any, prevState: any) {
    // Check for direct state mutation
    if (prevState && typeof prevState === 'object') {
      try {
        const prevStateStr = JSON.stringify(prevState);
        const newStateStr = JSON.stringify(newState);
        
        if (prevState === newState && prevStateStr !== newStateStr) {
          this.logIssue({
            type: 'state-mutation',
            severity: 'high',
            component: componentName,
            description: 'Direct state mutation detected',
            suggestion: 'Use immutable state updates with spread operator or immer',
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        // Ignore circular reference errors in state comparison
      }
    }
  }

  public validateEffectDependencies(componentName: string, dependencies: any[]) {
    // Check for missing or incorrect dependencies
    const hasObjectDependencies = dependencies.some(dep => 
      dep && typeof dep === 'object' && !Array.isArray(dep)
    );
    
    if (hasObjectDependencies) {
      this.logIssue({
        type: 'dependency-cycle',
        severity: 'medium',
        component: componentName,
        description: 'Object dependencies detected in useEffect',
        suggestion: 'Use useMemo or useCallback for object dependencies, or destructure specific properties',
        timestamp: new Date().toISOString()
      });
    }
  }

  public logIssue(issue: StabilityIssue) {
    this.issues.push(issue);
    
    // Keep only last 100 issues
    if (this.issues.length > 100) {
      this.issues = this.issues.slice(-100);
    }

    // Log critical issues immediately
    if (issue.severity === 'critical') {
      console.error(`🚨 Critical stability issue in ${issue.component || 'unknown component'}:`, issue.description);
      if (CONFIG.IS_PRODUCTION) {
        toast.error(`Critical issue detected: ${issue.description}`);
      }
    }
  }

  public generateReport(): StabilityReport {
    const memoryUsage = this.memorySnapshots.length > 0 
      ? this.memorySnapshots[this.memorySnapshots.length - 1] 
      : 0;

    const totalRenders = Array.from(this.renderCounts.values()).reduce((sum, count) => sum + count, 0);

    const criticalIssues = this.issues.filter(issue => issue.severity === 'critical').length;
    const highIssues = this.issues.filter(issue => issue.severity === 'high').length;

    let health: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (criticalIssues > 0) {
      health = 'critical';
    } else if (highIssues > 5 || this.errorCount > 10) {
      health = 'degraded';
    }

    return {
      issues: this.issues.slice(-20), // Return last 20 issues
      performance: {
        memoryUsage,
        renderCount: totalRenders,
        errorCount: this.errorCount,
        warningCount: this.warningCount
      },
      health,
      timestamp: new Date().toISOString()
    };
  }

  public clearIssues() {
    this.issues = [];
    this.errorCount = 0;
    this.warningCount = 0;
    this.renderCounts.clear();
  }

  public startMonitoring() {
    this.isMonitoring = true;
    console.log('🔍 Stability monitoring started');
  }

  public stopMonitoring() {
    this.isMonitoring = false;
    // Clean up all tracked intervals
    this.intervalHandles.forEach(handle => clearInterval(handle));
    this.intervalHandles.clear();
    console.log('🔍 Stability monitoring stopped');
  }

  public getIssuesByComponent(componentName: string): StabilityIssue[] {
    return this.issues.filter(issue => issue.component === componentName);
  }

  public getIssuesBySeverity(severity: StabilityIssue['severity']): StabilityIssue[] {
    return this.issues.filter(issue => issue.severity === severity);
  }
}

// Create singleton instance
export const stabilityChecker = new StabilityChecker();

// React Hook for component stability monitoring
export function useStabilityMonitor(componentName: string) {
  // Only monitor in development
  if (CONFIG.IS_DEVELOPMENT) {
    stabilityChecker.trackRender(componentName);
  }
}

// Higher-order component for stability monitoring
export function withStabilityMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  const WrappedComponent = (props: P) => {
    useStabilityMonitor(componentName);
    return <Component {...props} />;
  };
  
  WrappedComponent.displayName = `withStabilityMonitoring(${componentName})`;
  return WrappedComponent;
}

// Utility functions for common checks
export const stabilityUtils = {
  // Check if a value is safely serializable
  isSafeForState: (value: any): boolean => {
    try {
      JSON.stringify(value);
      return true;
    } catch {
      return false;
    }
  },

  // Create a stable reference for object dependencies
  createStableRef: <T extends object>(obj: T, deps: any[]): T => {
    // This would typically use useMemo in the actual component
    return obj;
  },

  // Validate async operation cleanup
  validateAsyncCleanup: (cleanup: () => void, componentName: string) => {
    return () => {
      try {
        cleanup();
      } catch (error) {
        stabilityChecker.logIssue({
          type: 'async-race',
          severity: 'medium',
          component: componentName,
          description: `Error during async cleanup: ${error}`,
          suggestion: 'Ensure cleanup functions handle component unmounting gracefully',
          timestamp: new Date().toISOString()
        });
      }
    };
  }
};

export default stabilityChecker;