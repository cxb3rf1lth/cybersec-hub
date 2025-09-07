import { useState, useEffect } from 'react'
import { useKVWithFallback } from '@/lib/kv-fallback'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  GitBranch, 
  Plus, 
  Save, 
  Eye, 
  Code, 
  History, 
  Users,
  ArrowRight,
  GitPullRequest,
  GitCommit,
  FileText,
  X,
  Check,
  Clock
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { 
  Template, 
  TemplateFile, 
  TemplateBranch, 
  TemplateCommit, 
  PullRequest, 
  User, 
  TeamInfo,
  FileChange 
} from '@/types'
import { format } from 'date-fns'

interface CollaborativeEditorProps {
  template: Template
  currentUser: User
  onClose: () => void
  onTemplateUpdated: (template: Template) => void
}

export function CollaborativeEditor({ template, currentUser, onClose, onTemplateUpdated }: CollaborativeEditorProps) {
  const [templates, setTemplates] = useKVWithFallback<Template[]>('templates', [])
  const [pullRequests, setPullRequests] = useKVWithFallback<PullRequest[]>('pullRequests', [])
  const [activeTab, setActiveTab] = useState('editor')
  const [selectedBranch, setSelectedBranch] = useState(template.branches?.[0]?.name || 'main')
  const [selectedFile, setSelectedFile] = useState<TemplateFile | null>(template.files[0] || null)
  const [fileContent, setFileContent] = useState(selectedFile?.content || '')
  const [commitMessage, setCommitMessage] = useState('')
  const [showCreateBranch, setShowCreateBranch] = useState(false)
  const [newBranchName, setNewBranchName] = useState('')
  const [showCreatePR, setShowCreatePR] = useState(false)
  const [prTitle, setPrTitle] = useState('')
  const [prDescription, setPrDescription] = useState('')
  const [targetBranch, setTargetBranch] = useState('main')
  
  // Simulated real-time collaborators
  const [activeCollaborators] = useState([
    { id: '2', username: 'alex_sec', avatar: '/api/placeholder/32/32', lastSeen: new Date() },
    { id: '3', username: 'sarah_cyber', avatar: '/api/placeholder/32/32', lastSeen: new Date() }
  ])

  const currentBranch = template.branches?.find(b => b.name === selectedBranch)
  const canEdit = template.collaboration?.permissions[currentUser.id] !== 'read'
  const canCreateBranches = template.collaboration?.permissions[currentUser.id] === 'admin' || 
                           template.collaboration?.permissions[currentUser.id] === 'write'

  useEffect(() => {
    if (selectedFile) {
      setFileContent(selectedFile.content)
    }
  }, [selectedFile])

  const handleFileSelect = (file: TemplateFile) => {
    if (selectedFile && fileContent !== selectedFile.content) {
      // Auto-save current changes
      saveFileChanges()
    }
    setSelectedFile(file)
  }

  const saveFileChanges = () => {
    if (!selectedFile || !canEdit) return

    const updatedFiles = template.files.map(file => 
      file.id === selectedFile.id 
        ? { 
            ...file, 
            content: fileContent,
            lastModifiedBy: {
              id: currentUser.id,
              username: currentUser.username,
              avatar: currentUser.avatar
            },
            lastModified: new Date()
          }
        : file
    )

    const updatedTemplate = { ...template, files: updatedFiles }
    onTemplateUpdated(updatedTemplate)
    toast.success('File saved')
  }

  const handleCommit = async () => {
    if (!commitMessage.trim()) {
      toast.error('Commit message is required')
      return
    }

    const changes: FileChange[] = template.files.map(file => {
      const currentFile = selectedFile?.id === file.id ? 
        { ...file, content: fileContent } : file
      
      return {
        type: 'modified' as const,
        filePath: file.path,
        content: currentFile.content,
        oldContent: file.content,
        linesAdded: Math.floor(Math.random() * 10),
        linesRemoved: Math.floor(Math.random() * 5)
      }
    }).filter(change => change.content !== change.oldContent)

    const newCommit: TemplateCommit = {
      id: Date.now().toString(),
      message: commitMessage,
      author: {
        id: currentUser.id,
        username: currentUser.username,
        avatar: currentUser.avatar
      },
      timestamp: new Date(),
      changes,
      parentCommit: currentBranch?.commits[0]?.id
    }

    const updatedBranches = template.branches?.map(branch => 
      branch.name === selectedBranch
        ? { ...branch, commits: [newCommit, ...branch.commits], lastModified: new Date() }
        : branch
    ) || []

    const updatedTemplate = { 
      ...template, 
      branches: updatedBranches,
      updatedAt: new Date()
    }

    const updatedTemplates = templates.map(t => t.id === template.id ? updatedTemplate : t)
    await setTemplates(updatedTemplates)
    onTemplateUpdated(updatedTemplate)
    setCommitMessage('')
    toast.success('Changes committed successfully')
  }

  const handleCreateBranch = async () => {
    if (!newBranchName.trim()) {
      toast.error('Branch name is required')
      return
    }

    const newBranch: TemplateBranch = {
      id: Date.now().toString(),
      name: newBranchName,
      description: `Branch created for ${newBranchName}`,
      createdBy: {
        id: currentUser.id,
        username: currentUser.username,
        avatar: currentUser.avatar
      },
      createdAt: new Date(),
      lastModified: new Date(),
      isMain: false,
      commits: currentBranch?.commits || [],
      status: 'active'
    }

    const updatedBranches = [...(template.branches || []), newBranch]
    const updatedTemplate = { ...template, branches: updatedBranches }

    const updatedTemplates = templates.map(t => t.id === template.id ? updatedTemplate : t)
    await setTemplates(updatedTemplates)
    onTemplateUpdated(updatedTemplate)
    setNewBranchName('')
    setShowCreateBranch(false)
    setSelectedBranch(newBranch.name)
    toast.success('Branch created successfully')
  }

  const handleCreatePullRequest = async () => {
    if (!prTitle.trim()) {
      toast.error('Pull request title is required')
      return
    }

    const newPR: PullRequest = {
      id: Date.now().toString(),
      title: prTitle,
      description: prDescription,
      sourceBranch: selectedBranch,
      targetBranch,
      author: {
        id: currentUser.id,
        username: currentUser.username,
        avatar: currentUser.avatar
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'open',
      reviewers: [],
      comments: [],
      changes: currentBranch?.commits[0]?.changes || []
    }

    await setPullRequests(prev => [...prev, newPR])
    setPrTitle('')
    setPrDescription('')
    setShowCreatePR(false)
    toast.success('Pull request created successfully')
  }

  const getTemplatePullRequests = () => {
    return pullRequests.filter(pr => 
      template.branches?.some(branch => 
        branch.name === pr.sourceBranch || branch.name === pr.targetBranch
      )
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">{template.name}</h2>
              <Badge variant="secondary">v{template.version}</Badge>
            </div>
            
            {/* Active Collaborators */}
            <div className="flex items-center gap-2 ml-4">
              <div className="flex -space-x-2">
                {activeCollaborators.map(collaborator => (
                  <div key={collaborator.id} className="relative">
                    <Avatar className="w-6 h-6 border-2 border-background">
                      <img src={collaborator.avatar} alt={collaborator.username} />
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-background" />
                  </div>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {activeCollaborators.length} online
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Branch Selector */}
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-40">
                <div className="flex items-center gap-1">
                  <GitBranch className="w-4 h-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {template.branches?.map(branch => (
                  <SelectItem key={branch.name} value={branch.name}>
                    <div className="flex items-center gap-2">
                      <span>{branch.name}</span>
                      {branch.isMain && <Badge variant="outline" className="text-xs">main</Badge>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {canCreateBranches && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowCreateBranch(true)}
                className="gap-1"
              >
                <Plus className="w-4 h-4" />
                Branch
              </Button>
            )}
            
            <Button variant="outline" size="sm" onClick={() => setShowCreatePR(true)} className="gap-1">
              <GitPullRequest className="w-4 h-4" />
              PR
            </Button>
            
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r bg-muted/50 flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 m-2">
                <TabsTrigger value="editor" className="text-xs">Files</TabsTrigger>
                <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
                <TabsTrigger value="prs" className="text-xs">PRs</TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="flex-1 overflow-auto p-2 space-y-2">
                {template.files.map(file => (
                  <div
                    key={file.id}
                    className={`p-2 rounded cursor-pointer hover:bg-background transition-colors ${
                      selectedFile?.id === file.id ? 'bg-background border border-border' : ''
                    }`}
                    onClick={() => handleFileSelect(file)}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm truncate">{file.name}</span>
                    </div>
                    {file.lastModifiedBy && (
                      <div className="flex items-center gap-1 mt-1">
                        <Avatar className="w-3 h-3">
                          <img src={file.lastModifiedBy.avatar} alt="" />
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {file.lastModifiedBy.username}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="history" className="flex-1 overflow-auto p-2 space-y-2">
                {currentBranch?.commits.map(commit => (
                  <div key={commit.id} className="p-2 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <GitCommit className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{commit.message}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Avatar className="w-4 h-4">
                        <img src={commit.author.avatar} alt="" />
                      </Avatar>
                      <span>{commit.author.username}</span>
                      <span>{format(commit.timestamp, 'MMM d')}</span>
                    </div>
                  </div>
                )) || <p className="text-sm text-muted-foreground p-2">No commits yet</p>}
              </TabsContent>

              <TabsContent value="prs" className="flex-1 overflow-auto p-2 space-y-2">
                {getTemplatePullRequests().map(pr => (
                  <div key={pr.id} className="p-2 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <GitPullRequest className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">{pr.title}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <span>{pr.sourceBranch}</span>
                      <ArrowRight className="w-3 h-3" />
                      <span>{pr.targetBranch}</span>
                    </div>
                    <Badge 
                      variant={pr.status === 'open' ? 'default' : pr.status === 'merged' ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {pr.status}
                    </Badge>
                  </div>
                )) || <p className="text-sm text-muted-foreground p-2">No pull requests</p>}
              </TabsContent>
            </Tabs>
          </div>

          {/* Editor */}
          <div className="flex-1 flex flex-col">
            {selectedFile && (
              <>
                {/* File Header */}
                <div className="p-3 border-b bg-muted/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium">{selectedFile.name}</span>
                    <Badge variant="outline" className="text-xs">{selectedFile.language}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!canEdit && <Badge variant="secondary">Read Only</Badge>}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={saveFileChanges}
                      disabled={!canEdit}
                      className="gap-1"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </Button>
                  </div>
                </div>

                {/* Code Editor */}
                <div className="flex-1 p-4">
                  <Textarea
                    value={fileContent}
                    onChange={(e) => setFileContent(e.target.value)}
                    placeholder="Start coding..."
                    className="w-full h-full resize-none font-mono text-sm"
                    disabled={!canEdit}
                  />
                </div>

                {/* Commit Bar */}
                {canEdit && (
                  <div className="p-3 border-t bg-muted/50">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Commit message"
                        value={commitMessage}
                        onChange={(e) => setCommitMessage(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={handleCommit} disabled={!commitMessage.trim()}>
                        <GitCommit className="w-4 h-4 mr-1" />
                        Commit
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Create Branch Modal */}
        {showCreateBranch && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-6 space-y-4">
              <h3 className="text-lg font-semibold">Create New Branch</h3>
              <div>
                <Label>Branch Name</Label>
                <Input
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="feature/new-exploit"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCreateBranch(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBranch}>Create</Button>
              </div>
            </Card>
          </div>
        )}

        {/* Create PR Modal */}
        {showCreatePR && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold">Create Pull Request</h3>
              <div>
                <Label>Title</Label>
                <Input
                  value={prTitle}
                  onChange={(e) => setPrTitle(e.target.value)}
                  placeholder="Add new exploitation technique"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={prDescription}
                  onChange={(e) => setPrDescription(e.target.value)}
                  placeholder="Describe your changes..."
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>From Branch</Label>
                  <Input value={selectedBranch} disabled />
                </div>
                <div className="flex-1">
                  <Label>To Branch</Label>
                  <Select value={targetBranch} onValueChange={setTargetBranch}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {template.branches?.filter(b => b.name !== selectedBranch).map(branch => (
                        <SelectItem key={branch.name} value={branch.name}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCreatePR(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePullRequest}>Create PR</Button>
              </div>
            </Card>
          </div>
        )}
      </Card>
    </div>
  )
}