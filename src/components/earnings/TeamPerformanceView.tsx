import { useState } from 'react'
import { useKVWithFallback } from '@/lib/kv-fallback'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  TrendUp, 
  Star, 
  DollarSign, 
  Crown,
  Medal,
  Target,
  Calendar,
  BarChart,
  PieChart
} from '@phosphor-icons/react'
import { User } from '@/types/user'
import { Team, TeamMember } from '@/types/teams'
import { Earning, TeamEarningsAnalytics } from '@/types/earnings'

interface TeamPerformanceViewProps {
  currentUser: User
}

export function TeamPerformanceView({ currentUser }: TeamPerformanceViewProps) {
  const [teams] = useKVWithFallback<Team[]>('teams', [])
  const [earnings] = useKVWithFallback<Earning[]>(`earnings-${currentUser.id}`, [])
  const [teamAnalytics] = useKVWithFallback<TeamEarningsAnalytics[]>(`team-analytics-${currentUser.id}`, [])
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  // Get user's teams
  const userTeams = teams.filter(team => 
    team.members.some(member => member.userId === currentUser.id)
  )

  // Get team earnings for the user
  const teamEarnings = earnings.filter(earning => earning.teamId)

  // Calculate team performance metrics
  const teamPerformanceData = userTeams.map(team => {
    const teamEarningsForUser = teamEarnings.filter(earning => earning.teamId === team.id)
    const userMember = team.members.find(member => member.userId === currentUser.id)
    
    const totalEarnings = teamEarningsForUser.reduce((sum, earning) => sum + earning.amount, 0)
    const projectCount = new Set(teamEarningsForUser.map(earning => earning.projectId)).size
    
    return {
      team,
      userMember,
      totalEarnings,
      projectCount,
      averagePerProject: projectCount > 0 ? totalEarnings / projectCount : 0,
      lastActive: team.lastActive
    }
  }).sort((a, b) => b.totalEarnings - a.totalEarnings)

  const selectedTeamData = selectedTeam 
    ? teamPerformanceData.find(data => data.team.id === selectedTeam)
    : null

  const selectedTeamAnalytics = selectedTeam
    ? teamAnalytics.find(analytics => analytics.teamId === selectedTeam)
    : null

  const formatRole = (role: string) => {
    return role.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const getRoleIcon = (role: string) => {
    if (role.includes('lead') || role.includes('captain')) return <Crown className="h-4 w-4 text-accent" />
    if (role.includes('senior')) return <Medal className="h-4 w-4 text-primary" />
    return <Users className="h-4 w-4 text-muted-foreground" />
  }

  return (
    <div className="space-y-6">
      {/* Team Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamPerformanceData.map(({ team, userMember, totalEarnings, projectCount, averagePerProject }) => (
          <Card 
            key={team.id} 
            className={`cursor-pointer transition-all ${
              selectedTeam === team.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedTeam(selectedTeam === team.id ? null : team.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{team.name}</CardTitle>
                <Badge variant={team.status === 'active' ? 'default' : 'secondary'}>
                  {team.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {getRoleIcon(userMember?.role.name || '')}
                <span>{formatRole(userMember?.role.name || 'Member')}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Your Earnings</p>
                  <p className="text-lg font-semibold">${totalEarnings.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Projects</p>
                  <p className="text-lg font-semibold">{projectCount}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Team Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-accent" />
                    <span>{team.averageRating.toFixed(1)}</span>
                  </div>
                </div>
                <Progress value={(team.averageRating / 5) * 100} className="h-2" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">
                  {team.members.length} members
                </span>
                <span className="text-sm font-medium">
                  ${averagePerProject.toLocaleString()}/project
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {userTeams.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No teams joined yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Join a team to start collaborating and earning together
              </p>
              <Button>Browse Teams</Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed Team Analytics */}
      {selectedTeamData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-primary" />
              {selectedTeamData.team.name} - Detailed Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <DollarSign className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Team Earnings</p>
                          <p className="text-2xl font-bold">${selectedTeamData.team.totalEarnings.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent/10 rounded-lg">
                          <Target className="h-6 w-6 text-accent" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Success Rate</p>
                          <p className="text-2xl font-bold">
                            {((selectedTeamData.team.completedBounties / (selectedTeamData.team.completedBounties + selectedTeamData.team.activeContracts)) * 100 || 0).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary/10 rounded-lg">
                          <Users className="h-6 w-6 text-secondary-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Your Contribution</p>
                          <p className="text-2xl font-bold">
                            {selectedTeamData.userMember?.contribution.toFixed(1) || 0}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Earnings Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Your Share</span>
                          <span className="font-semibold">
                            ${selectedTeamData.totalEarnings.toLocaleString()} 
                            ({selectedTeamData.userMember?.earningsPercentage || 0}%)
                          </span>
                        </div>
                        <Progress 
                          value={selectedTeamData.userMember?.earningsPercentage || 0} 
                          className="h-3" 
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Based on {formatRole(selectedTeamData.userMember?.role.name || '')}</span>
                          <span>Fair distribution</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Last Project</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(selectedTeamData.lastActive).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Projects This Month</span>
                          <span className="font-semibold">
                            {teamEarnings.filter(e => 
                              e.teamId === selectedTeamData.team.id &&
                              new Date(e.earnedAt).getMonth() === new Date().getMonth()
                            ).length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Team Status</span>
                          <Badge variant={selectedTeamData.team.status === 'active' ? 'default' : 'secondary'}>
                            {selectedTeamData.team.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="members" className="space-y-4">
                <div className="grid gap-4">
                  {selectedTeamData.team.members
                    .sort((a, b) => b.contribution - a.contribution)
                    .map((member, index) => (
                    <Card key={member.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar>
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback>{member.username[0].toUpperCase()}</AvatarFallback>
                              </Avatar>
                              {index < 3 && (
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                                  <span className="text-xs font-bold text-accent-foreground">
                                    {index + 1}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{member.username}</p>
                              <div className="flex items-center gap-2">
                                {getRoleIcon(member.role.name)}
                                <span className="text-sm text-muted-foreground">
                                  {formatRole(member.role.name)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{member.contribution.toFixed(1)}%</p>
                            <p className="text-sm text-muted-foreground">
                              {member.earningsPercentage}% earnings share
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="projects" className="space-y-4">
                <div className="text-center py-8">
                  <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Project analytics coming soon</p>
                  <p className="text-sm text-muted-foreground">
                    Detailed project breakdown and performance metrics
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="trends" className="space-y-4">
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Trend analysis coming soon</p>
                  <p className="text-sm text-muted-foreground">
                    Monthly performance trends and forecasting
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}