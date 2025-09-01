import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  X, 
  Users, 
  Plus, 
  UserPlus, 
  Crown, 
  Shield, 
  Wrench, 
  Code, 
  Eye,
  Trash,
  Settings,
  GitBranch,
  FileCode,
  Calendar,
  Mail,
  Target
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { TeamInfo, TeamMember, User, TeamProject, Template } from '@/types'
import { ProjectManagement } from './ProjectManagement'
import { format } from 'date-fns'

interface TeamDetailModalProps {
  team: TeamInfo
  currentUser: User
  onClose: () => void
  onTeamUpdated: (team: TeamInfo) => void
}

export function TeamDetailModal({ team, currentUser, onClose, onTeamUpdated }: TeamDetailModalProps) {
  const [teams, setTeams] = useKV<TeamInfo[]>('teams', [])
  const [templates] = useKV<Template[]>('templates', [])
  const [teamProjects] = useKV<TeamProject[]>('teamProjects', [])
  const [inviteEmail, setInviteEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState<TeamMember['role']>('developer')
  const [activeTab, setActiveTab] = useState('overview')
  const [showProjectManagement, setShowProjectManagement] = useState(false)

  const userMembership = team.members.find(member => member.id === currentUser.id)
  const canManage = userMembership?.permissions.canManagePermissions
  const canInvite = userMembership?.permissions.canInvite

  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />
      case 'maintainer':
        return <Wrench className="w-4 h-4 text-green-500" />
      case 'developer':
        return <Code className="w-4 h-4 text-purple-500" />
      default:
        return <Eye className="w-4 h-4 text-gray-500" />
    }
  }

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Email is required')
      return
    }

    // In a real app, this would send an invitation
    toast.success(`Invitation sent to ${inviteEmail}`)
    setInviteEmail('')
  }

  const handleRemoveMember = async (memberId: string) => {
    if (memberId === team.members.find(m => m.role === 'owner')?.id) {
      toast.error('Cannot remove team owner')
      return
    }

    const updatedTeam = {
      ...team,
      members: team.members.filter(member => member.id !== memberId)
    }

    const updatedTeams = teams.map(t => t.id === team.id ? updatedTeam : t)
    await setTeams(updatedTeams)
    onTeamUpdated(updatedTeam)
    toast.success('Member removed from team')
  }

  const handleRoleChange = async (memberId: string, newRole: TeamMember['role']) => {
    const permissions = {
      owner: {
        canEdit: true,
        canDelete: true,
        canInvite: true,
        canManagePermissions: true,
        canCreateBranches: true,
        canMergeBranches: true,
        canPublish: true
      },
      admin: {
        canEdit: true,
        canDelete: true,
        canInvite: true,
        canManagePermissions: true,
        canCreateBranches: true,
        canMergeBranches: true,
        canPublish: true
      },
      maintainer: {
        canEdit: true,
        canDelete: false,
        canInvite: true,
        canManagePermissions: false,
        canCreateBranches: true,
        canMergeBranches: true,
        canPublish: true
      },
      developer: {
        canEdit: true,
        canDelete: false,
        canInvite: false,
        canManagePermissions: false,
        canCreateBranches: true,
        canMergeBranches: false,
        canPublish: false
      },
      viewer: {
        canEdit: false,
        canDelete: false,
        canInvite: false,
        canManagePermissions: false,
        canCreateBranches: false,
        canMergeBranches: false,
        canPublish: false
      }
    }

    const updatedTeam = {
      ...team,
      members: team.members.map(member => 
        member.id === memberId 
          ? { ...member, role: newRole, permissions: permissions[newRole] }
          : member
      )
    }

    const updatedTeams = teams.map(t => t.id === team.id ? updatedTeam : t)
    await setTeams(updatedTeams)
    onTeamUpdated(updatedTeam)
    toast.success('Member role updated')
  }

  const getTeamTemplates = () => {
    return templates.filter(template => 
      template.team?.id === team.id || 
      template.collaboration?.allowedUsers.some(userId => 
        team.members.some(member => member.id === userId)
      )
    )
  }

  const getTeamProjects = () => {
    return teamProjects.filter(project => project.team.id === team.id)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{team.name}</h2>
              <p className="text-sm text-muted-foreground">{team.description}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="management">Planning</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Members</span>
                  </div>
                  <div className="text-2xl font-bold">{team.members.length}</div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <GitBranch className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">Projects</span>
                  </div>
                  <div className="text-2xl font-bold">{getTeamProjects().length}</div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileCode className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">Templates</span>
                  </div>
                  <div className="text-2xl font-bold">{getTeamTemplates().length}</div>
                </Card>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Team Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>{format(team.createdAt, 'PPP')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Visibility</span>
                    <Badge variant={team.isPublic ? 'default' : 'secondary'}>
                      {team.isPublic ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Owner</span>
                    <div className="flex items-center gap-2">
                      {team.members.find(m => m.role === 'owner') && (
                        <>
                          <Avatar className="w-4 h-4">
                            <img src={team.members.find(m => m.role === 'owner')!.avatar} alt="" />
                          </Avatar>
                          <span>{team.members.find(m => m.role === 'owner')!.username}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="members" className="space-y-4">
              {canInvite && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Invite Member</h3>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <Select value={selectedRole} onValueChange={(value: TeamMember['role']) => setSelectedRole(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="developer">Developer</SelectItem>
                        <SelectItem value="maintainer">Maintainer</SelectItem>
                        {canManage && <SelectItem value="admin">Admin</SelectItem>}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleInviteMember}>
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              )}

              <div className="space-y-2">
                {team.members.map(member => (
                  <Card key={member.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <img src={member.avatar} alt={member.username} />
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{member.username}</span>
                            {getRoleIcon(member.role)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>Joined {format(member.joinedAt, 'MMM yyyy')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {canManage && member.role !== 'owner' && (
                          <Select 
                            value={member.role} 
                            onValueChange={(value: TeamMember['role']) => handleRoleChange(member.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="viewer">Viewer</SelectItem>
                              <SelectItem value="developer">Developer</SelectItem>
                              <SelectItem value="maintainer">Maintainer</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        
                        {member.role === 'owner' && (
                          <Badge variant="secondary">Owner</Badge>
                        )}
                        
                        {canManage && member.role !== 'owner' && member.id !== currentUser.id && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Team Projects</h3>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Project
                </Button>
              </div>
              
              {getTeamProjects().length === 0 ? (
                <div className="text-center py-8">
                  <GitBranch className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No projects yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {getTeamProjects().map(project => (
                    <Card key={project.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{project.name}</h4>
                          <p className="text-sm text-muted-foreground">{project.description}</p>
                        </div>
                        <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Collaborative Templates</h3>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Template
                </Button>
              </div>
              
              {getTeamTemplates().length === 0 ? (
                <div className="text-center py-8">
                  <FileCode className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No collaborative templates yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {getTeamTemplates().map(template => (
                    <Card key={template.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{template.category}</Badge>
                            <Badge variant="outline">{template.difficulty}</Badge>
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div>v{template.version}</div>
                          <div>{format(template.updatedAt, 'MMM d')}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="management" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Project Planning & Management</h3>
                <Button 
                  onClick={() => setShowProjectManagement(true)} 
                  size="sm" 
                  className="gap-2"
                >
                  <Target className="w-4 h-4" />
                  Open Project Manager
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Active Projects</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {getTeamProjects().filter(p => p.status === 'active').length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Projects currently in development
                  </p>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">Milestones This Month</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {getTeamProjects().reduce((count, project) => 
                      count + project.roadmap.filter(milestone => 
                        new Date(milestone.dueDate).getMonth() === new Date().getMonth()
                      ).length, 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upcoming deadlines to track
                  </p>
                </Card>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Recent Project Activity</h4>
                {getTeamProjects().slice(0, 3).map(project => (
                  <Card key={project.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-sm">{project.name}</h5>
                        <p className="text-xs text-muted-foreground">{project.description}</p>
                      </div>
                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                    </div>
                  </Card>
                ))}
                
                {getTeamProjects().length === 0 && (
                  <div className="text-center py-6">
                    <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No projects yet</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>

      {/* Project Management Modal */}
      {showProjectManagement && (
        <ProjectManagement
          team={team}
          currentUser={currentUser}
          onClose={() => setShowProjectManagement(false)}
        />
      )}
    </div>
  )
}