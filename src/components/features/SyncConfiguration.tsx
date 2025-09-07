/**
 * Automatic Sync Configuration Component
 * Advanced settings for managing real-time data synchronization
 */

import React, { useState } from 'react';
import { useAutoSync } from '@/hooks/useAutoSync';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Zap, 
  Settings, 
  Activity, 
  Clock, 
  Database, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  BarChart3,
  Timer,
  Bell,
  Target
} from '@phosphor-icons/react';

interface SyncConfigurationProps {
  onClose?: () => void
}

const PLATFORM_OPTIONS = [
  { id: 'hackerone', name: 'HackerOne', color: 'bg-blue-500' },
  { id: 'bugcrowd', name: 'Bugcrowd', color: 'bg-purple-500' },
  { id: 'intigriti', name: 'Intigriti', color: 'bg-green-500' },
  { id: 'yeswehack', name: 'YesWeHack', color: 'bg-orange-500' }
];

const DATA_TYPE_OPTIONS = [
  { id: 'programs', name: 'Bug Bounty Programs', icon: Target },
  { id: 'reports', name: 'Vulnerability Reports', icon: Shield },
  { id: 'earnings', name: 'Earnings & Bounties', icon: BarChart3 }
];

const INTERVAL_OPTIONS = [
  { value: 60000, label: '1 minute', description: 'High frequency' },
  { value: 300000, label: '5 minutes', description: 'Recommended' },
  { value: 600000, label: '10 minutes', description: 'Balanced' },
  { value: 1800000, label: '30 minutes', description: 'Low frequency' },
  { value: 3600000, label: '1 hour', description: 'Minimal' }
];

export function SyncConfiguration({ onClose }: SyncConfigurationProps) {
  const {
    config,
    updateConfig,
    metrics,
    connectionStatus,
    enableSync,
    disableSync,
    updateInterval,
    updatePlatforms,
    updateDataTypes,
    forceSync,
    resetStats,
    isEnabled,
    isRunning,
    connectedPlatforms,
    disconnectedPlatforms,
    nextSyncFormatted,
    calculateSuccessRate
  } = useAutoSync();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'general' | 'platforms' | 'data' | 'advanced'>('general');

  const handleToggleSync = async () => {
    setIsLoading(true);
    
    try {
      if (isEnabled) {
        disableSync();
      } else {
        const success = await enableSync();
        if (!success) {
          toast.error('Failed to enable sync - check platform connections');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceSync = async () => {
    setIsLoading(true);
    
    try {
      const success = await forceSync();
      if (success) {
        toast.success('Manual sync completed successfully');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlatformToggle = (platformId: string, enabled: boolean) => {
    const newPlatforms = enabled 
      ? [...config.platforms, platformId]
      : config.platforms.filter(p => p !== platformId);
    
    updatePlatforms(newPlatforms);
  };

  const handleDataTypeToggle = (dataType: 'programs' | 'reports' | 'earnings', enabled: boolean) => {
    const newDataTypes = enabled
      ? [...config.dataTypes, dataType]
      : config.dataTypes.filter(t => t !== dataType);
    
    updateDataTypes(newDataTypes);
  };

  const getPlatformStatus = (platformId: string) => {
    const status = connectionStatus[platformId];
    const isSelected = config.platforms.includes(platformId);
    
    if (!isSelected) {return { status: 'disabled', color: 'bg-muted', icon: XCircle };}
    
    switch (status) {
      case 'connected':
        return { status: 'connected', color: 'bg-green-500', icon: CheckCircle };
      case 'error':
        return { status: 'error', color: 'bg-red-500', icon: AlertTriangle };
      default:
        return { status: 'disconnected', color: 'bg-yellow-500', icon: XCircle };
    }
  };

  const getSuccessRate = () => {
    return calculateSuccessRate();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Automatic Sync Configuration</h2>
            <p className="text-sm text-muted-foreground">
              Configure real-time data synchronization with bug bounty platforms
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={isRunning ? "default" : "secondary"} className="gap-1">
            <Activity className="h-3 w-3" />
            {isRunning ? 'Active' : 'Inactive'}
          </Badge>
          
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 glass-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Database className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <div className="text-lg font-semibold">{metrics.programsCount}</div>
              <div className="text-xs text-muted-foreground">Programs</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 glass-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Shield className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <div className="text-lg font-semibold">{metrics.reportsCount}</div>
              <div className="text-xs text-muted-foreground">Reports</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 glass-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <BarChart3 className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <div className="text-lg font-semibold">{getSuccessRate().toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 glass-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Timer className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <div className="text-lg font-semibold">{nextSyncFormatted}</div>
              <div className="text-xs text-muted-foreground">Next Sync</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Controls */}
      <Card className="p-6 glass-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Switch
              checked={isEnabled}
              onCheckedChange={handleToggleSync}
              disabled={isLoading}
            />
            <div>
              <h3 className="font-medium">Automatic Synchronization</h3>
              <p className="text-sm text-muted-foreground">
                {isEnabled ? 'Sync is running automatically' : 'Sync is currently disabled'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleForceSync}
              disabled={isLoading || !isEnabled}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Force Sync
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={resetStats}
              className="gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Reset Stats
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border mb-6">
          {[
            { id: 'general', label: 'General', icon: Settings },
            { id: 'platforms', label: 'Platforms', icon: Database },
            { id: 'data', label: 'Data Types', icon: Shield },
            { id: 'advanced', label: 'Advanced', icon: Activity }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-sm border-b-2 transition-colors ${
                selectedTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {selectedTab === 'general' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Sync Interval</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {INTERVAL_OPTIONS.map(option => (
                  <Card 
                    key={option.value}
                    className={`p-4 cursor-pointer transition-colors ${
                      config.interval === option.value 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-border'
                    }`}
                    onClick={() => updateInterval(option.value)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{option.label}</span>
                      {config.interval === option.value && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Notifications</h4>
                <Switch
                  checked={config.notifications}
                  onCheckedChange={(checked) => 
                    updateConfig(prev => ({ ...prev, notifications: checked }))
                  }
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Show toast notifications for sync events and errors
              </p>
            </div>
          </div>
        )}

        {selectedTab === 'platforms' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Connected
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                Disconnected
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                Error
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-muted"></div>
                Disabled
              </div>
            </div>
            
            {PLATFORM_OPTIONS.map(platform => {
              const platformStatus = getPlatformStatus(platform.id);
              const isSelected = config.platforms.includes(platform.id);
              
              return (
                <Card key={platform.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-8 h-8 rounded-lg ${platform.color} flex items-center justify-center`}>
                          <Database className="h-4 w-4 text-white" />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${platformStatus.color} border-2 border-background`}></div>
                      </div>
                      <div>
                        <h5 className="font-medium">{platform.name}</h5>
                        <p className="text-sm text-muted-foreground capitalize">
                          {platformStatus.status}
                        </p>
                      </div>
                    </div>
                    
                    <Switch
                      checked={isSelected}
                      onCheckedChange={(checked) => handlePlatformToggle(platform.id, checked)}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {selectedTab === 'data' && (
          <div className="space-y-4">
            {DATA_TYPE_OPTIONS.map(dataType => {
              const isSelected = config.dataTypes.includes(dataType.id as any);
              
              return (
                <Card key={dataType.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <dataType.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h5 className="font-medium">{dataType.name}</h5>
                        <p className="text-sm text-muted-foreground">
                          {dataType.id === 'programs' && 'Active bug bounty programs and scopes'}
                          {dataType.id === 'reports' && 'Your submitted vulnerability reports'}
                          {dataType.id === 'earnings' && 'Bounty payments and earnings history'}
                        </p>
                      </div>
                    </div>
                    
                    <Switch
                      checked={isSelected}
                      onCheckedChange={(checked) => handleDataTypeToggle(dataType.id as any, checked)}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {selectedTab === 'advanced' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Error Handling</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">Automatic Retry</h5>
                    <p className="text-sm text-muted-foreground">
                      Retry failed sync attempts automatically
                    </p>
                  </div>
                  <Switch
                    checked={config.errorRetry.enabled}
                    onCheckedChange={(checked) => 
                      updateConfig(prev => ({
                        ...prev,
                        errorRetry: { ...prev.errorRetry, enabled: checked }
                      }))
                    }
                  />
                </div>
                
                {config.errorRetry.enabled && (
                  <div className="pl-4 border-l-2 border-border space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Max Retries:</span> {config.errorRetry.maxRetries}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Backoff Multiplier:</span> {config.errorRetry.backoffMultiplier}x
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3">Statistics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Total Syncs</div>
                  <div className="text-lg font-semibold">{config.totalSyncs}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Failed Syncs</div>
                  <div className="text-lg font-semibold text-red-500">{config.errors}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default SyncConfiguration;