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
        id: 'repo-1',
        name: 'cybersec-toolkit',
        description: 'A comprehensive toolkit for cybersecurity professionals',
        ownerId: currentUser.id,
        isPrivate: false,
        language: 'Python',
        tags: ['security', 'tools', 'python'],
        stars: ['user-1', 'user-2'],
        forks: ['user-3'],
        watchers: ['user-1', 'user-2', 'user-3'],
        collaborators: [currentUser.id],
        files: [
          {
            id: 'file-1',
            name: 'main.py',
            path: '/main.py',
            content: '#!/usr/bin/env python3\n\n"""CyberSec Toolkit - Main Entry Point"""\n\nimport argparse\nimport sys\nfrom modules import scanner, analyzer, reporter\n\ndef main():\n    parser = argparse.ArgumentParser(description="CyberSec Toolkit")\n    parser.add_argument("--scan", help="Scan target")\n    parser.add_argument("--analyze", help="Analyze results")\n    \n    args = parser.parse_args()\n    \n    if args.scan:\n        scanner.run_scan(args.scan)\n    elif args.analyze:\n        analyzer.analyze(args.analyze)\n    else:\n        print("Please specify an action")\n\nif __name__ == "__main__":\n    main()',
            language: 'python',
            size: 512,
            lastModified: new Date().toISOString(),
            lastCommit: 'commit-1',
            isDirectory: false
          },
          {
            id: 'file-2',
            name: 'README.md',
            path: '/README.md',
            content: '# CyberSec Toolkit\n\nA comprehensive toolkit for cybersecurity professionals.\n\n## Features\n\n- Network scanning\n- Vulnerability analysis\n- Security reporting\n\n## Installation\n\n```bash\npip install -r requirements.txt\n```\n\n## Usage\n\n```bash\npython main.py --scan target.com\n```',
            language: 'markdown',
            size: 256,
            lastModified: new Date().toISOString(),
            lastCommit: 'commit-1',
            isDirectory: false
          }
        ],
        commits: [],
        branches: [{ id: 'branch-1', name: 'main', lastCommit: 'commit-1', createdAt: new Date().toISOString(), isDefault: true, isProtected: false }],
        issues: [],
        pullRequests: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        cloneUrl: `https://github.com/${currentUser.username}/cybersec-toolkit.git`,
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