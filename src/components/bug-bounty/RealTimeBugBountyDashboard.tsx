import React, { useState, useEffect } from 'react';
import { useKVWithFallback } from '@/lib/kv-fallback';
import { useProductionAPI } from '@/lib/production-api';
import { bugBountySyncService, SyncedBugBountyData, BugBountyProgram, BugBountyReport } from '@/lib/real-time-sync';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  DollarSign, 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  Clock,
  Target,
  Zap,
  ExternalLink,
  RefreshCw,
  Play,
  Pause,
  Settings
} from '@/lib/phosphor-icons-wrapper';
import { BinaryRain } from '@/components/ui/BinaryRain';

export function RealTimeBugBountyDashboard() {
  const [syncData, setSyncData] = useKVWithFallback<SyncedBugBountyData | null>('synced_bug_bounty_data', null);
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useKV('auto_sync_enabled', false);
  const [syncInterval, setSyncInterval] = useKV('sync_interval_minutes', 5);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');
  
  const api = useProductionAPI();

  // Initialize sync service
  useEffect(() => {
    const loadData = async () => {
      const cachedData = await bugBountySyncService.getCachedData();
      if (cachedData) {
        setSyncData(cachedData);
      }
    };

    loadData();

    // Add sync listener
    const syncListener = (data: SyncedBugBountyData) => {
      setSyncData(data);
    };

    bugBountySyncService.addSyncListener(syncListener);

    return () => {
      bugBountySyncService.removeSyncListener(syncListener);
    };
  }, []);

  // Auto-sync control
  useEffect(() => {
    if (isAutoSyncEnabled) {
      bugBountySyncService.setSyncInterval(syncInterval * 60000); // Convert to ms
      bugBountySyncService.startSync();
    } else {
      bugBountySyncService.stopSync();
    }
  }, [isAutoSyncEnabled, syncInterval]);

  const handleManualSync = async () => {
    setIsLoading(true);
    try {
      await bugBountySyncService.forcSync();
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAutoSync = () => {
    setIsAutoSyncEnabled(!isAutoSyncEnabled);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) {return 'Just now';}
    if (diffMins < 60) {return `${diffMins}m ago`;}
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {return `${diffHours}h ago`;}
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRecentPrograms = () => {
    if (!syncData) {return [];}
    return syncData.programs
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
      .slice(0, 10);
  };

  const getRecentReports = () => {
    if (!syncData) {return [];}
    return syncData.reports
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 10);
  };

  const getTopEarningPrograms = () => {
    if (!syncData) {return [];}
    return syncData.programs
      .sort((a, b) => b.rewards.maximum - a.rewards.maximum)
      .slice(0, 5);
  };

  const connections = api.getAllConnections();
  const connectedPlatforms = connections.filter(c => c.status === 'connected');

  return (
    <div className="space-y-6 relative">
      {/* Binary rain effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <BinaryRain immersive={isAutoSyncEnabled} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Real-Time Bug Bounty Dashboard</h2>
            <p className="text-muted-foreground">
              Live data from {connectedPlatforms.length} connected platform{connectedPlatforms.length !== 1 ? 's' : ''}
              {syncData && ` • Last sync: ${formatTimeAgo(syncData.lastSync)}`}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAutoSync}
              className={`hover-border-flow ${isAutoSyncEnabled ? 'bg-green-500/10 border-green-500/30' : ''}`}
            >
              {isAutoSyncEnabled ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isAutoSyncEnabled ? 'Auto Sync On' : 'Auto Sync Off'}
            </Button>
            
            <Button
              onClick={handleManualSync}
              disabled={isLoading}
              className="hover-red-glow"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>
        </div>

        {/* Connection Status */}
        {connectedPlatforms.length === 0 && (
          <Card className="glass-card border-yellow-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
                <div>
                  <h3 className="font-semibold text-foreground">No Connected Platforms</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect to bug bounty platforms to start receiving live data
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Real-Time Statistics */}
        {syncData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Programs</p>
                    <p className="text-2xl font-bold text-foreground">{syncData.stats.activePrograms}</p>
                    <p className="text-xs text-muted-foreground">of {syncData.stats.totalPrograms} total</p>
                  </div>
                  <Shield className="w-8 h-8 text-accent/60" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                    <p className="text-2xl font-bold text-foreground">${syncData.stats.totalEarnings.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Avg: ${Math.floor(syncData.stats.averageBounty).toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-400/60" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold text-foreground">{syncData.stats.successRate.toFixed(1)}%</p>
                    <Progress value={syncData.stats.successRate} className="mt-2" />
                  </div>
                  <Target className="w-8 h-8 text-accent/60" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Response Time</p>
                    <p className="text-2xl font-bold text-foreground">{syncData.stats.responseTime}</p>
                    <p className="text-xs text-muted-foreground">Average program response</p>
                  </div>
                  <Clock className="w-8 h-8 text-accent/60" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="programs" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="programs">Live Programs</TabsTrigger>
            <TabsTrigger value="reports">Recent Reports</TabsTrigger>
            <TabsTrigger value="earnings">Top Rewards</TabsTrigger>
            <TabsTrigger value="settings">Sync Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="programs" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {getRecentPrograms().map((program) => (
                <Card key={`${program.platform}-${program.id}`} className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{program.platform}</Badge>
                        <div>
                          <h3 className="font-semibold text-foreground">{program.name}</h3>
                          <p className="text-sm text-muted-foreground">@{program.handle}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Max Bounty</p>
                          <p className="font-semibold text-green-400">${program.rewards.maximum.toLocaleString()}</p>
                        </div>
                        
                        <Badge className={
                          program.status === 'active' 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }>
                          {program.status}
                        </Badge>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(program.url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center gap-6 text-sm text-muted-foreground">
                      <span>Reports: {program.metrics.totalReports}</span>
                      <span>Avg Response: {program.metrics.averageResponseTime}</span>
                      <span>Scopes: {program.scopes.length}</span>
                      <span>Updated: {formatTimeAgo(program.lastUpdated)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {getRecentPrograms().length === 0 && (
              <Card className="glass-card">
                <CardContent className="p-8 text-center">
                  <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Programs Synced</h3>
                  <p className="text-muted-foreground">
                    Connect to bug bounty platforms and sync data to see live programs
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {getRecentReports().map((report) => (
                <Card key={`${report.platform}-${report.id}`} className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={getSeverityColor(report.severity)}>
                            {report.severity}
                          </Badge>
                          <Badge variant="outline">{report.category}</Badge>
                          <Badge variant="outline">{report.platform}</Badge>
                          {report.cve && (
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                              {report.cve}
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-foreground mb-1">{report.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Program: {report.program}</span>
                          <span>Researcher: {report.researcher}</span>
                          <span>{formatTimeAgo(report.submittedAt)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {report.bounty && (
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Bounty</p>
                            <p className="font-semibold text-green-400">${report.bounty.toLocaleString()}</p>
                          </div>
                        )}
                        <Badge className={
                          report.status === 'Resolved' 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : report.status === 'New'
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }>
                          {report.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {getRecentReports().length === 0 && (
              <Card className="glass-card">
                <CardContent className="p-8 text-center">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Reports Available</h3>
                  <p className="text-muted-foreground">
                    Report data will appear here when available from connected platforms
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="earnings" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {getTopEarningPrograms().map((program) => (
                <Card key={`${program.platform}-${program.id}`} className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{program.platform}</Badge>
                        <div>
                          <h3 className="font-semibold text-foreground">{program.name}</h3>
                          <p className="text-sm text-muted-foreground">{program.company}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Reward Range</p>
                          <p className="font-semibold text-green-400">
                            ${program.rewards.minimum.toLocaleString()} - ${program.rewards.maximum.toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Avg Bounty</p>
                          <p className="font-semibold text-foreground">${program.metrics.averageBounty.toLocaleString()}</p>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(program.url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {getTopEarningPrograms().length === 0 && (
              <Card className="glass-card">
                <CardContent className="p-8 text-center">
                  <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Earning Data</h3>
                  <p className="text-muted-foreground">
                    Earning information will appear here when available from connected platforms
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Sync Configuration
                </CardTitle>
                <CardDescription>Configure how often data is synchronized</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sync Interval (minutes)</label>
                  <select 
                    value={syncInterval} 
                    onChange={(e) => setSyncInterval(Number(e.target.value))}
                    className="w-full p-2 bg-input border border-border rounded-md text-foreground"
                  >
                    <option value={1}>1 minute</option>
                    <option value={5}>5 minutes</option>
                    <option value={10}>10 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-md">
                  <div>
                    <p className="font-medium text-foreground">Auto Sync</p>
                    <p className="text-sm text-muted-foreground">Automatically sync data at set intervals</p>
                  </div>
                  <Button
                    variant={isAutoSyncEnabled ? "default" : "outline"}
                    onClick={toggleAutoSync}
                    className={isAutoSyncEnabled ? "hover-red-glow" : "hover-border-flow"}
                  >
                    {isAutoSyncEnabled ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isAutoSyncEnabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>⚠️ More frequent syncing may hit rate limits faster</p>
                  <p>📊 Data is cached locally and updated in real-time when available</p>
                  <p>🔄 Connected platforms: {connectedPlatforms.map(c => c.platform).join(', ') || 'None'}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}