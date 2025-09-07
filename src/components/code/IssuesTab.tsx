import { useState } from 'react';
import { useKVWithFallback } from '@/lib/kv-fallback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Bug, Clock, CheckCircle, X, User, Calendar, MessageCircle } from '@phosphor-icons/react';
import { Repository, User as UserType, Issue } from '@/types/user';
import { toast } from 'sonner';

interface IssuesTabProps {
  repository: Repository
  currentUser: UserType
  isOwner: boolean
}

export function IssuesTab({ repository, currentUser, isOwner }: IssuesTabProps) {
  const [repositories, setRepositories] = useKVWithFallback<Repository[]>('repositories', []);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');
  
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    labels: ''
  });

  const issues = repository.issues || [];
  
  const filteredIssues = issues.filter(issue => {
    if (filterStatus === 'all') {return true;}
    return issue.status === filterStatus;
  });

  const handleCreateIssue = () => {
    if (!newIssue.title.trim()) {
      toast.error('Issue title is required');
      return;
    }

    const issue: Issue = {
      id: `issue-${Date.now()}`,
      title: newIssue.title.trim(),
      description: newIssue.description.trim(),
      authorId: currentUser.id,
      labels: newIssue.labels.split(',').map(l => l.trim()).filter(Boolean),
      status: 'open',
      priority: newIssue.priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: []
    };

    setRepositories(prev => prev.map(repo => 
      repo.id === repository.id 
        ? { ...repo, issues: [issue, ...repo.issues] }
        : repo
    ));

    setShowCreateDialog(false);
    setNewIssue({ title: '', description: '', priority: 'medium', labels: '' });
    toast.success('Issue created successfully');
  };

  const handleStatusChange = (issueId: string, newStatus: 'open' | 'closed') => {
    setRepositories(prev => prev.map(repo => 
      repo.id === repository.id 
        ? {
            ...repo,
            issues: repo.issues.map(issue => 
              issue.id === issueId 
                ? { 
                    ...issue, 
                    status: newStatus,
                    updatedAt: new Date().toISOString(),
                    closedAt: newStatus === 'closed' ? new Date().toISOString() : undefined
                  }
                : issue
            )
          }
        : repo
    ));

    toast.success(`Issue ${newStatus === 'closed' ? 'closed' : 'reopened'}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Bug className="w-4 h-4 text-red-500" />;
      case 'closed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Bug className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-foreground">Issues</h2>
          <div className="flex gap-2">
            <Badge variant={filterStatus === 'all' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilterStatus('all')}>
              All ({issues.length})
            </Badge>
            <Badge variant={filterStatus === 'open' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilterStatus('open')}>
              Open ({issues.filter(i => i.status === 'open').length})
            </Badge>
            <Badge variant={filterStatus === 'closed' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilterStatus('closed')}>
              Closed ({issues.filter(i => i.status === 'closed').length})
            </Badge>
          </div>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Issue
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Issue</DialogTitle>
              <DialogDescription>
                Report a bug, request a feature, or start a discussion.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newIssue.title}
                  onChange={(e) => setNewIssue(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief description of the issue"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newIssue.description}
                  onChange={(e) => setNewIssue(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the issue"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newIssue.priority} onValueChange={(value: any) => setNewIssue(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="labels">Labels</Label>
                  <Input
                    id="labels"
                    value={newIssue.labels}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, labels: e.target.value }))}
                    placeholder="bug, security, enhancement"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateIssue}>
                Create Issue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Issues List */}
      <div className="flex-1 overflow-auto">
        {filteredIssues.length > 0 ? (
          <div className="space-y-4">
            {filteredIssues.map((issue) => (
              <Card key={issue.id} className="hover:bg-muted/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(issue.status)}
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{issue.title}</CardTitle>
                        <CardDescription>{issue.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(issue.priority)}`} title={`${issue.priority} priority`} />
                      {(isOwner || issue.authorId === currentUser.id) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(issue.id, issue.status === 'open' ? 'closed' : 'open')}
                        >
                          {issue.status === 'open' ? 'Close' : 'Reopen'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{currentUser.username}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>opened {formatDate(issue.createdAt)}</span>
                      </div>
                      {issue.comments.length > 0 && (
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{issue.comments.length} comments</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {issue.labels.map((label) => (
                        <Badge key={label} variant="secondary" className="text-xs">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
            <div>
              <Bug className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No {filterStatus === 'all' ? '' : filterStatus} issues</p>
              <p className="text-sm">Issues help track bugs, feature requests, and discussions.</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowCreateDialog(true)}>
                Create your first issue
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}