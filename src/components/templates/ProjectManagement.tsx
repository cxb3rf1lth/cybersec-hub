import { useState } from 'react';
import { useKVWithFallback } from '@/lib/kv-fallback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Calendar, 
  Target, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Users,
  GitBranch,
  X,
  Edit3,
  Trash
} from '@/lib/phosphor-icons-wrapper';
import { toast } from 'sonner';
import { 
  TeamProject, 
  ProjectMilestone, 
  ProjectTask, 
  TeamInfo, 
  TeamMember, 
  User 
} from '@/types';
import { format, addDays } from 'date-fns';

interface ProjectManagementProps {
  team: TeamInfo
  currentUser: User
  onClose: () => void
}

export function ProjectManagement({ team, currentUser, onClose }: ProjectManagementProps) {
  const [teamProjects, setTeamProjects] = useKVWithFallback<TeamProject[]>('teamProjects', []);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProject, setSelectedProject] = useState<TeamProject | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateMilestone, setShowCreateMilestone] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<ProjectMilestone | null>(null);

  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    isPublic: true
  });

  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    description: '',
    dueDate: format(addDays(new Date(), 30), 'yyyy-MM-dd')
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as ProjectTask['priority'],
    assigneeId: '',
    estimatedHours: 0
  });

  const teamProjects_filtered = teamProjects.filter(project => project.team.id === team.id);

  const handleCreateProject = async () => {
    if (!projectForm.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    const newProject: TeamProject = {
      id: Date.now().toString(),
      name: projectForm.name,
      description: projectForm.description,
      team,
      templates: [],
      repositories: [],
      createdAt: new Date(),
      isPublic: projectForm.isPublic,
      status: 'planning',
      roadmap: []
    };

    await setTeamProjects(prev => [...prev, newProject]);
    setProjectForm({ name: '', description: '', isPublic: true });
    setShowCreateProject(false);
    setSelectedProject(newProject);
    toast.success('Project created successfully!');
  };

  const handleCreateMilestone = async () => {
    if (!milestoneForm.title.trim() || !selectedProject) {
      toast.error('Title is required');
      return;
    }

    const newMilestone: ProjectMilestone = {
      id: Date.now().toString(),
      title: milestoneForm.title,
      description: milestoneForm.description,
      dueDate: new Date(milestoneForm.dueDate),
      status: 'planning',
      assignees: [],
      tasks: [],
      progress: 0
    };

    const updatedProject = {
      ...selectedProject,
      roadmap: [...selectedProject.roadmap, newMilestone]
    };

    const updatedProjects = teamProjects.map(p => 
      p.id === selectedProject.id ? updatedProject : p
    );

    await setTeamProjects(updatedProjects);
    setSelectedProject(updatedProject);
    setMilestoneForm({ title: '', description: '', dueDate: format(addDays(new Date(), 30), 'yyyy-MM-dd') });
    setShowCreateMilestone(false);
    toast.success('Milestone created successfully!');
  };

  const handleCreateTask = async () => {
    if (!taskForm.title.trim() || !selectedMilestone || !selectedProject) {
      toast.error('Task title is required');
      return;
    }

    const assignee = taskForm.assigneeId ? 
      team.members.find(member => member.id === taskForm.assigneeId) : undefined;

    const newTask: ProjectTask = {
      id: Date.now().toString(),
      title: taskForm.title,
      description: taskForm.description,
      assignee,
      status: 'todo',
      priority: taskForm.priority,
      labels: [],
      createdAt: new Date(),
      estimatedHours: taskForm.estimatedHours || undefined
    };

    const updatedMilestone = {
      ...selectedMilestone,
      tasks: [...selectedMilestone.tasks, newTask]
    };

    const updatedProject = {
      ...selectedProject,
      roadmap: selectedProject.roadmap.map(milestone => 
        milestone.id === selectedMilestone.id ? updatedMilestone : milestone
      )
    };

    const updatedProjects = teamProjects.map(p => 
      p.id === selectedProject.id ? updatedProject : p
    );

    await setTeamProjects(updatedProjects);
    setSelectedProject(updatedProject);
    setSelectedMilestone(updatedMilestone);
    setTaskForm({ title: '', description: '', priority: 'medium', assigneeId: '', estimatedHours: 0 });
    setShowCreateTask(false);
    toast.success('Task created successfully!');
  };

  const updateTaskStatus = async (taskId: string, newStatus: ProjectTask['status']) => {
    if (!selectedProject || !selectedMilestone) {return;}

    const updatedMilestone = {
      ...selectedMilestone,
      tasks: selectedMilestone.tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    };

    // Calculate progress
    const completedTasks = updatedMilestone.tasks.filter(t => t.status === 'done').length;
    const totalTasks = updatedMilestone.tasks.length;
    updatedMilestone.progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const updatedProject = {
      ...selectedProject,
      roadmap: selectedProject.roadmap.map(milestone => 
        milestone.id === selectedMilestone.id ? updatedMilestone : milestone
      )
    };

    const updatedProjects = teamProjects.map(p => 
      p.id === selectedProject.id ? updatedProject : p
    );

    await setTeamProjects(updatedProjects);
    setSelectedProject(updatedProject);
    setSelectedMilestone(updatedMilestone);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'overdue': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-muted';
    }
  };

  const getPriorityIcon = (priority: ProjectTask['priority']) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low': return <Clock className="w-4 h-4 text-green-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Project Management</h2>
              <p className="text-sm text-muted-foreground">{team.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowCreateProject(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {!selectedProject ? (
            /* Project List */
            <div className="p-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {teamProjects_filtered.map(project => (
                  <Card 
                    key={project.id} 
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{project.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {project.description}
                          </p>
                        </div>
                        <Badge variant="outline" className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          <span>{project.roadmap.length} milestones</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{format(project.createdAt, 'MMM yyyy')}</span>
                        </div>
                      </div>
                      
                      <div className="flex -space-x-2">
                        {team.members.slice(0, 4).map(member => (
                          <Avatar key={member.id} className="w-6 h-6 border-2 border-background">
                            <img src={member.avatar} alt={member.username} />
                          </Avatar>
                        ))}
                        {team.members.length > 4 && (
                          <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                            <span className="text-xs">+{team.members.length - 4}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {teamProjects_filtered.length === 0 && (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first project to start collaborating
                  </p>
                  <Button onClick={() => setShowCreateProject(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Project
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Project Detail */
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedProject(null)}
                >
                  ← Back to Projects
                </Button>
                <div>
                  <h3 className="text-lg font-semibold">{selectedProject.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">Milestones</span>
                      </div>
                      <div className="text-2xl font-bold">{selectedProject.roadmap.length}</div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">Completed</span>
                      </div>
                      <div className="text-2xl font-bold">
                        {selectedProject.roadmap.filter(m => m.status === 'completed').length}
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium">Team Members</span>
                      </div>
                      <div className="text-2xl font-bold">{team.members.length}</div>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="roadmap" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Project Roadmap</h4>
                    <Button onClick={() => setShowCreateMilestone(true)} size="sm" className="gap-1">
                      <Plus className="w-4 h-4" />
                      Add Milestone
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {selectedProject.roadmap.map(milestone => (
                      <Card 
                        key={milestone.id} 
                        className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedMilestone(milestone)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h5 className="font-medium">{milestone.title}</h5>
                            <p className="text-sm text-muted-foreground">{milestone.description}</p>
                          </div>
                          <Badge variant="outline" className={getStatusColor(milestone.status)}>
                            {milestone.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{Math.round(milestone.progress)}%</span>
                          </div>
                          <Progress value={milestone.progress} className="h-2" />
                        </div>
                        
                        <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Due {format(milestone.dueDate, 'MMM d, yyyy')}</span>
                          </div>
                          <span>{milestone.tasks.length} tasks</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="tasks" className="space-y-4">
                  {selectedMilestone ? (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{selectedMilestone.title}</h4>
                          <p className="text-sm text-muted-foreground">Tasks</p>
                        </div>
                        <Button onClick={() => setShowCreateTask(true)} size="sm" className="gap-1">
                          <Plus className="w-4 h-4" />
                          Add Task
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {selectedMilestone.tasks.map(task => (
                          <Card key={task.id} className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={task.status === 'done'}
                                  onChange={(e) => updateTaskStatus(task.id, e.target.checked ? 'done' : 'todo')}
                                  className="mt-1"
                                />
                                <div>
                                  <h6 className="font-medium">{task.title}</h6>
                                  <p className="text-sm text-muted-foreground">{task.description}</p>
                                  {task.assignee && (
                                    <div className="flex items-center gap-2 mt-2">
                                      <Avatar className="w-5 h-5">
                                        <img src={task.assignee.avatar} alt={task.assignee.username} />
                                      </Avatar>
                                      <span className="text-sm">{task.assignee.username}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getPriorityIcon(task.priority)}
                                <Badge variant="outline" className="text-xs">
                                  {task.status}
                                </Badge>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Select a milestone to view tasks</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        {/* Modals */}
        {showCreateProject && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-6 space-y-4">
              <h3 className="text-lg font-semibold">Create New Project</h3>
              <div>
                <Label>Project Name</Label>
                <Input
                  value={projectForm.name}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enterprise Security Framework"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Comprehensive security framework for enterprise environments"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCreateProject(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateProject}>Create</Button>
              </div>
            </Card>
          </div>
        )}

        {showCreateMilestone && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-6 space-y-4">
              <h3 className="text-lg font-semibold">Create Milestone</h3>
              <div>
                <Label>Title</Label>
                <Input
                  value={milestoneForm.title}
                  onChange={(e) => setMilestoneForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Authentication Module"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={milestoneForm.description}
                  onChange={(e) => setMilestoneForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Implement multi-factor authentication system"
                />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={milestoneForm.dueDate}
                  onChange={(e) => setMilestoneForm(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCreateMilestone(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateMilestone}>Create</Button>
              </div>
            </Card>
          </div>
        )}

        {showCreateTask && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-6 space-y-4">
              <h3 className="text-lg font-semibold">Create Task</h3>
              <div>
                <Label>Title</Label>
                <Input
                  value={taskForm.title}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Implement OAuth integration"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add OAuth 2.0 authentication flow"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Priority</Label>
                  <Select 
                    value={taskForm.priority} 
                    onValueChange={(value: ProjectTask['priority']) => 
                      setTaskForm(prev => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Assignee</Label>
                  <Select 
                    value={taskForm.assigneeId} 
                    onValueChange={(value) => setTaskForm(prev => ({ ...prev, assigneeId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      {team.members.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCreateTask(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTask}>Create</Button>
              </div>
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
}