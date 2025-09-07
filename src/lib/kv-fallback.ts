/**
 * KV Storage Fallback for Development
 * Provides localStorage-based fallback when GitHub Spark KV is unavailable
 */

import { useState, useEffect } from 'react';

// Check if we're in a Spark environment
const isSparkEnvironment = () => {
  return typeof window !== 'undefined' && 
         (window.location.hostname.includes('spark') ||
          process.env.NODE_ENV === 'production');
};

// Mock KV hook for development
export function useKVFallback<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') {return defaultValue;}
    
    try {
      const stored = localStorage.getItem(`kv_fallback_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setValueWithStorage = (newValue: T) => {
    setValue(newValue);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`kv_fallback_${key}`, JSON.stringify(newValue));
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
    }
  };

  return [value, setValueWithStorage];
}

// Enhanced useKV that falls back to localStorage in development
export function useKVWithFallback<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  // Always use fallback for now to avoid KV issues in development
  return useKVFallback(key, defaultValue);
}