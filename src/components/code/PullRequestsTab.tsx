import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, GitPullRequest, Clock, CheckCircle, X, User, Calendar, GitBranch, GitMerge } from '@phosphor-icons/react'
import { Repository, User as UserType, PullRequest } from '@/types/user'
import { toast } from 'sonner'

interface PullRequestsTabProps {
  repository: Repository
  currentUser: UserType
  isOwner: boolean
}

export function PullRequestsTab({ repository, currentUser, isOwner }: PullRequestsTabProps) {
  const [repositories, setRepositories] = useKV<Repository[]>('repositories', [])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed' | 'merged'>('all')
  
  const [newPR, setNewPR] = useState({
    title: '',
    description: '',
    sourceBranch: 'main',
    targetBranch: 'main'
  })

  const pullRequests = repository.pullRequests || []
  
  const filteredPRs = pullRequests.filter(pr => {
    if (filterStatus === 'all') return true
    return pr.status === filterStatus
  })

  const handleCreatePR = () => {
    if (!newPR.title.trim()) {
      toast.error('Pull request title is required')
      return
    }

    if (newPR.sourceBranch === newPR.targetBranch) {
      toast.error('Source and target branches cannot be the same')
      return
    }

    const pr: PullRequest = {
      id: `pr-${Date.now()}`,
      title: newPR.title.trim(),
      description: newPR.description.trim(),
      authorId: currentUser.id,
      sourceBranch: newPR.sourceBranch,
      targetBranch: newPR.targetBranch,
      status: 'open',
      reviewers: [],
      reviews: [],
      filesChanged: [],
      commits: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setRepositories(prev => prev.map(repo => 
      repo.id === repository.id 
        ? { ...repo, pullRequests: [pr, ...repo.pullRequests] }
        : repo
    ))

    setShowCreateDialog(false)
    setNewPR({ title: '', description: '', sourceBranch: 'main', targetBranch: 'main' })
    toast.success('Pull request created successfully')
  }

  const handleStatusChange = (prId: string, newStatus: 'open' | 'closed' | 'merged') => {
    setRepositories(prev => prev.map(repo => 
      repo.id === repository.id 
        ? {
            ...repo,
            pullRequests: repo.pullRequests.map(pr => 
              pr.id === prId 
                ? { 
                    ...pr, 
                    status: newStatus,
                    updatedAt: new Date().toISOString(),
                    mergedAt: newStatus === 'merged' ? new Date().toISOString() : undefined
                  }
                : pr
            )
          }
        : repo
    ))

    toast.success(`Pull request ${newStatus}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <GitPullRequest className="w-4 h-4 text-green-500" />
      case 'closed': return <X className="w-4 h-4 text-red-500" />
      case 'merged': return <GitMerge className="w-4 h-4 text-purple-500" />
      case 'draft': return <Clock className="w-4 h-4 text-yellow-500" />
      default: return <GitPullRequest className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500'
      case 'closed': return 'bg-red-500'
      case 'merged': return 'bg-purple-500'
      case 'draft': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-foreground">Pull Requests</h2>
          <div className="flex gap-2">
            <Badge variant={filterStatus === 'all' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilterStatus('all')}>
              All ({pullRequests.length})
            </Badge>
            <Badge variant={filterStatus === 'open' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilterStatus('open')}>
              Open ({pullRequests.filter(pr => pr.status === 'open').length})
            </Badge>
            <Badge variant={filterStatus === 'merged' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilterStatus('merged')}>
              Merged ({pullRequests.filter(pr => pr.status === 'merged').length})
            </Badge>
            <Badge variant={filterStatus === 'closed' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilterStatus('closed')}>
              Closed ({pullRequests.filter(pr => pr.status === 'closed').length})
            </Badge>
          </div>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Pull Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Pull Request</DialogTitle>
              <DialogDescription>
                Propose changes to merge into the main branch.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newPR.title}
                  onChange={(e) => setNewPR(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief description of the changes"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPR.description}
                  onChange={(e) => setNewPR(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the changes and motivation"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="source">Source Branch</Label>
                  <Select value={newPR.sourceBranch} onValueChange={(value) => setNewPR(prev => ({ ...prev, sourceBranch: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {repository.branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.name}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="target">Target Branch</Label>
                  <Select value={newPR.targetBranch} onValueChange={(value) => setNewPR(prev => ({ ...prev, targetBranch: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {repository.branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.name}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePR}>
                Create Pull Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pull Requests List */}
      <div className="flex-1 overflow-auto">
        {filteredPRs.length > 0 ? (
          <div className="space-y-4">
            {filteredPRs.map((pr) => (
              <Card key={pr.id} className="hover:bg-muted/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(pr.status)}
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{pr.title}</CardTitle>
                        <CardDescription>{pr.description}</CardDescription>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <GitBranch className="w-4 h-4" />
                            <span>{pr.sourceBranch} → {pr.targetBranch}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className={`text-white ${getStatusColor(pr.status)}`}
                      >
                        {pr.status}
                      </Badge>
                      {(isOwner || pr.authorId === currentUser.id) && pr.status === 'open' && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(pr.id, 'merged')}
                          >
                            Merge
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(pr.id, 'closed')}
                          >
                            Close
                          </Button>
                        </div>
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
                        <span>opened {formatDate(pr.createdAt)}</span>
                      </div>
                      {pr.mergedAt && (
                        <div className="flex items-center gap-1">
                          <GitMerge className="w-4 h-4" />
                          <span>merged {formatDate(pr.mergedAt)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{pr.commits.length} commits</span>
                      <span>{pr.filesChanged.length} files changed</span>
                      {pr.reviews.length > 0 && (
                        <span>{pr.reviews.length} reviews</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
            <div>
              <GitPullRequest className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No {filterStatus === 'all' ? '' : filterStatus} pull requests</p>
              <p className="text-sm">Pull requests help you collaborate on code changes.</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowCreateDialog(true)}>
                Create your first pull request
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}