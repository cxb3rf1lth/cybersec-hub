import { useState, useEffect } from 'react';
import { useKVWithFallback } from '@/lib/kv-fallback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Search, Star, GitFork, Eye, Lock, Globe } from '@/lib/phosphor-icons-wrapper';
import { User, Repository } from '@/types/user';
import { toast } from 'sonner';

interface RepositoryListProps {
  currentUser: User
  onRepositorySelect: (repository: Repository) => void
}

export function RepositoryList({ currentUser, onRepositorySelect }: RepositoryListProps) {
  const [repositories, setRepositories] = useKVWithFallback<Repository[]>('repositories', []);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'owned' | 'starred' | 'forked'>('all');

  // Form state for creating new repository
  const [newRepo, setNewRepo] = useState({
    name: '',
    description: '',
    language: 'JavaScript',
    isPrivate: false,
    tags: ''
  });

  useEffect(() => {
    // Initialize with sample repositories if none exist
    if (repositories.length === 0) {
      initializeSampleRepositories();
    }
  }, []);

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
        collaborators: [currentUser.id, 'user_sample_2', 'user_sample_3'],
        files: [
          {
            id: 'file-1',
            name: 'main.py',
            path: '/main.py',
            content: '#!/usr/bin/env python3\n\n"""CyberSec Toolkit - Main Entry Point"""\n\nimport argparse\nimport sys\nfrom modules import scanner, analyzer, reporter\n\ndef main():\n    parser = argparse.ArgumentParser(description="CyberSec Toolkit")\n    parser.add_argument("--scan", help="Scan target")\n    parser.add_argument("--analyze", help="Analyze results")\n    parser.add_argument("--report", help="Generate report")\n    \n    args = parser.parse_args()\n    \n    if args.scan:\n        print(f"Scanning target: {args.scan}")\n        scanner.run_scan(args.scan)\n    elif args.analyze:\n        print(f"Analyzing: {args.analyze}")\n        analyzer.analyze(args.analyze)\n    elif args.report:\n        print("Generating security report...")\n        reporter.generate_report(args.report)\n    else:\n        print("CyberSec Toolkit v2.1.0")\n        print("Usage: python main.py [--scan|--analyze|--report] <target>")\n\nif __name__ == "__main__":\n    main()',
            language: 'python',
            size: 812,
            lastModified: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            lastCommit: 'abc123f',
            isDirectory: false
          },
          {
            id: 'file-2',
            name: 'README.md',
            path: '/README.md',
            content: '# CyberSec Toolkit\n\nA comprehensive toolkit for cybersecurity professionals.\n\n## Features\n\n- 🔍 Network scanning and enumeration\n- 🛡️ Vulnerability analysis and assessment\n- 📊 Security reporting and documentation\n- 🔗 Integration with popular security tools\n- 🌐 Web application security testing\n\n## Installation\n\n```bash\ngit clone https://github.com/cybersec/toolkit.git\ncd toolkit\npip install -r requirements.txt\n```\n\n## Usage\n\n### Network Scanning\n```bash\npython main.py --scan 192.168.1.0/24\n```\n\n### Vulnerability Analysis\n```bash\npython main.py --analyze scan_results.json\n```\n\n### Generate Report\n```bash\npython main.py --report vulnerability_data.json\n```\n\n## Contributing\n\nWe welcome contributions! Please see CONTRIBUTING.md for guidelines.\n\n## License\n\nMIT License - see LICENSE file for details.',
            language: 'markdown',
            size: 1024,
            lastModified: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
            lastCommit: 'def456a',
            isDirectory: false
          },
          {
            id: 'file-3',
            name: 'scanner.py',
            path: '/modules/scanner.py',
            content: '"""Network Scanner Module"""\n\nimport socket\nimport threading\nfrom concurrent.futures import ThreadPoolExecutor\n\nclass NetworkScanner:\n    def __init__(self, target, threads=100):\n        self.target = target\n        self.threads = threads\n        self.open_ports = []\n        \n    def scan_port(self, port):\n        try:\n            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\n            sock.settimeout(1)\n            result = sock.connect_ex((self.target, port))\n            if result == 0:\n                self.open_ports.append(port)\n                print(f"Port {port}: Open")\n            sock.close()\n        except Exception as e:\n            pass\n            \n    def run_scan(self, port_range=(1, 1000)):\n        print(f"Scanning {self.target}...")\n        \n        with ThreadPoolExecutor(max_workers=self.threads) as executor:\n            for port in range(port_range[0], port_range[1] + 1):\n                executor.submit(self.scan_port, port)\n                \n        return self.open_ports\n\ndef run_scan(target):\n    scanner = NetworkScanner(target)\n    return scanner.run_scan()',
            language: 'python',
            size: 1256,
            lastModified: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
            lastCommit: 'ghi789b',
            isDirectory: false
          }
        ],
        commits: [
          {
            id: 'ghi789b',
            message: 'Add concurrent scanning support and improve error handling',
            authorId: 'user_sample_2',
            authorName: 'maya_defense',
            authorEmail: 'maya@cyberconnect.com',
            hash: 'ghi789b',
            parentHash: 'def456a',
            branch: 'main',
            filesChanged: [
              {
                path: '/modules/scanner.py',
                type: 'modified',
                additions: 15,
                deletions: 5
              }
            ],
            additions: 15,
            deletions: 5,
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
          },
          {
            id: 'def456a',
            message: 'Update documentation with new features and examples',
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
            message: 'Add reporting functionality and improve CLI interface',
            authorId: currentUser.id,
            authorName: currentUser.username,
            authorEmail: currentUser.email,
            hash: 'abc123f',
            parentHash: 'initial',
            branch: 'main',
            filesChanged: [
              {
                path: '/main.py',
                type: 'modified',
                additions: 12,
                deletions: 3
              }
            ],
            additions: 12,
            deletions: 3,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          }
        ],
        branches: [
          { 
            id: 'branch-1', 
            name: 'main', 
            lastCommit: 'ghi789b', 
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), 
            isDefault: true, 
            isProtected: false 
          },
          { 
            id: 'branch-2', 
            name: 'feature/web-scanner', 
            lastCommit: 'abc123f', 
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), 
            isDefault: false, 
            isProtected: false 
          }
        ],
        issues: [
          {
            id: 'issue-1',
            title: 'Add support for IPv6 scanning',
            description: 'The current scanner only supports IPv4 addresses. We should add IPv6 support for modern network environments.',
            authorId: 'user_sample_3',
            assigneeId: currentUser.id,
            labels: ['enhancement', 'networking'],
            status: 'open',
            priority: 'medium',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            comments: [
              {
                id: 'comment-1',
                authorId: currentUser.id,
                content: 'Good point! I\'ll look into adding IPv6 support in the next release.',
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
              }
            ]
          }
        ],
        pullRequests: [
          {
            id: 'pr-1',
            title: 'Implement web application security testing module',
            description: 'This PR adds a new module for testing web application security, including SQL injection and XSS detection.',
            authorId: 'user_sample_2',
            sourceBranch: 'feature/web-scanner',
            targetBranch: 'main',
            status: 'open',
            reviewers: [currentUser.id, 'user_sample_3'],
            reviews: [
              {
                id: 'review-1',
                reviewerId: currentUser.id,
                status: 'approved',
                comment: 'Looks great! The code is well-structured and the tests are comprehensive.',
                createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
              }
            ],
            filesChanged: [
              {
                path: '/modules/web_scanner.py',
                type: 'added',
                additions: 150,
                deletions: 0
              }
            ],
            commits: ['abc123f'],
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        cloneUrl: `https://github.com/${currentUser.username}/cybersec-toolkit.git`,
        defaultBranch: 'main'
      }
    ];
    setRepositories(sampleRepos);
  };

  const filteredRepositories = repositories.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         repo.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (filterType) {
      case 'owned':
        return matchesSearch && repo.ownerId === currentUser.id;
      case 'starred':
        return matchesSearch && repo.stars.includes(currentUser.id);
      case 'forked':
        return matchesSearch && repo.forks.includes(currentUser.id);
      default:
        return matchesSearch;
    }
  });

  const handleCreateRepository = () => {
    if (!newRepo.name.trim()) {
      toast.error('Repository name is required');
      return;
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
    };

    setRepositories(prev => [repository, ...prev]);
    setShowCreateDialog(false);
    setNewRepo({ name: '', description: '', language: 'JavaScript', isPrivate: false, tags: '' });
    toast.success('Repository created successfully');
  };

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
  );
}