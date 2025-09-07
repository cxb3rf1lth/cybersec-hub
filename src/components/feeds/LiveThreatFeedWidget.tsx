import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  Shield, 
  Bug, 
  Eye, 
  Clock,
  ExternalLink,
  TrendingUp,
  DollarSign,
  Zap
} from '@/lib/phosphor-icons-wrapper';
import { formatDistanceToNow } from 'date-fns';

interface ThreatFeedItem {
  id: string
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  source: string
  category: 'vulnerability' | 'exploit' | 'malware' | 'incident' | 'bounty'
  timestamp: string
  url?: string
  reward?: number
  isPinned?: boolean
}

interface LiveThreatFeedWidgetProps {
  maxItems?: number
  showHeader?: boolean
  className?: string
}

export function LiveThreatFeedWidget({ maxItems = 5, showHeader = true, className = '' }: LiveThreatFeedWidgetProps) {
  // Mock real-time data that would normally come from threat intelligence APIs
  const mockLiveFeeds: ThreatFeedItem[] = [
    {
      id: '1',
      title: 'Critical RCE in Log4j 2.x',
      description: 'Remote code execution vulnerability affecting Log4j versions 2.0-2.14.1',
      severity: 'critical',
      source: 'Apache Security',
      category: 'vulnerability',
      timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      url: 'https://logging.apache.org/log4j',
      isPinned: true
    },
    {
      id: '2',
      title: 'HackerOne: $50k Bounty Program',
      description: 'New high-value bounty program for financial services platform',
      severity: 'high',
      source: 'HackerOne',
      category: 'bounty',
      timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
      url: 'https://hackerone.com',
      reward: 50000
    },
    {
      id: '3',
      title: 'APT Group Targeting Healthcare',
      description: 'Advanced persistent threat campaign using custom malware',
      severity: 'high',
      source: 'CISA',
      category: 'incident',
      timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    },
    {
      id: '4',
      title: 'Zero-Day in Chrome Browser',
      description: 'Memory corruption vulnerability in V8 JavaScript engine',
      severity: 'medium',
      source: 'Google Security',
      category: 'vulnerability',
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    },
    {
      id: '5',
      title: 'Bugcrowd: Mobile App Testing',
      description: 'iOS and Android security assessment opportunity',
      severity: 'medium',
      source: 'Bugcrowd',
      category: 'bounty',
      timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      reward: 15000
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'vulnerability': return <AlertTriangle className="w-4 h-4" />;
      case 'exploit': return <Shield className="w-4 h-4" />;
      case 'bounty': return <Bug className="w-4 h-4" />;
      case 'incident': return <Eye className="w-4 h-4" />;
      case 'malware': return <Shield className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  const displayFeeds = mockLiveFeeds.slice(0, maxItems);

  return (
    <Card className={`border-primary/20 ${className}`}>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live Threat Feed
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Real-time
            </Badge>
          </div>
        </CardHeader>
      )}
      <CardContent className={showHeader ? 'pt-0' : 'py-4'}>
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {displayFeeds.map((feed) => {
              const timeAgo = formatDistanceToNow(new Date(feed.timestamp), { addSuffix: true });
              
              return (
                <div 
                  key={feed.id} 
                  className={`p-3 rounded-lg border transition-all duration-300 hover-border-flow ${
                    feed.isPinned ? 'border-primary bg-primary/5' : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {getCategoryIcon(feed.category)}
                      <h4 className="font-medium text-sm truncate">{feed.title}</h4>
                      {feed.isPinned && <Zap className="w-3 h-3 text-primary flex-shrink-0" />}
                    </div>
                    <Badge className={`${getSeverityColor(feed.severity)} text-xs`}>
                      {feed.severity}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {feed.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {feed.source}
                      </Badge>
                      {feed.reward && (
                        <span className="flex items-center gap-1 text-green-500">
                          <DollarSign className="w-3 h-3" />
                          ${feed.reward.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {feed.url && (
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs hover-red-glow">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        
        <div className="mt-4 pt-3 border-t border-border">
          <Button variant="outline" size="sm" className="w-full hover-red-glow">
            View All Threat Intelligence
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}