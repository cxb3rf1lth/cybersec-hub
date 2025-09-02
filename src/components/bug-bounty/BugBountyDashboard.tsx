import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { 
  Shield, 
  Target, 
  Users, 
  DollarSign, 
  Clock, 
  TrendingUp,
  ExternalLink,
  Globe,
  Zap,
  Activity,
  Award,
  Search,
  Filter,
  Plus,
  MessageCircle,
  Calendar,
  FileText,
  UserPlus,
  Gear,
  Key
} from '@phosphor-icons/react'
import { useBugBountyPlatforms } from '@/hooks/useBugBountyPlatforms'
import { useTeamHunts } from '@/hooks/useTeamHunts'
import { useBugBountyIntegration } from '@/hooks/useBugBountyIntegration'
import { APISettings } from '@/components/settings/APISettings'
import { User } from '@/types/user'
import { toast } from 'sonner'

interface BugBountyDashboardProps {
  currentUser: User
  onTabChange: (tab: string) => void
}

export function BugBountyDashboard({ currentUser, onTabChange }: BugBountyDashboardProps) {
  const { platforms, programs, liveFeed } = useBugBountyPlatforms()
  const { teamHunts, partnerRequests, joinTeamHunt, createPartnerRequest } = useTeamHunts()
  const { integrations, programs: realPrograms, threatFeed } = useBugBountyIntegration()
  const [activeTab, setActiveTab] = useState('overview')
  const [showBinaryRain, setShowBinaryRain] = useState(false)
  const [showAPISettings, setShowAPISettings] = useState(false)

  // Use real data when available, fallback to sample data
  const allPrograms = realPrograms.length > 0 ? realPrograms : programs
  const allThreats = threatFeed.length > 0 ? threatFeed : liveFeed

  const activePlatforms = platforms.filter(p => p.isActive)
  const connectedIntegrations = integrations.filter(i => i.connected)
  const publicPrograms = allPrograms.filter(p => p.status === 'active')
  const activeHunts = teamHunts.filter(h => h.status === 'active')
  const openPartnerRequests = partnerRequests.filter(r => r.status === 'open')

  const totalBountyValue = allPrograms.reduce((total, program) => {
    const maxReward = Math.max(
      parseInt(program.rewards.critical.split(' - ')[1]?.replace(/[^0-9]/g, '') || '0'),
      parseInt(program.rewards.high.split(' - ')[1]?.replace(/[^0-9]/g, '') || '0')
    )
    return total + maxReward
  }, 0)
  }, 0)

  const handleJoinHunt = (huntId: string) => {
    joinTeamHunt(huntId, currentUser)
    toast.success('Successfully joined team hunt!')
  }

  const handleCreatePartnerRequest = () => {
    // This would open a modal/form in a real implementation
    toast.success('Partner request created!')
  }

  const renderBinaryRain = () => {
    if (!showBinaryRain) return null
    
    return (
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
        <div className="binary-rain-container immersive">
          {Array.from({ length: 50 }, (_, i) => (
            <div key={i} className="binary-column" style={{
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${4 + Math.random() * 2}s`
            }}>
              {Array.from({ length: 20 }, (_, j) => (
                <div key={j} className="binary-char">
                  {Math.random() > 0.5 ? '1' : '0'}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 relative">
      {renderBinaryRain()}
      
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bug Bounty Hub</h1>
          <p className="text-muted-foreground">
            Professional bug bounty hunting platform with team collaboration
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showBinaryRain ? "default" : "outline"}
            size="sm"
            onClick={() => setShowBinaryRain(!showBinaryRain)}
            className="hover-red-glow"
          >
            <Activity className="h-4 w-4 mr-2" />
            {showBinaryRain ? 'Disable' : 'Enable'} Matrix Mode
          </Button>
          <Button 
            onClick={() => setShowAPISettings(true)}
            variant="outline" 
            size="sm"
            className="hover-red-glow"
          >
            <Key className="w-4 h-4 mr-2" />
            API Settings
          </Button>
          <Button onClick={handleCreatePartnerRequest} className="hover-red-glow">
            <UserPlus className="h-4 w-4 mr-2" />
            Find Partner
          </Button>
        </div>
      </div>

      {showAPISettings && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-auto bg-background border border-border rounded-lg">
            <div className="p-6">
              <APISettings onClose={() => setShowAPISettings(false)} />
            </div>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="relative z-10">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="team-hunts">Team Hunts</TabsTrigger>
          <TabsTrigger value="partners">Partner Requests</TabsTrigger>
          <TabsTrigger value="live-feed">Live Feed</TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-1">
            <Gear className="w-3 h-3" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="hover-border-flow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Shield className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{connectedIntegrations.length}</p>
                    <p className="text-xs text-muted-foreground">Connected APIs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-border-flow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Target className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{publicPrograms.length}</p>
                    <p className="text-xs text-muted-foreground">Available Programs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-border-flow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{activeHunts.length}</p>
                    <p className="text-xs text-muted-foreground">Active Team Hunts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-border-flow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">${(totalBountyValue / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-muted-foreground">Total Bounty Value</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-border-flow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Zap className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{allThreats.length}</p>
                    <p className="text-xs text-muted-foreground">Live Threats</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {liveFeed.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50">
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{item.platform}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start hover-red-glow" variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Discover New Programs
                </Button>
                <Button className="w-full justify-start hover-red-glow" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Join Team Hunt
                </Button>
                <Button className="w-full justify-start hover-red-glow" variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Find Collaboration Partner
                </Button>
                <Button className="w-full justify-start hover-red-glow" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Bug Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Connected Platforms</h2>
            <Button className="hover-red-glow">
              <Plus className="h-4 w-4 mr-2" />
              Add Platform
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map((platform) => (
              <Card key={platform.id} className="hover-border-flow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Globe className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{platform.displayName}</CardTitle>
                        <Badge variant={platform.isActive ? "default" : "secondary"}>
                          {platform.integration.status}
                        </Badge>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{platform.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Active Programs:</span>
                      <span className="font-medium">{platform.stats.activeProgramsCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Researchers:</span>
                      <span className="font-medium">{platform.stats.totalResearchers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg Response:</span>
                      <span className="font-medium">{platform.stats.averageResponseTime}h</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 hover-red-glow" variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Platform
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="programs" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Bug Bounty Programs</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {programs.map((program) => (
              <Card key={program.id} className="hover-border-flow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <Target className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{program.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{program.company}</p>
                      </div>
                    </div>
                    <Badge variant={program.type === 'public' ? "default" : "secondary"}>
                      {program.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {program.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Max Bounty:</span>
                      <span className="font-bold text-primary">
                        ${program.rewards.bountyTable[0]?.maxAmount.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Avg Response:</span>
                      <span className="text-sm">{program.stats.responseTime}h</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Participants:</span>
                      <span className="text-sm">{program.stats.participantCount.toLocaleString()}</span>
                    </div>

                    {program.teamHuntEligible && (
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        Team Hunt Eligible
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button className="flex-1 hover-red-glow" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Program
                    </Button>
                    {program.teamHuntEligible && (
                      <Button className="hover-red-glow" variant="outline">
                        <Users className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="team-hunts" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Active Team Hunts</h2>
            <Button className="hover-red-glow">
              <Plus className="h-4 w-4 mr-2" />
              Create Hunt
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {teamHunts.map((hunt) => (
              <Card key={hunt.id} className="hover-border-flow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{hunt.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{hunt.programName}</p>
                    </div>
                    <Badge variant={hunt.status === 'active' ? "default" : "secondary"}>
                      {hunt.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {hunt.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Team:</span>
                      <span className="text-sm font-medium">{hunt.teamName}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Participants:</span>
                      <span className="text-sm">{hunt.participants.length}/{hunt.maxParticipants}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress:</span>
                        <span>{hunt.objectives.filter(o => o.status === 'completed').length}/{hunt.objectives.length} objectives</span>
                      </div>
                      <Progress 
                        value={(hunt.objectives.filter(o => o.status === 'completed').length / hunt.objectives.length) * 100} 
                        className="h-2"
                      />
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>Duration:</span>
                      <span>{Math.ceil(hunt.duration / 24)} days</span>
                    </div>

                    {hunt.results && (
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">${hunt.results.totalBounty.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button 
                      className="flex-1 hover-red-glow" 
                      variant="outline"
                      onClick={() => handleJoinHunt(hunt.id)}
                      disabled={hunt.participants.length >= hunt.maxParticipants}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      {hunt.participants.some(p => p.userId === currentUser.id) ? 'Joined' : 'Join Hunt'}
                    </Button>
                    <Button className="hover-red-glow" variant="outline">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="partners" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Partner Requests</h2>
            <Button onClick={handleCreatePartnerRequest} className="hover-red-glow">
              <Plus className="h-4 w-4 mr-2" />
              Create Request
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {partnerRequests.map((request) => (
              <Card key={request.id} className="hover-border-flow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{request.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">by @{request.requesterUsername}</p>
                    </div>
                    <Badge variant={request.status === 'open' ? "default" : "secondary"}>
                      {request.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {request.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Role:</span>
                      <Badge variant="outline">{request.targetRole}</Badge>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm">Revenue Share:</span>
                      <span className="text-sm font-medium">{request.revenueSharePercentage}%</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm">Duration:</span>
                      <span className="text-sm">{request.expectedDuration}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm">Commitment:</span>
                      <span className="text-sm">{request.timeCommitment}</span>
                    </div>

                    {request.programName && (
                      <div className="flex justify-between">
                        <span className="text-sm">Program:</span>
                        <span className="text-sm font-medium">{request.programName}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {request.requiredSkills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {request.requiredSkills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{request.requiredSkills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button className="flex-1 hover-red-glow" variant="outline">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Apply
                    </Button>
                    <Button className="hover-red-glow" variant="outline">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="live-feed" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Live Bug Bounty Feed</h2>
            <Button variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              Real-time Updates
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                <div className="p-6 space-y-4">
                  {liveFeed.map((item) => (
                    <div key={item.id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-muted/50 hover-border-flow">
                      <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-2 ${
                        item.priority === 'high' ? 'bg-destructive' :
                        item.priority === 'medium' ? 'bg-primary' : 'bg-muted-foreground'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">{item.platform}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium text-foreground mb-1">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        {item.data.bountyAmount && (
                          <div className="flex items-center gap-2 mt-2">
                            <DollarSign className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                              ${item.data.bountyAmount.toLocaleString()}
                            </span>
                            {item.data.severity && (
                              <Badge variant={item.data.severity === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                                {item.data.severity}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations.map((integration) => {
                const isConnected = integration.connected
                const hasErrors = syncErrors[integration.name.toLowerCase().split(' ')[0]]
                
                return (
                  <Card key={integration.id} className="glass-card hover-border-flow">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            isConnected 
                              ? hasErrors 
                                ? 'bg-yellow-400 animate-pulse' 
                                : 'bg-green-400'
                              : 'bg-muted-foreground'
                          }`} />
                          <div>
                            <CardTitle className="text-lg">{integration.name}</CardTitle>
                            <p className="text-sm text-muted-foreground capitalize">
                              {integration.type.replace('-', ' ')} platform
                            </p>
                          </div>
                        </div>
                        <Badge variant={isConnected ? 'default' : 'secondary'}>
                          {isConnected ? 'Connected' : 'Disconnected'}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-1">
                        {integration.dataTypes.map((type) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                      
                      {isConnected && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Last sync:</span>
                            <span>{integration.lastSync ? new Date(integration.lastSync).toLocaleDateString() : 'Never'}</span>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Rate limit:</span>
                            <span className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              {integration.rateLimits.remaining}/{integration.rateLimits.requests}
                            </span>
                          </div>
                          
                          <Progress 
                            value={(integration.rateLimits.remaining / integration.rateLimits.requests) * 100} 
                            className="h-2"
                          />
                        </div>
                      )}
                      
                      {hasErrors && (
                        <div className="flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-sm text-yellow-300">
                          <Zap className="w-4 h-4" />
                          <span>Sync issues detected</span>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        {isConnected ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => syncPlatformData(integration.id)}
                              disabled={isLoading}
                              className="flex-1"
                            >
                              <Activity className="w-3 h-3 mr-1" />
                              Sync
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => disconnectPlatform(integration.id)}
                              className="flex-1"
                            >
                              Disconnect
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => setShowAPISettings(true)}
                            className="w-full hover-red-glow"
                            size="sm"
                          >
                            <Key className="w-3 h-3 mr-2" />
                            Configure
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Integration Status Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-400">
                      {integrations.filter(i => i.connected).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Connected</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-muted-foreground">
                      {integrations.filter(i => !i.connected).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Available</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {realPrograms.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Programs</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {threatFeed.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Threats</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}