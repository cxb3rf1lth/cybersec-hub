import { useState } from 'react';
import { BugBountyProgram, LiveThreatFeed, TeamHunt, PartnerRequest } from '@/hooks/useBugBountyIntegration';
import { useBugBountyIntegration } from '@/hooks/useBugBountyIntegration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BinaryRain } from '@/components/ui/BinaryRain';
import { CyberLoadingDots } from '@/components/ui/CyberLoadingDots';
import { 
  Shield, 
  Target, 
  Users, 
  TrendUp, 
  Globe, 
  MagnifyingGlass, 
  UserPlus, 
  CurrencyDollar,
  Clock,
  Warning,
  CheckCircle,
  ArrowSquareOut,
  Lightning,
  Database,
  Network,
  Eye
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface BugBountyPlatformProps {
  currentUserId: string
}

export function BugBountyPlatform({ currentUserId }: BugBountyPlatformProps) {
  const {
    programs = [],
    threatFeed = [],
    teamHunts = [],
    partnerRequests = [],
    integrations = [],
    isLoading = false,
    lastUpdate = Date.now(),
    joinTeamHunt,
    createPartnerRequest,
    respondToPartnerRequest,
    connectPlatform,
    syncPlatformData
  } = useBugBountyIntegration();

  const [activeTab, setActiveTab] = useState('programs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<BugBountyProgram | null>(null);
  const [showPartnerRequest, setShowPartnerRequest] = useState(false);

  const filteredPrograms = programs.filter(program =>
    program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    program.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    program.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingRequests = partnerRequests.filter(req => 
    req.toUserId === currentUserId && req.status === 'pending'
  );

  const handleJoinHunt = (huntId: string) => {
    joinTeamHunt(huntId, currentUserId);
    toast.success('Successfully joined team hunt!');
  };

  const handleCreatePartnerRequest = (programId: string) => {
    const program = programs.find(p => p.id === programId);
    if (!program) {return;}

    createPartnerRequest({
      fromUserId: currentUserId,
      fromUserName: 'Current User',
      toUserId: 'target-user',
      targetProgram: program.name,
      platform: program.platform,
      message: 'Would you like to collaborate on this bug bounty program?',
      skillsOffered: ['web-security', 'api-testing'],
      splitProposal: '50/50',
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    setShowPartnerRequest(false);
    toast.success('Partner request sent!');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'hackerone': return <Shield className="w-4 h-4 text-green-400" />;
      case 'bugcrowd': return <Target className="w-4 h-4 text-blue-400" />;
      case 'intigriti': return <Globe className="w-4 h-4 text-purple-400" />;
      case 'yeswehack': return <Eye className="w-4 h-4 text-red-400" />;
      case 'shodan': return <Network className="w-4 h-4 text-orange-400" />;
      case 'projectdiscovery': return <Database className="w-4 h-4 text-cyan-400" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.1 }}>
        <BinaryRain className="absolute inset-0" />
      </div>
      
      {/* Header with Real-time Stats */}
      <div className="glass-panel p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Bug Bounty Central
            </h1>
            <p className="text-muted-foreground">
              Integrated platform data • Last update: {new Date(lastUpdate).toLocaleTimeString()}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Live Programs</div>
              <div className="text-xl font-bold text-primary">{programs.length}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Active Threats</div>
              <div className="text-xl font-bold text-red-400">{threatFeed.length}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Team Hunts</div>
              <div className="text-xl font-bold text-accent">{teamHunts.length}</div>
            </div>
          </div>
        </div>

        {/* Platform Integration Status */}
        <div className="flex gap-2 flex-wrap">
          {integrations.map(integration => (
            <Badge
              key={integration.id}
              variant={integration.connected ? 'default' : 'secondary'}
              className={`glass-card border ${integration.connected ? 'border-green-500/30' : 'border-gray-500/30'}`}
            >
              {getPlatformIcon(integration.name.toLowerCase())}
              <span className="ml-1">{integration.name}</span>
              {integration.connected && <CheckCircle className="w-3 h-3 ml-1 text-green-400" />}
            </Badge>
          ))}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="glass-panel electric-border">
          <TabsTrigger value="programs" className="glass-button">
            <Target className="w-4 h-4 mr-2" />
            Programs
          </TabsTrigger>
          <TabsTrigger value="threats" className="glass-button">
            <Warning className="w-4 h-4 mr-2" />
            Threat Intel
          </TabsTrigger>
          <TabsTrigger value="hunts" className="glass-button">
            <Users className="w-4 h-4 mr-2" />
            Team Hunts
          </TabsTrigger>
          <TabsTrigger value="partners" className="glass-button">
            <UserPlus className="w-4 h-4 mr-2" />
            Partners
          </TabsTrigger>
          <TabsTrigger value="integrations" className="glass-button">
            <Lightning className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* Bug Bounty Programs */}
        <TabsContent value="programs" className="space-y-4">
          <div className="glass-card p-4">
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search programs by name, company, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 glass-button"
                />
              </div>
              <Button className="glass-button hover-red-glow">
                <Shield className="w-4 h-4 mr-2" />
                Sync All
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredPrograms.map(program => (
              <Card key={program.id} className="glass-card glass-hover electric-border cursor-pointer"
                    onClick={() => setSelectedProgram(program)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getPlatformIcon(program.platform)}
                      <div>
                        <CardTitle className="text-lg text-foreground">{program.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{program.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getSeverityColor(program.status === 'active' ? 'high' : 'low')}`}>
                        {program.status}
                      </Badge>
                      <Badge variant="outline" className="glass-button">
                        {program.type}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Bounty Range:</span>
                      <span className="font-semibold text-accent">{program.bountyRange}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Disclosed:</span>
                      <span className="font-semibold">{program.disclosed}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Verified:</span>
                      <span className="font-semibold text-green-400">{program.verified}</span>
                    </div>

                    <div className="flex gap-2 flex-wrap mt-3">
                      {program.scope.slice(0, 2).map((scope, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs glass-button">
                          {scope}
                        </Badge>
                      ))}
                      {program.scope.length > 2 && (
                        <Badge variant="secondary" className="text-xs glass-button">
                          +{program.scope.length - 2} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="glass-button hover-red-glow flex-1">
                        <ArrowSquareOut className="w-3 h-3 mr-1" />
                        View Program
                      </Button>
                      <Dialog open={showPartnerRequest} onOpenChange={setShowPartnerRequest}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="glass-button">
                            <UserPlus className="w-3 h-3 mr-1" />
                            Partner
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-panel-intense">
                          <DialogHeader>
                            <DialogTitle>Request Bug Bounty Partner</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              Send a collaboration request for {program.name}
                            </p>
                            <Button 
                              onClick={() => handleCreatePartnerRequest(program.id)}
                              className="w-full glass-button hover-red-glow"
                            >
                              Send Request
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Live Threat Intelligence */}
        <TabsContent value="threats" className="space-y-4">
          <Card className="glass-panel-intense">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Warning className="w-5 h-5 text-red-400" />
                Live Threat Intelligence Feed
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                Real-time updates from multiple sources
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3 relative">
                  <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.15 }}>
                    <BinaryRain className="absolute inset-0" />
                  </div>
                  {threatFeed.map(threat => (
                    <div key={threat.id} className="glass-card p-4 electric-border">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(threat.severity)}>
                            {threat.severity}
                          </Badge>
                          <Badge variant="outline" className="glass-button text-xs">
                            {threat.source}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(threat.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <h4 className="font-semibold text-foreground mb-2">{threat.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{threat.description}</p>
                      
                      <div className="flex gap-1 flex-wrap">
                        {Array.isArray(threat.tags) && threat.tags.slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs glass-button">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Hunts */}
        <TabsContent value="hunts" className="space-y-4">
          <div className="grid gap-4">
            {teamHunts.map(hunt => (
              <Card key={hunt.id} className="glass-card glass-hover">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{hunt.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{hunt.targetCompany}</p>
                    </div>
                    <Badge className={getSeverityColor(hunt.status === 'recruiting' ? 'medium' : 'high')}>
                      {hunt.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Team Size:</span>
                        <span className="ml-2 font-semibold">{hunt.currentMembers.length}/{hunt.maxMembers}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Bounty Pool:</span>
                        <span className="ml-2 font-semibold text-accent">{hunt.bountyPool}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="ml-2 font-semibold">30 days</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Platform:</span>
                        <span className="ml-2 font-semibold">{hunt.platform}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-2">Skills Required:</h4>
                      <div className="flex gap-1 flex-wrap">
                        {hunt.skillsRequired.map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs glass-button">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">{hunt.description}</p>

                    {hunt.status === 'recruiting' && (
                      <Button 
                        onClick={() => handleJoinHunt(hunt.id)}
                        className="w-full glass-button hover-red-glow"
                        disabled={hunt.currentMembers.length >= hunt.maxMembers}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Join Team Hunt
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Partner Requests */}
        <TabsContent value="partners" className="space-y-4">
          {pendingRequests.length > 0 && (
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Pending Partner Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingRequests.map(request => (
                    <div key={request.id} className="glass-card p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{request.fromUserName}</h4>
                          <p className="text-sm text-muted-foreground">{request.targetProgram}</p>
                        </div>
                        <Badge variant="outline" className="glass-button">
                          {request.splitProposal}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{request.message}</p>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => respondToPartnerRequest(request.id, 'accepted')}
                          className="glass-button hover-red-glow"
                        >
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => respondToPartnerRequest(request.id, 'declined')}
                          className="glass-button"
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Platform Integrations */}
        <TabsContent value="integrations" className="space-y-4">
          <div className="grid gap-4">
            {integrations.map(integration => (
              <Card key={integration.id} className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getPlatformIcon(integration.name.toLowerCase())}
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <p className="text-sm text-muted-foreground capitalize">{integration.type}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {integration.connected ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="glass-button">
                          Disconnected
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Last Sync:</span>
                      <span className="ml-2">{new Date(integration.lastSync).toLocaleString()}</span>
                    </div>
                    
                    <div className="text-sm">
                      <span className="text-muted-foreground">Rate Limits:</span>
                      <span className="ml-2">{integration.rateLimits.remaining}/{integration.rateLimits.requests} per {integration.rateLimits.period}</span>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        onClick={() => syncPlatformData(integration.id)}
                        className="glass-button hover-red-glow"
                        disabled={isLoading}
                      >
                        {isLoading ? <CyberLoadingDots /> : 'Sync Now'}
                      </Button>
                      
                      {!integration.connected && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => connectPlatform(integration.id)}
                          className="glass-button"
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Program Detail Modal */}
      {selectedProgram && (
        <Dialog open={!!selectedProgram} onOpenChange={() => setSelectedProgram(null)}>
          <DialogContent className="glass-panel-intense max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {getPlatformIcon(selectedProgram.platform)}
                {selectedProgram.name} - {selectedProgram.company}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Reward Structure</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedProgram.rewards).map(([severity, reward]) => (
                        <div key={severity} className="flex justify-between text-sm">
                          <span className="capitalize">{severity}:</span>
                          <span className="font-semibold">{reward}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Statistics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Disclosed:</span>
                        <span className="font-semibold">{selectedProgram.disclosed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Verified Bugs:</span>
                        <span className="font-semibold text-green-400">{selectedProgram.verified}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">In Scope</h4>
                    <div className="space-y-1">
                      {selectedProgram.scope.map((scope, idx) => (
                        <div key={idx} className="text-sm glass-button p-2 rounded">
                          {scope}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Out of Scope</h4>
                    <div className="space-y-1">
                      {selectedProgram.outOfScope.map((scope, idx) => (
                        <div key={idx} className="text-sm glass-card p-2 rounded text-muted-foreground">
                          {scope}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedProgram.description}</p>
              </div>
              
              <div className="flex gap-2">
                <Button className="glass-button hover-red-glow">
                  <ArrowSquareOut className="w-4 h-4 mr-2" />
                  View on {selectedProgram.platform}
                </Button>
                <Button variant="outline" className="glass-button">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Find Partners
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}