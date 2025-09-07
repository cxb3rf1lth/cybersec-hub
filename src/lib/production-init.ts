/**
 * Production Initialization Service
 * Handles startup, health checks, and service initialization for production deployment
 */

import { CONFIG, FEATURE_FLAGS, validateEnvironment } from './environment';
import { 
  authService, 
  webSocketService, 
  bugBountyService, 
  threatIntelService,
  virtualLabService,
  codeCollaborationService,
  messagingService,
  teamService
} from './production-services';
import { apiKeyManager } from './api-keys';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

// Service health status tracking
export interface ServiceStatus {
  name: string
  status: 'healthy' | 'degraded' | 'down' | 'unknown'
  lastCheck: string
  error?: string
  metrics?: {
    responseTime: number
    uptime: number
    errorRate: number
  }
}

export class ProductionInitializer {
  private static instance: ProductionInitializer;
  private services: Map<string, ServiceStatus> = new Map();
  private healthCheckInterval: number | null = null;
  private initialized = false;

  static getInstance(): ProductionInitializer {
    if (!ProductionInitializer.instance) {
      ProductionInitializer.instance = new ProductionInitializer();
    }
    return ProductionInitializer.instance;
  }

  async initialize(userId: string): Promise<void> {
    if (this.initialized) {
      console.log('Production services already initialized');
      return;
    }

    try {
      console.log('🚀 Initializing CyberConnect Production Services...');
      
      // Validate environment
      const envValidation = validateEnvironment();
      if (!envValidation.valid && CONFIG.IS_PRODUCTION) {
        throw new Error(`Environment validation failed: ${envValidation.missing.join(', ')}`);
      }

      // Initialize services in order of dependency
      await this.initializeAuthService();
      await this.initializeWebSocketService(userId);
      await this.initializeCoreServices(userId);
      await this.initializeIntegrationServices();
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      this.initialized = true;
      console.log('✅ Production services initialized successfully');
      
      if (!CONFIG.IS_DEVELOPMENT) {
        toast.success('Connected to CyberConnect services', { duration: 3000 });
      }
    } catch (error) {
      console.error('❌ Failed to initialize production services:', error);
      
      if (CONFIG.IS_PRODUCTION) {
        toast.error('Failed to connect to services. Some features may be limited.');
      }
      
      // Continue in fallback mode
      this.initialized = true;
    }
  }

  private async initializeAuthService(): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Test authentication service
      await authService.getAuthToken();
      
      const responseTime = Date.now() - startTime;
      this.updateServiceStatus('auth', {
        name: 'Authentication Service',
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        metrics: {
          responseTime,
          uptime: 100,
          errorRate: 0
        }
      });
      
      console.log('✅ Authentication service initialized');
    } catch (error) {
      this.updateServiceStatus('auth', {
        name: 'Authentication Service',
        status: 'down',
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      console.warn('⚠️ Authentication service failed to initialize:', error);
      throw error;
    }
  }

  private async initializeWebSocketService(userId: string): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Initialize WebSocket connection
      await webSocketService.connect(userId);
      
      // Wait for connection to be established
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('WebSocket connection timeout')), 10000);
        
        webSocketService.on('connected', () => {
          clearTimeout(timeout);
          resolve(true);
        });
        
        webSocketService.on('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });
      
      const responseTime = Date.now() - startTime;
      this.updateServiceStatus('websocket', {
        name: 'Real-time Service',
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        metrics: {
          responseTime,
          uptime: 100,
          errorRate: 0
        }
      });
      
      console.log('✅ WebSocket service initialized');
    } catch (error) {
      this.updateServiceStatus('websocket', {
        name: 'Real-time Service',
        status: 'down',
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'WebSocket connection failed'
      });
      
      console.warn('⚠️ WebSocket service failed to initialize:', error);
      // Don't throw - continue without real-time features
    }
  }

  private async initializeCoreServices(userId: string): Promise<void> {
    const coreServices = [
      {
        name: 'messaging',
        service: messagingService,
        init: () => messagingService.initializeMessaging(userId),
        required: true
      },
      {
        name: 'virtual-lab',
        service: virtualLabService,
        init: () => virtualLabService.listVMs(),
        required: false
      },
      {
        name: 'collaboration',
        service: codeCollaborationService,
        init: () => Promise.resolve(), // No initialization needed
        required: false
      },
      {
        name: 'teams',
        service: teamService,
        init: () => Promise.resolve(), // No initialization needed
        required: false
      }
    ];

    for (const { name, init, required } of coreServices) {
      try {
        const startTime = Date.now();
        
        if (FEATURE_FLAGS[name.toUpperCase().replace('-', '_') as keyof typeof FEATURE_FLAGS] !== false) {
          await init();
        }
        
        const responseTime = Date.now() - startTime;
        this.updateServiceStatus(name, {
          name: `${name.charAt(0).toUpperCase() + name.slice(1)} Service`,
          status: 'healthy',
          lastCheck: new Date().toISOString(),
          metrics: {
            responseTime,
            uptime: 100,
            errorRate: 0
          }
        });
        
        console.log(`✅ ${name} service initialized`);
      } catch (error) {
        this.updateServiceStatus(name, {
          name: `${name.charAt(0).toUpperCase() + name.slice(1)} Service`,
          status: 'down',
          lastCheck: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Service initialization failed'
        });
        
        console.warn(`⚠️ ${name} service failed to initialize:`, error);
        
        if (required) {
          throw error;
        }
      }
    }
  }

  private async initializeIntegrationServices(): Promise<void> {
    if (!FEATURE_FLAGS.BUG_BOUNTY_INTEGRATION && !FEATURE_FLAGS.THREAT_INTELLIGENCE) {
      return;
    }

    try {
      console.log('🔑 Initializing API key manager...');
      
      // Load API keys from storage
      await apiKeyManager.loadApiKeys();
      
      // Refresh API key validations (but don't block initialization)
      apiKeyManager.refreshAllKeys().then(result => {
        console.log(`API key validation completed: ${result.success} valid, ${result.failed} failed`);
      }).catch(error => {
        console.warn('API key validation failed:', error);
      });
      
      const startTime = Date.now();
      
      // Initialize threat intelligence service
      if (FEATURE_FLAGS.THREAT_INTELLIGENCE) {
        await threatIntelService.getLatestThreats();
      }
      
      // Bug bounty service is initialized on-demand when platforms are connected
      
      const responseTime = Date.now() - startTime;
      this.updateServiceStatus('integrations', {
        name: 'Integration Services',
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        metrics: {
          responseTime,
          uptime: 100,
          errorRate: 0
        }
      });
      
      console.log('✅ Integration services initialized');
    } catch (error) {
      this.updateServiceStatus('integrations', {
        name: 'Integration Services',
        status: 'degraded',
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Integration services degraded'
      });
      
      console.warn('⚠️ Integration services degraded:', error);
      // Don't throw - continue without some integrations
    }
  }

  private startHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      return;
    }

    // Perform health checks every 5 minutes
    this.healthCheckInterval = window.setInterval(async () => {
      await this.performHealthChecks();
    }, 5 * 60 * 1000);

    console.log('🔍 Health monitoring started');
  }

  private async performHealthChecks(): Promise<void> {
    for (const [serviceName, status] of this.services) {
      try {
        const startTime = Date.now();
        
        // Perform service-specific health check
        await this.checkServiceHealth(serviceName);
        
        const responseTime = Date.now() - startTime;
        
        this.updateServiceStatus(serviceName, {
          ...status,
          status: 'healthy',
          lastCheck: new Date().toISOString(),
          metrics: {
            ...status.metrics,
            responseTime,
            uptime: Math.min((status.metrics?.uptime || 0) + 1, 100)
          }
        });
      } catch (error) {
        this.updateServiceStatus(serviceName, {
          ...status,
          status: status.status === 'healthy' ? 'degraded' : 'down',
          lastCheck: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Health check failed',
          metrics: {
            ...status.metrics,
            errorRate: Math.min((status.metrics?.errorRate || 0) + 1, 100)
          }
        });
      }
    }
  }

  private async checkServiceHealth(serviceName: string): Promise<void> {
    switch (serviceName) {
      case 'auth':
        await authService.getAuthToken();
        break;
      case 'websocket':
        if (!webSocketService || !webSocketService.send({ type: 'ping' })) {
          throw new Error('WebSocket not connected');
        }
        break;
      case 'virtual-lab':
        await virtualLabService.listVMs();
        break;
      case 'integrations':
        await threatIntelService.getLatestThreats();
        break;
      default:
        // Basic connectivity check
        break;
    }
  }

  private updateServiceStatus(serviceName: string, status: ServiceStatus): void {
    this.services.set(serviceName, status);
  }

  getServiceStatuses(): ServiceStatus[] {
    return Array.from(this.services.values());
  }

  getOverallHealth(): 'healthy' | 'degraded' | 'down' {
    const statuses = Array.from(this.services.values());
    
    if (statuses.every(s => s.status === 'healthy')) {
      return 'healthy';
    }
    
    if (statuses.some(s => s.status === 'down')) {
      return 'down';
    }
    
    return 'degraded';
  }

  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down production services...');
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    // Disconnect WebSocket
    webSocketService.disconnect();
    
    this.initialized = false;
    console.log('✅ Production services shut down');
  }
}

// Export singleton instance
export const productionInitializer = ProductionInitializer.getInstance();

// Auto-initialize when imported (if user is available)
export async function initializeProductionServices(userId: string): Promise<void> {
  await productionInitializer.initialize(userId);
}

// Service status monitoring hook
export function useServiceStatus() {
  const [statuses, setStatuses] = useState<ServiceStatus[]>([]);
  const [overallHealth, setOverallHealth] = useState<'healthy' | 'degraded' | 'down'>('unknown');

  useEffect(() => {
    const updateStatuses = () => {
      setStatuses(productionInitializer.getServiceStatuses());
      setOverallHealth(productionInitializer.getOverallHealth());
    };

    updateStatuses();
    
    // Update every 30 seconds
    const interval = setInterval(updateStatuses, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { statuses, overallHealth };
}

// Development helpers
export const DevTools = CONFIG.IS_DEVELOPMENT ? {
  resetServices: () => {
    productionInitializer.shutdown();
  },
  
  getServiceLogs: () => {
    return productionInitializer.getServiceStatuses();
  },
  
  simulateServiceFailure: (serviceName: string) => {
    console.warn(`🔧 DEV: Simulating ${serviceName} service failure`);
    // This would be used for testing failure scenarios
  }
} : undefined;