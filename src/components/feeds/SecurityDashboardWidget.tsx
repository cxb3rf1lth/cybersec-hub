import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  TrendingUp, 
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle
} from '@/lib/phosphor-icons-wrapper';
import { formatDistanceToNow } from 'date-fns';

interface SecurityMetric {
  id: string
  title: string
  value: number
  change: number
  trend: 'up' | 'down' | 'stable'
  category: 'vulnerability' | 'threat' | 'incident' | 'compliance'
}

interface SecurityEvent {
  id: string
  title: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'active' | 'investigating' | 'resolved'
  timestamp: string
  affected: string
}

export function SecurityDashboardWidget() {
  // Mock security metrics
  const metrics: SecurityMetric[] = [
    {
      id: '1',
      title: 'Active Vulnerabilities',
      value: 23,
      change: -5,
      trend: 'down',
      category: 'vulnerability'
    },
    {
      id: '2',
      title: 'Threat Detections',
      value: 157,
      change: 12,
      trend: 'up',
      category: 'threat'
    },
    {
      id: '3',
      title: 'Security Score',
      value: 87,
      change: 3,
      trend: 'up',
      category: 'compliance'
    },
    {
      id: '4',
      title: 'Incidents This Week',
      value: 4,
      change: -2,
      trend: 'down',
      category: 'incident'
    }
  ];

  // Mock recent security events
  const recentEvents: SecurityEvent[] = [
    {
      id: '1',
      title: 'Suspicious login attempt detected',
      severity: 'high',
      status: 'investigating',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      affected: 'Authentication System'
    },
    {
      id: '2',
      title: 'Malware blocked on endpoint',
      severity: 'medium',
      status: 'resolved',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      affected: 'Workstation-007'
    },
    {
      id: '3',
      title: 'Network intrusion attempt',
      severity: 'critical',
      status: 'active',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      affected: 'DMZ Network'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AlertTriangle className="w-3 h-3 text-destructive" />;
      case 'investigating': return <Activity className="w-3 h-3 text-orange-500" />;
      case 'resolved': return <CheckCircle className="w-3 h-3 text-green-500" />;
      default: return <Clock className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Security Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Security Metrics */}
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric) => (
            <div key={metric.id} className="p-3 rounded-lg border border-border bg-card/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{metric.title}</span>
                <TrendingUp className={`w-3 h-3 ${getTrendColor(metric.trend)}`} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold">{metric.value}</span>
                <span className={`text-xs ${metric.change > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {metric.change > 0 ? '+' : ''}{metric.change}
                </span>
              </div>
              {metric.category === 'compliance' && (
                <Progress value={metric.value} className="h-1 mt-2" />
              )}
            </div>
          ))}
        </div>

        {/* Recent Events */}
        <div>
          <h4 className="font-medium text-sm mb-3">Recent Security Events</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {recentEvents.map((event) => (
              <div key={event.id} className="p-2 rounded border border-border bg-card/30">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {getStatusIcon(event.status)}
                    <span className="text-xs font-medium truncate">{event.title}</span>
                  </div>
                  <Badge className={`${getSeverityColor(event.severity)} text-xs`}>
                    {event.severity}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{event.affected}</span>
                  <span>{formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <Button variant="outline" size="sm" className="w-full hover-red-glow">
            View Full Security Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}