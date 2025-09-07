import { Repository, Commit } from '@/types/user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitCommit, User, Calendar, FileText, Plus, Minus } from '@phosphor-icons/react';

interface CommitsTabProps {
  repository: Repository
  selectedBranch: string
}

export function CommitsTab({ repository, selectedBranch }: CommitsTabProps) {
  // For now, create sample commits since the repository might not have any
  const sampleCommits: Commit[] = [
    {
      id: 'commit-1',
      message: 'Initial commit with security toolkit setup',
      authorId: 'user-1',
      authorName: 'CyberSec Dev',
      authorEmail: 'dev@cybersec.com',
      hash: 'a1b2c3d4',
      branch: selectedBranch,
      filesChanged: [
        { path: '/main.py', type: 'added', additions: 45, deletions: 0 },
        { path: '/README.md', type: 'added', additions: 23, deletions: 0 },
        { path: '/requirements.txt', type: 'added', additions: 12, deletions: 0 }
      ],
      additions: 80,
      deletions: 0,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'commit-2',
      message: 'Add network scanning module with port detection',
      authorId: 'user-1',
      authorName: 'CyberSec Dev',
      authorEmail: 'dev@cybersec.com',
      hash: 'e5f6g7h8',
      parentHash: 'a1b2c3d4',
      branch: selectedBranch,
      filesChanged: [
        { path: '/modules/scanner.py', type: 'added', additions: 67, deletions: 0 },
        { path: '/main.py', type: 'modified', additions: 15, deletions: 3 },
        { path: '/tests/test_scanner.py', type: 'added', additions: 34, deletions: 0 }
      ],
      additions: 116,
      deletions: 3,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'commit-3',
      message: 'Fix vulnerability analysis edge case',
      authorId: 'user-1',
      authorName: 'CyberSec Dev',
      authorEmail: 'dev@cybersec.com',
      hash: 'i9j0k1l2',
      parentHash: 'e5f6g7h8',
      branch: selectedBranch,
      filesChanged: [
        { path: '/modules/analyzer.py', type: 'modified', additions: 8, deletions: 12 },
        { path: '/utils/helpers.py', type: 'added', additions: 25, deletions: 0 }
      ],
      additions: 33,
      deletions: 12,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    }
  ];

  const commits = repository.commits.length > 0 ? repository.commits : sampleCommits;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffHours < 24) {return `${diffHours} hours ago`;}
    if (diffDays === 1) {return 'yesterday';}
    if (diffDays < 7) {return `${diffDays} days ago`;}
    return date.toLocaleDateString();
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'added': return <Plus className="w-4 h-4 text-green-500" />;
      case 'deleted': return <Minus className="w-4 h-4 text-red-500" />;
      case 'modified': return <FileText className="w-4 h-4 text-yellow-500" />;
      case 'renamed': return <FileText className="w-4 h-4 text-blue-500" />;
      default: return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'added': return 'text-green-500';
      case 'deleted': return 'text-red-500';
      case 'modified': return 'text-yellow-500';
      case 'renamed': return 'text-blue-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-foreground">Commits</h2>
          <Badge variant="secondary">
            {selectedBranch} branch
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {commits.length} commits
        </div>
      </div>

      {/* Commits List */}
      <div className="flex-1 overflow-auto">
        {commits.length > 0 ? (
          <div className="space-y-4">
            {commits.map((commit, index) => (
              <Card key={commit.id} className="hover:bg-muted/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <GitCommit className="w-5 h-5 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{commit.message}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{commit.authorName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(commit.createdAt)}</span>
                          </div>
                          <Badge variant="outline" className="font-mono text-xs">
                            {commit.hash}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-green-500 font-mono">+{commit.additions}</span>
                        <span className="text-red-500 font-mono">-{commit.deletions}</span>
                      </div>
                      <Badge variant="secondary">
                        {commit.filesChanged.length} files
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {commit.filesChanged.map((file, fileIndex) => (
                      <div key={fileIndex} className="flex items-center justify-between p-2 rounded bg-muted/30">
                        <div className="flex items-center gap-2">
                          {getFileTypeIcon(file.type)}
                          <span className="font-mono text-sm">{file.path}</span>
                          <Badge variant="outline" className={`text-xs ${getFileTypeColor(file.type)}`}>
                            {file.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono">
                          {file.additions > 0 && (
                            <span className="text-green-500">+{file.additions}</span>
                          )}
                          {file.deletions > 0 && (
                            <span className="text-red-500">-{file.deletions}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
            <div>
              <GitCommit className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No commits yet</p>
              <p className="text-sm">Commits will appear here once you start making changes to the repository.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}