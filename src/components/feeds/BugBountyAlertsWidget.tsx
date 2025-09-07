import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Shield, 
  Bug, 
  Eye, 
  TrendingUp,
  AlertTriangle,
  Globe,
  Search,
  Clock,
  ExternalLink
} from '@phosphor-icons/react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface BugBountyAlert {
  id: string
  platform: string
  company: string
  program: string
  minReward: number
  maxReward: number
  scope: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  newProgram: boolean
  updatedAt: string
}

export function BugBountyAlertsWidget() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock real-time bug bounty alerts
  const mockAlerts: BugBountyAlert[] = [
    {
      id: '1',
      platform: 'HackerOne',
      company: 'TechCorp',
      program: 'Web Application Security',
      minReward: 500,
      maxReward: 25000,
      scope: ['*.techcorp.com', 'api.techcorp.com', 'mobile app'],
      difficulty: 'intermediate',
      newProgram: true,
      updatedAt: new Date(Date.now() - 300000).toISOString()
    },
    {
      id: '2',
      platform: 'Bugcrowd',
      company: 'FinanceSecure',
      program: 'Banking Platform Review',
      minReward: 1000,
      maxReward: 50000,
      scope: ['bank.financesecure.com'],
      difficulty: 'expert',
      newProgram: false,
      updatedAt: new Date(Date.now() - 600000).toISOString()
    },
    {
      id: '3',
      platform: 'YesWeHack',
      company: 'HealthTech',
      program: 'Medical Device Security',
      minReward: 200,
      maxReward: 15000,
      scope: ['device.healthtech.com', 'api.healthtech.com'],
      difficulty: 'advanced',
      newProgram: false,
      updatedAt: new Date(Date.now() - 900000).toISOString()
    },
    {
      id: '4',
      platform: 'Intigriti',
      company: 'EduPlatform',
      program: 'Learning Management System',
      minReward: 100,
      maxReward: 5000,
      scope: ['*.eduplatform.com'],
      difficulty: 'beginner',
      newProgram: true,
      updatedAt: new Date(Date.now() - 1200000).toISOString()
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'expert': return 'bg-purple-500 text-white';
      case 'advanced': return 'bg-red-500 text-white';
      case 'intermediate': return 'bg-orange-500 text-white';
      case 'beginner': return 'bg-green-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'hackerone': return 'bg-blue-500 text-white';
      case 'bugcrowd': return 'bg-orange-500 text-white';
      case 'yeswehack': return 'bg-purple-500 text-white';
      case 'intigriti': return 'bg-green-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredAlerts = mockAlerts.filter(alert =>
    alert.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alert.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alert.platform.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Bug className="w-5 h-5 text-primary" />
            Bug Bounty Alerts
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {mockAlerts.length} Active
          </Badge>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-8 text-sm"
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {filteredAlerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`p-3 rounded-lg border transition-all duration-300 hover-border-flow ${
                alert.newProgram ? 'border-primary bg-primary/5' : 'border-border bg-card'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{alert.company}</h4>
                    {alert.newProgram && <Badge className="bg-green-500 text-white text-xs">NEW</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{alert.program}</p>
                </div>
                <Badge className={`${getPlatformColor(alert.platform)} text-xs`}>
                  {alert.platform}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span>${alert.minReward.toLocaleString()} - ${alert.maxReward.toLocaleString()}</span>
                </div>
                <Badge className={`${getDifficultyColor(alert.difficulty)} text-xs justify-self-end`}>
                  {alert.difficulty}
                </Badge>
              </div>

              <div className="mb-2">
                <div className="flex flex-wrap gap-1">
                  {alert.scope.slice(0, 2).map((scope) => (
                    <Badge key={scope} variant="outline" className="text-xs">
                      {scope}
                    </Badge>
                  ))}
                  {alert.scope.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{alert.scope.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{formatDistanceToNow(new Date(alert.updatedAt), { addSuffix: true })}</span>
                </div>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs hover-red-glow">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View
                </Button>
              </div>
            </div>
          ))}
          
          {filteredAlerts.length === 0 && (
            <div className="text-center py-6">
              <Bug className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No programs match your search' : 'No active bug bounty programs'}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-border">
          <Button variant="outline" size="sm" className="w-full hover-red-glow">
            View All Bug Bounty Programs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}