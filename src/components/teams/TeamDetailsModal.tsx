import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Team, User, TeamApplication, TeamInvitation } from '@/types'
import { 
  Users, 
  TrendingUp, 
  Star, 
  Calendar,
  MapPin,
  Shield,
  Settings,
  UserPlus,
  DollarSign,
  Trophy,
  Clock
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface TeamDetailsModalProps {
  team: Team
  currentUser: User
  onClose: () => void
}

export function TeamDetailsModal({ team, currentUser, onClose }: TeamDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [applications] = useKV<TeamApplication[]>('teamApplications', [])
  const [invitations] = useKV<TeamInvitation[]>('teamInvitations', [])
  
  const isMember = team.members.some(member => member.userId === currentUser.id)
  const isLeader = team.leaderId === currentUser.id
  const currentMember = team.members.find(member => member.userId === currentUser.id)
  
  const teamApplications = applications.filter(app => 
    app.teamId === team.id && app.status === 'pending'
  )

  const canManageTeam = isLeader || (currentMember && 
    currentMember.permissions.includes('team-settings'))

  const handleJoinTeam = () => {
    if (team.applicationRequired) {
      // Open application modal
      toast.info('Application required - redirecting to application form')
    } else {
      // Direct join
      toast.success('Joined team successfully!')
    }
  }

  const handleLeaveTeam = () => {
    toast.success('Left team successfully')
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-2xl">{team.name}</DialogTitle>
              {team.verified && (
                <Badge variant="secondary">Verified</Badge>
              )}
              <Badge variant="outline" className="capitalize">
                {team.type.replace('-', ' ')}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              {!isMember && (
                <Button onClick={handleJoinTeam}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {team.applicationRequired ? 'Apply' : 'Join'}
                </Button>
              )}
              {isMember && !isLeader && (
                <Button variant="outline" onClick={handleLeaveTeam}>
                  Leave Team
                </Button>
              )}
              {canManageTeam && (
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            {canManageTeam && (
              <TabsTrigger value="manage">Manage</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Team Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">{team.members.length}</div>
                  <div className="text-sm text-muted-foreground">Members</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-accent mx-auto mb-2" />
                  <div className="text-2xl font-bold">${team.totalEarnings.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Earnings</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{team.completedBounties}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{team.averageRating.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">About</h3>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{team.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Specializations</h4>
                    <div className="flex flex-wrap gap-2">
                      {team.specialization.map(spec => (
                        <Badge key={spec} variant="secondary">
                          {spec.replace('-', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Details</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {team.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {team.location}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Created {new Date(team.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        {team.privacy} team
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {(team.minExperience > 0 || team.requiredCertifications.length > 0) && (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Requirements</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {team.minExperience > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Minimum {team.minExperience} years of experience
                      </p>
                    )}
                    {team.requiredCertifications.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Required certifications:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {team.requiredCertifications.map(cert => (
                            <Badge key={cert} variant="outline">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Team Members ({team.members.length}/{team.maxMembers})</h3>
              <Progress value={(team.members.length / team.maxMembers) * 100} className="w-32" />
            </div>

            <div className="grid gap-4">
              {team.members.map(member => (
                <Card key={member.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{member.username}</h4>
                          <p className="text-sm text-muted-foreground">
                            {member.role.name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{member.earningsPercentage}%</p>
                          <p className="text-xs text-muted-foreground">Earnings Share</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{member.contribution}</p>
                          <p className="text-xs text-muted-foreground">Contribution</p>
                        </div>
                        <Badge 
                          variant={member.status === 'active' ? 'default' : 'secondary'}
                        >
                          {member.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {member.specializations.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {member.specializations.map(spec => (
                            <Badge key={spec} variant="outline" className="text-xs">
                              {spec.replace('-', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-4">
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Earnings Overview</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">
                      ${team.totalEarnings.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Earned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {team.activeContracts}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Contracts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {team.completedBounties}
                    </div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500">
                      {team.averageRating.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-semibold">Earnings Distribution</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {team.members.map(member => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.username}</p>
                          <p className="text-sm text-muted-foreground">{member.role.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{member.earningsPercentage}%</p>
                        <p className="text-sm text-muted-foreground">
                          ${((team.totalEarnings * member.earningsPercentage) / 100).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {canManageTeam && (
            <TabsContent value="manage" className="space-y-4">
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Pending Applications</h3>
                </CardHeader>
                <CardContent>
                  {teamApplications.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No pending applications
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {teamApplications.map(application => (
                        <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={application.applicantAvatar} />
                              <AvatarFallback>
                                {application.applicantUsername.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{application.applicantUsername}</h4>
                              <p className="text-sm text-muted-foreground">
                                Applied for {application.desiredRole}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              Review
                            </Button>
                            <Button size="sm">
                              Accept
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}