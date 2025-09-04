import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Plus, Calendar, Users, Target, Filter, Search, MoreHorizontal } from '@/lib/phosphor-icons-wrapper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'
import { ProjectDetailsModal } from '@/components/projects/ProjectDetailsModal'
import { ProjectKanban } from '@/components/projects/ProjectKanban'
import { Team } from '@/types'
import type { Project } from '@/types/projects'
import type { User } from '@/types/user'

interface ProjectsViewProps {
  currentUser: User
}

export function ProjectsView({ currentUser }: ProjectsViewProps) {
  const [projects, setProjects] = useKV<Project[]>('projects', [])
  const [teams] = useKV<Team[]>('teams', [])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [view, setView] = useState<'grid' | 'kanban'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // Get user's teams for project access
  const userTeams = (teams ?? []).filter(team =>
    team.members.some(member => member.userId === currentUser.id)
  )

  // Filter projects user has access to
  const accessibleProjects = (projects ?? []).filter(project => {
    const isOwner = project.ownerId === currentUser.id
    const isTeamMember = userTeams.some(team => team.id === project.teamId)
    const isPublic = project.visibility === 'public'
    return isOwner || isTeamMember || isPublic
  })

  // Apply filters
  const filteredProjects = accessibleProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    const matchesType = typeFilter === 'all' || project.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const handleCreateProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: `project-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  setProjects((current = []) => [...current, newProject])
    setShowCreateModal(false)
  }

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'planning': return 'bg-blue-500/20 text-blue-300'
      case 'active': return 'bg-green-500/20 text-green-300'
      case 'on-hold': return 'bg-yellow-500/20 text-yellow-300'
      case 'completed': return 'bg-purple-500/20 text-purple-300'
      case 'cancelled': return 'bg-red-500/20 text-red-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  const getTypeColor = (type: Project['type']) => {
    switch (type) {
      case 'bug-bounty': return 'bg-orange-500/20 text-orange-300'
      case 'research': return 'bg-cyan-500/20 text-cyan-300'
      case 'development': return 'bg-blue-500/20 text-blue-300'
      case 'red-team': return 'bg-red-500/20 text-red-300'
      case 'blue-team': return 'bg-blue-600/20 text-blue-400'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  const calculateProgress = (project: Project) => {
    if (project.tasks.length === 0) return 0
    const completedTasks = project.tasks.filter(task => task.status === 'completed').length
    return Math.round((completedTasks / project.tasks.length) * 100)
  }

  if (view === 'kanban' && selectedProject) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setSelectedProject(null)}
              >
                ← Back to Projects
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{selectedProject.name}</h1>
                <p className="text-muted-foreground">{selectedProject.description}</p>
              </div>
            </div>
          </div>
        </div>
        <ProjectKanban 
          project={selectedProject} 
          currentUser={currentUser}
          onUpdateProject={(updatedProject) => {
            setProjects(current => 
              (current ?? []).map(p => p.id === updatedProject.id ? updatedProject : p)
            )
            setSelectedProject(updatedProject)
          }}
        />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Projects</h1>
            <p className="text-muted-foreground">Manage your security projects and team workflows</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={view} onValueChange={(value: 'grid' | 'kanban') => setView(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid View</SelectItem>
                <SelectItem value="kanban">Kanban View</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="bug-bounty">Bug Bounty</SelectItem>
              <SelectItem value="research">Research</SelectItem>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="red-team">Red Team</SelectItem>
              <SelectItem value="blue-team">Blue Team</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Create your first project to get started'}
            </p>
            {!searchQuery && statusFilter === 'all' && typeFilter === 'all' && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const team = (teams ?? []).find(t => t.id === project.teamId)
              const progress = calculateProgress(project)
              const overdueTasks = project.tasks.filter(task => 
                task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
              ).length

              return (
                <Card 
                  key={project.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedProject(project)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="ml-2">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            setSelectedProject(project)
                            setView('kanban')
                          }}>
                            Open Kanban
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            // Handle edit project
                          }}>
                            Edit Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3">
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                      <Badge className={getTypeColor(project.type)}>
                        {project.type}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {project.endDate ? 
                            new Date(project.endDate).toLocaleDateString() : 
                            'No deadline'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {team ? `${team.members.length} members` : 'Personal'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {project.tasks.length} tasks
                      </span>
                      {overdueTasks > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {overdueTasks} overdue
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateProjectModal
          currentUser={currentUser}
          teams={userTeams}
          onClose={() => setShowCreateModal(false)}
          onCreateProject={handleCreateProject}
        />
      )}

      {selectedProject && view === 'grid' && (
        <ProjectDetailsModal
          project={selectedProject}
          currentUser={currentUser}
          onClose={() => setSelectedProject(null)}
          onUpdateProject={(updatedProject) => {
            setProjects(current => 
              (current ?? []).map(p => p.id === updatedProject.id ? updatedProject : p)
            )
            setSelectedProject(updatedProject)
          }}
        />
      )}
    </div>
  )
}