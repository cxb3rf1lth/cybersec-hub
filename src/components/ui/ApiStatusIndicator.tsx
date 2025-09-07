import { useEffect, useState } from 'react';
import { useApiKeys } from '@/lib/api-keys';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Settings } from '@phosphor-icons/react';

export function ApiStatusIndicator() {
  const { getAllApiKeys, getServiceStats } = useApiKeys();
  const [stats, setStats] = useState<Record<string, any>>({});

  useEffect(() => {
    const updateStats = () => {
      setStats(getServiceStats());
    };

    updateStats();
    
    // Update stats every 30 seconds
    const interval = setInterval(updateStats, 30000);
    return () => clearInterval(interval);
  }, [getServiceStats]);

  const enabledServices = Object.entries(stats).filter(([_, stat]) => stat.enabled);
  const activeServices = enabledServices.filter(([_, stat]) => stat.valid === true);

  if (enabledServices.length === 0) {
    return null;
  }

  return (
    <Card className="glass-card border-border/50">
      <CardContent className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium">API Services</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={activeServices.length === enabledServices.length ? 'default' : 'secondary'}
              className={`text-xs ${
                activeServices.length === enabledServices.length 
                  ? 'bg-green-600/20 text-green-400 border-green-600/30' 
                  : 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30'
              }`}
            >
              {activeServices.length === enabledServices.length ? (
                <CheckCircle size={12} className="mr-1" />
              ) : (
                <XCircle size={12} className="mr-1" />
              )}
              {activeServices.length}/{enabledServices.length} Active
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}