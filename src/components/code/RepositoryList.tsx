import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Search, Star, GitFork, Eye, Lock, Globe } from '@phosphor-icons/react'
import { User, Repository } from '@/types/user'
import { toast } from 'sonner'

interface RepositoryListProps {
  currentUser: User
  onRepositorySelect: (repository: Repository) => void
}

export function RepositoryList({ currentUser, onRepositorySelect }: RepositoryListProps) {
  const [repositories, setRepositories] = useKV<Repository[]>('repositories', [])
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'owned' | 'starred' | 'forked'>('all')

  // Form state for creating new repository
  const [newRepo, setNewRepo] = useState({
    name: '',
    description: '',
    language: 'JavaScript',
    isPrivate: false,
    tags: ''
  })

  useEffect(() => {
    // Initialize with sample repositories if none exist
    if (repositories.length === 0) {
      initializeSampleRepositories()
    }
  }, [])

  const initializeSampleRepositories = () => {
    const sampleRepos: Repository[] = [
      {
        id: 'repo-cxb3rf1lth',
        name: 'cxb3rf1lth',
        description: 'Main cybersecurity hub repository containing the platform code and resources',
        ownerId: currentUser.id,
        isPrivate: false,
        language: 'TypeScript',
        tags: ['cybersecurity', 'platform', 'react', 'typescript'],
        stars: ['user-1', 'user-2', 'user-3'],
        forks: ['user-4'],
        watchers: ['user-1', 'user-2', 'user-3', 'user-4'],
        collaborators: [currentUser.id, 'user_sample_2', 'user_sample_3'],
        files: [
          {
            id: 'file-1',
            name: 'App.tsx',
            path: '/src/App.tsx',
            content: 'import { useState } from \'react\'\nimport { useKV } from \'@github/spark/hooks\'\nimport { Sidebar } from \'@/components/layout/Sidebar\'\nimport { MainContent } from \'@/components/layout/MainContent\'\nimport { User } from \'@/types/user\'\n\nfunction App() {\n  const [currentUser, setCurrentUser] = useKV<User | null>(\'currentUser\', null)\n  const [activeTab, setActiveTab] = useState<string>(\'feed\')\n\n  return (\n    <div className="min-h-screen bg-background">\n      <div className="flex">\n        <Sidebar\n          currentUser={currentUser}\n          activeTab={activeTab}\n          onTabChange={setActiveTab}\n        />\n        <MainContent\n          currentUser={currentUser}\n          activeTab={activeTab}\n        />\n      </div>\n    </div>\n  )\n}\n\nexport default App',
            language: 'typescript',
            size: 892,
            lastModified: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            lastCommit: 'abc123f',
            isDirectory: false
          },
          {
            id: 'file-2',
            name: 'README.md',
            path: '/README.md',
            content: '# CyberSec Hub\n\nA professional networking platform for cybersecurity experts.\n\n## Features\n\n- 🔗 Professional networking for cybersec professionals\n- 🛠️ Tool sharing and collaboration\n- 📊 Threat intelligence feeds\n- 🎯 Bug bounty integration\n- 🏢 Team management and collaboration\n\n## Installation\n\n```bash\ngit clone https://github.com/cxb3rf1lth/cybersec-hub.git\ncd cybersec-hub\nnpm install\n```\n\n## Usage\n\n### Development\n```bash\nnpm run dev\n```\n\n### Build\n```bash\nnpm run build\n```\n\n## Contributing\n\nWe welcome contributions! Please see CONTRIBUTING.md for guidelines.\n\n## License\n\nMIT License - see LICENSE file for details.',
            language: 'markdown',
            size: 1024,
            lastModified: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            lastCommit: 'def456a',
            isDirectory: false
          }
        ],
        commits: [
          {
            id: 'def456a',
            message: 'Update documentation and add new features',
            authorId: currentUser.id,
            authorName: currentUser.username,
            authorEmail: currentUser.email,
            hash: 'def456a',
            parentHash: 'abc123f',
            branch: 'main',
            filesChanged: [
              {
                path: '/README.md',
                type: 'modified',
                additions: 25,
                deletions: 8
              }
            ],
            additions: 25,
            deletions: 8,
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'abc123f',
            message: 'Initial platform setup with React and TypeScript',
            authorId: currentUser.id,
            authorName: currentUser.username,
            authorEmail: currentUser.email,
            hash: 'abc123f',
            parentHash: 'initial',
            branch: 'main',
            filesChanged: [
              {
                path: '/src/App.tsx',
                type: 'added',
                additions: 35,
                deletions: 0
              }
            ],
            additions: 35,
            deletions: 0,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          }
        ],
        branches: [
          { 
            id: 'branch-1', 
            name: 'main', 
            lastCommit: 'def456a', 
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), 
            isDefault: true, 
            isProtected: false 
          }
        ],
        issues: [],
        pullRequests: [],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        cloneUrl: `https://github.com/cxb3rf1lth/cybersec-hub.git`,
        defaultBranch: 'main'
      }
    ]
    setRepositories(sampleRepos)
  }

  const filteredRepositories = repositories.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         repo.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    switch (filterType) {
      case 'owned':
        return matchesSearch && repo.ownerId === currentUser.id
      case 'starred':
        return matchesSearch && repo.stars.includes(currentUser.id)
      case 'forked':
        return matchesSearch && repo.forks.includes(currentUser.id)
      default:
        return matchesSearch
    }
  })

  const handleCreateRepository = () => {
    if (!newRepo.name.trim()) {
      toast.error('Repository name is required')
      return
    }

    const repository: Repository = {
      id: `repo-${Date.now()}`,
      name: newRepo.name.trim(),
      description: newRepo.description.trim(),
      ownerId: currentUser.id,
      isPrivate: newRepo.isPrivate,
      language: newRepo.language,
      tags: newRepo.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      stars: [],
      forks: [],
      watchers: [currentUser.id],
      collaborators: [currentUser.id],
      files: [
        {
          id: `file-${Date.now()}`,
          name: 'README.md',
          path: '/README.md',
          content: `# ${newRepo.name}\n\n${newRepo.description}\n\n## Getting Started\n\nAdd your project description here.`,
          language: 'markdown',
          size: 128,
          lastModified: new Date().toISOString(),
          lastCommit: 'initial',
          isDirectory: false
        }
      ],
      commits: [],
      branches: [{ id: 'branch-main', name: 'main', lastCommit: 'initial', createdAt: new Date().toISOString(), isDefault: true, isProtected: false }],
      issues: [],
      pullRequests: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cloneUrl: `https://github.com/${currentUser.username}/${newRepo.name}.git`,
      defaultBranch: 'main'
    }

    setRepositories(prev => [repository, ...prev])
    setShowCreateDialog(false)
    setNewRepo({ name: '', description: '', language: 'JavaScript', isPrivate: false, tags: '' })
    toast.success('Repository created successfully')
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Repositories</h1>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Repository
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Repository</DialogTitle>
                <DialogDescription>
                  Create a new repository to store your security tools and code.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Repository Name</Label>
                  <Input
                    id="name"
                    value={newRepo.name}
                    onChange={(e) => setNewRepo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="my-security-tool"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newRepo.description}
                    onChange={(e) => setNewRepo(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="A brief description of your repository"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="language">Primary Language</Label>
                  <Select value={newRepo.language} onValueChange={(value) => setNewRepo(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JavaScript">JavaScript</SelectItem>
                      <SelectItem value="Python">Python</SelectItem>
                      <SelectItem value="Go">Go</SelectItem>
                      <SelectItem value="Rust">Rust</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="C++">C++</SelectItem>
                      <SelectItem value="Shell">Shell</SelectItem>
                      <SelectItem value="PowerShell">PowerShell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={newRepo.tags}
                    onChange={(e) => setNewRepo(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="security, tools, python"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="private"
                    checked={newRepo.isPrivate}
                    onCheckedChange={(checked) => setNewRepo(prev => ({ ...prev, isPrivate: checked }))}
                  />
                  <Label htmlFor="private">Private repository</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRepository}>
                  Create Repository
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="owned">Owned</SelectItem>
              <SelectItem value="starred">Starred</SelectItem>
              <SelectItem value="forked">Forked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Repository List */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-4">
          {filteredRepositories.map((repo) => (
            <Card key={repo.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => onRepositorySelect(repo)}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{repo.name}</CardTitle>
                    {repo.isPrivate ? (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Globe className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {repo.stars.length}
                    </div>
                    <div className="flex items-center gap-1">
                      <GitFork className="w-4 h-4" />
                      {repo.forks.length}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {repo.watchers.length}
                    </div>
                  </div>
                </div>
                <CardDescription>{repo.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent"></div>
                    <span className="text-sm text-muted-foreground">{repo.language}</span>
                  </div>
                  <div className="flex gap-2">
                    {repo.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {repo.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{repo.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}