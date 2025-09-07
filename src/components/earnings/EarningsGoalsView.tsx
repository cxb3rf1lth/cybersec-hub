import { useState } from 'react';
import { useKVWithFallback } from '@/lib/kv-fallback';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Target, 
  Plus, 
  Calendar, 
  DollarSign, 
  TrendUp,
  Edit,
  Trash,
  CheckCircle,
  Clock,
  AlertCircle
} from '@/lib/phosphor-icons-wrapper';
import { User } from '@/types/user';
import { EarningsGoal } from '@/types/earnings';
import { toast } from 'sonner';

interface EarningsGoalsViewProps {
  currentUser: User
}

export function EarningsGoalsView({ currentUser }: EarningsGoalsViewProps) {
  const [goals, setGoals] = useKVWithFallback<EarningsGoal[]>(`goals-${currentUser.id}`, []);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<EarningsGoal | null>(null);

  // Form state for creating/editing goals
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    deadline: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      targetAmount: '',
      deadline: '',
      category: '',
      priority: 'medium'
    });
  };

  const handleCreateGoal = () => {
    if (!formData.title || !formData.targetAmount || !formData.deadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newGoal: EarningsGoal = {
      id: Date.now().toString(),
      userId: currentUser.id,
      title: formData.title,
      description: formData.description,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: 0,
      currency: 'USD',
      deadline: formData.deadline,
      category: formData.category,
      priority: formData.priority,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    setGoals(current => [...current, newGoal]);
    setShowCreateDialog(false);
    resetForm();
    toast.success('Goal created successfully!');
  };

  const handleUpdateGoal = () => {
    if (!editingGoal || !formData.title || !formData.targetAmount || !formData.deadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedGoal: EarningsGoal = {
      ...editingGoal,
      title: formData.title,
      description: formData.description,
      targetAmount: parseFloat(formData.targetAmount),
      deadline: formData.deadline,
      category: formData.category,
      priority: formData.priority
    };

    setGoals(current => current.map(goal => 
      goal.id === editingGoal.id ? updatedGoal : goal
    ));
    setEditingGoal(null);
    resetForm();
    toast.success('Goal updated successfully!');
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(current => current.filter(goal => goal.id !== goalId));
    toast.success('Goal deleted successfully!');
  };

  const handleCompleteGoal = (goalId: string) => {
    setGoals(current => current.map(goal => 
      goal.id === goalId 
        ? { ...goal, status: 'completed', completedAt: new Date().toISOString() }
        : goal
    ));
    toast.success('Congratulations! Goal completed!');
  };

  const startEditGoal = (goal: EarningsGoal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description,
      targetAmount: goal.targetAmount.toString(),
      deadline: goal.deadline.split('T')[0], // Convert to date input format
      category: goal.category,
      priority: goal.priority
    });
  };

  const getGoalStatusIcon = (goal: EarningsGoal) => {
    if (goal.status === 'completed') {return <CheckCircle className="h-5 w-5 text-accent" />;}
    if (new Date(goal.deadline) < new Date()) {return <AlertCircle className="h-5 w-5 text-destructive" />;}
    return <Clock className="h-5 w-5 text-primary" />;
  };

  const getGoalStatusColor = (goal: EarningsGoal) => {
    if (goal.status === 'completed') {return 'bg-accent text-accent-foreground';}
    if (new Date(goal.deadline) < new Date()) {return 'bg-destructive text-destructive-foreground';}
    return 'bg-primary text-primary-foreground';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-primary text-primary-foreground';
      case 'low': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const activeGoals = goals.filter(goal => goal.status === 'active');
  const completedGoals = goals.filter(goal => goal.status === 'completed');
  const overdueGoals = activeGoals.filter(goal => new Date(goal.deadline) < new Date());

  // Calculate total progress
  const totalTargetAmount = activeGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrentAmount = activeGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Goals Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Goals</p>
                <p className="text-2xl font-bold text-foreground">{activeGoals.length}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Target</p>
                <p className="text-2xl font-bold text-foreground">${totalTargetAmount.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold text-foreground">{overallProgress.toFixed(1)}%</p>
              </div>
              <TrendUp className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-foreground">{completedGoals.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Goal Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Goals</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Earn $10,000 from bug bounties"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your goal and strategy..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Target Amount *</label>
                  <Input
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    placeholder="10000"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Deadline *</label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug-bounty">Bug Bounty</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateGoal} className="flex-1">Create Goal</Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {activeGoals.length > 0 ? (
          activeGoals.map(goal => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const isOverdue = new Date(goal.deadline) < new Date();
            const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

            return (
              <Card key={goal.id} className={isOverdue ? 'border-destructive' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getGoalStatusIcon(goal)}
                        <h3 className="text-lg font-semibold">{goal.title}</h3>
                        <Badge className={getPriorityColor(goal.priority)}>
                          {goal.priority}
                        </Badge>
                      </div>
                      {goal.description && (
                        <p className="text-muted-foreground mb-3">{goal.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditGoal(goal)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <p className="text-xl font-bold">
                        ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                      </p>
                      <Progress value={progress} className="mt-2" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Deadline</p>
                      <p className="text-lg font-semibold">
                        {new Date(goal.deadline).toLocaleDateString()}
                      </p>
                      <p className={`text-sm ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {isOverdue ? 'Overdue' : `${daysLeft} days left`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="text-lg font-semibold">{goal.category || 'General'}</p>
                      {progress >= 100 && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteGoal(goal.id)}
                          className="mt-2"
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No active goals yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Set goals to track your earnings progress and stay motivated
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-accent" />
              Completed Goals ({completedGoals.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedGoals.map(goal => (
              <div key={goal.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/10">
                <div>
                  <p className="font-medium">{goal.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Completed {goal.completedAt ? new Date(goal.completedAt).toLocaleDateString() : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${goal.targetAmount.toLocaleString()}</p>
                  <Badge className="bg-accent text-accent-foreground">Completed</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Edit Goal Dialog */}
      {editingGoal && (
        <Dialog open={!!editingGoal} onOpenChange={() => setEditingGoal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Target Amount *</label>
                  <Input
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Deadline *</label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug-bounty">Bug Bounty</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdateGoal} className="flex-1">Update Goal</Button>
                <Button variant="outline" onClick={() => setEditingGoal(null)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}