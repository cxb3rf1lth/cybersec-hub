import { useState } from 'react';
import { useKVWithFallback } from '@/lib/kv-fallback';
import { Plus, Calendar, User, AlertCircle, Clock, MessageCircle } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { CreateTaskModal } from '@/components/projects/CreateTaskModal';
import { TaskDetailsModal } from '@/components/projects/TaskDetailsModal';
import { Project, Task, User as UserType } from '@/types';

interface ProjectKanbanProps {
  project: Project
  currentUser: UserType
  onUpdateProject: (project: Project) => void
}

export function ProjectKanban({ project, currentUser, onUpdateProject }: ProjectKanbanProps) {
  const [allUsers] = useKVWithFallback<UserType[]>('allUsers', []);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const columns = [
    { id: 'todo', title: 'To Do', status: 'todo' as const },
    { id: 'in-progress', title: 'In Progress', status: 'in-progress' as const },
    { id: 'review', title: 'Review', status: 'review' as const },
    { id: 'completed', title: 'Completed', status: 'completed' as const }
  ];

  const handleCreateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: []
    };

    const updatedProject = {
      ...project,
      tasks: [...project.tasks, newTask],
      updatedAt: new Date().toISOString()
    };

    onUpdateProject(updatedProject);
    setShowCreateTaskModal(false);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    const updatedProject = {
      ...project,
      tasks: project.tasks.map(task => task.id === updatedTask.id ? updatedTask : task),
      updatedAt: new Date().toISOString()
    };

    onUpdateProject(updatedProject);
    setSelectedTask(updatedTask);
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: Task['status']) => {
    e.preventDefault();
    if (!draggedTask) {return;}

    const updatedTask = {
      ...draggedTask,
      status: newStatus,
      updatedAt: new Date().toISOString()
    };

    handleUpdateTask(updatedTask);
    setDraggedTask(null);
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const isOverdue = (task: Task) => {
    return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  };

  const TaskCard = ({ task }: { task: Task }) => {
    const assignee = task.assigneeId ? allUsers.find(u => u.id === task.assigneeId) : null;
    const overdue = isOverdue(task);

    return (
      <Card
        className="cursor-pointer hover:bg-muted/50 transition-colors mb-3"
        draggable
        onDragStart={() => handleDragStart(task)}
        onClick={() => setSelectedTask(task)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium leading-tight">
              {task.title}
            </CardTitle>
            <Badge 
              variant="outline" 
              className={`text-xs ${getPriorityColor(task.priority)}`}
            >
              {task.priority}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          {task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.labels.slice(0, 2).map((label) => (
                <Badge key={label} variant="secondary" className="text-xs">
                  {label}
                </Badge>
              ))}
              {task.labels.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{task.labels.length - 2}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {task.dueDate && (
                <div className={`flex items-center gap-1 text-xs ${
                  overdue ? 'text-red-400' : 'text-muted-foreground'
                }`}>
                  <Calendar className="w-3 h-3" />
                  {new Date(task.dueDate).toLocaleDateString()}
                  {overdue && <AlertCircle className="w-3 h-3" />}
                </div>
              )}
              
              {task.estimatedHours && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {task.estimatedHours}h
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {task.comments.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageCircle className="w-3 h-3" />
                  {task.comments.length}
                </div>
              )}

              {assignee && (
                <Avatar className="w-5 h-5">
                  <AvatarImage src={assignee.avatar} />
                  <AvatarFallback className="text-xs">
                    {assignee.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full flex gap-6 p-6 overflow-x-auto">
        {columns.map((column) => {
          const columnTasks = project.tasks.filter(task => task.status === column.status);
          
          return (
            <div 
              key={column.id} 
              className="flex-shrink-0 w-80"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.status)}
            >
              <div className="bg-muted/30 rounded-lg p-4 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{column.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {columnTasks.length}
                    </Badge>
                  </div>
                  {column.status === 'todo' && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setShowCreateTaskModal(true)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {columnTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                  
                  {columnTasks.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">No tasks</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showCreateTaskModal && (
        <CreateTaskModal
          project={project}
          currentUser={currentUser}
          onClose={() => setShowCreateTaskModal(false)}
          onCreateTask={handleCreateTask}
        />
      )}

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          project={project}
          currentUser={currentUser}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={handleUpdateTask}
        />
      )}
    </div>
  );
}