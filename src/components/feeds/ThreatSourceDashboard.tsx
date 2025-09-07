import { BinaryRain } from '@/components/ui/loading-animations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useThreatSources } from '@/hooks/useThreatSources';
import { useState, useEffect } from 'react';
import { 
  Database, 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  Clock,
  Zap
} from '@phosphor-icons/react';
import { formatDistanceToNow } from 'date-fns';

export function ThreatSourceDashboard() {
  const { sources, getSourceStats } = useThreatSources();
  const [totalFeeds, setTotalFeeds] = useState(0);
  const [activeSources, setActiveSources] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    // Calculate dashboard stats
    const total = sources.reduce((sum, source) => sum + (source.totalItems || 0), 0);
    const active = sources.filter(source => source.isActive).length;
    
    // Get recent activity from sources
    const activity = sources
      .filter(source => source.lastUpdate)
      .map(source => ({
        id: source.id,
        name: source.name,
        type: source.category,
        lastUpdate: source.lastUpdate,
        status: source.lastError ? 'error' : 'success',
        itemCount: source.totalItems || 0
      }))
      .sort((a, b) => new Date(b.lastUpdate!).getTime() - new Date(a.lastUpdate!).getTime())
      .slice(0, 5);

    setTotalFeeds(total);
    setActiveSources(active);
    setRecentActivity(activity);
  }, [sources]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'vulnerability': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'malware': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'threat-intel': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'bug-bounty': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'news': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Background Binary Rain Effect for Threat Dashboard */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-10">
        <div className="grid grid-cols-8 gap-6 h-full">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col h-full">
              <BinaryRain />
            </div>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Source Overview</h3>
        <p className="text-sm text-muted-foreground">
          Real-time monitoring of your threat intelligence sources
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Sources</p>
                <p className="text-2xl font-bold text-foreground">{sources.length}</p>
              </div>
              <Database className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Sources</p>
                <p className="text-2xl font-bold text-green-400">{activeSources}</p>
              </div>
              <Activity className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold text-blue-400">{totalFeeds.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg Success Rate</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {sources.length > 0 ? Math.round(
                    sources.reduce((sum, source) => {
                      const stats = getSourceStats(source.id);
                      return sum + (stats ? (stats.successfulRequests / Math.max(stats.totalRequests, 1)) * 100 : 0);
                    }, 0) / sources.length
                  ) : 0}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Source Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover-border-flow transition-colors">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(activity.status)}
                    <div>
                      <p className="font-medium text-foreground">{activity.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={getCategoryColor(activity.type)}>
                          {activity.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {activity.itemCount} items
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.lastUpdate), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No recent activity</p>
              <p className="text-xs text-muted-foreground mt-1">
                Configure and activate sources to see activity
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Source Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Source Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sources.length > 0 ? (
            <div className="grid gap-3">
              {sources.map((source) => {
                const stats = getSourceStats(source.id);
                const successRate = stats 
                  ? Math.round((stats.successfulRequests / Math.max(stats.totalRequests, 1)) * 100)
                  : 0;

                return (
                  <div key={source.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        !source.isActive ? 'bg-gray-500' :
                        source.lastError ? 'bg-red-500' :
                        source.lastUpdate ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <div>
                        <p className="font-medium text-foreground">{source.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={getCategoryColor(source.category)}>
                            {source.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {source.type.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {successRate}% success
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {source.totalItems || 0} items
                        </Badge>
                      </div>
                      {source.lastUpdate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Last: {formatDistanceToNow(new Date(source.lastUpdate), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No sources configured</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add threat intelligence sources to start monitoring
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}