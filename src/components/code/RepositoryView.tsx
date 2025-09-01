import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Star, GitFork, Eye, Lock, Globe, File, Folder, GitBranch, Bug, GitPullRequest, Download, Clone } from '@phosphor-icons/react'
import { Repository, User, RepositoryFile } from '@/types/user'
import { FileTree } from '@/components/code/FileTree'
import { IssuesTab } from '@/components/code/IssuesTab'
import { PullRequestsTab } from '@/components/code/PullRequestsTab'
import { CommitsTab } from '@/components/code/CommitsTab'

interface RepositoryViewProps {
  repository: Repository
  currentUser: User
  onFileSelect: (filePath: string) => void
  onBack: () => void
}

export function RepositoryView({ repository, currentUser, onFileSelect, onBack }: RepositoryViewProps) {
  const [activeTab, setActiveTab] = useState('code')
  const [selectedBranch, setSelectedBranch] = useState(repository.defaultBranch)

  const isOwner = repository.ownerId === currentUser.id
  const isCollaborator = repository.collaborators.includes(currentUser.id)
  const isStarred = repository.stars.includes(currentUser.id)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getLanguageColor = (language: string) => {
    const colors: { [key: string]: string } = {
      JavaScript: '#f1e05a',
      Python: '#3572A5',
      Go: '#00ADD8',
      Rust: '#dea584',
      C: '#555555',
      'C++': '#f34b7d',
      Shell: '#89e051',
      PowerShell: '#012456'
    }
    return colors[language] || '#6b7280'
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Repositories
          </Button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{repository.name}</h1>
            {repository.isPrivate ? (
              <Lock className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Globe className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant={isStarred ? "default" : "outline"} size="sm">
              <Star className="w-4 h-4 mr-2" />
              {isStarred ? 'Starred' : 'Star'} {repository.stars.length}
            </Button>
            <Button variant="outline" size="sm">
              <GitFork className="w-4 h-4 mr-2" />
              Fork {repository.forks.length}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm">
              <Clone className="w-4 h-4 mr-2" />
              Clone
            </Button>
          </div>
        </div>

        <p className="text-muted-foreground mb-4">{repository.description}</p>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: getLanguageColor(repository.language) }}
            ></div>
            <span>{repository.language}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            {repository.stars.length} stars
          </div>
          <div className="flex items-center gap-1">
            <GitFork className="w-4 h-4" />
            {repository.forks.length} forks
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {repository.watchers.length} watching
          </div>
          <span>Updated {formatDate(repository.updatedAt)}</span>
        </div>

        <div className="flex gap-2 mt-4">
          {repository.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-6 pt-4">
          <TabsList className="grid grid-cols-5 w-full max-w-md">
            <TabsTrigger value="code" className="flex items-center gap-2">
              <File className="w-4 h-4" />
              Code
            </TabsTrigger>
            <TabsTrigger value="issues" className="flex items-center gap-2">
              <Bug className="w-4 h-4" />
              Issues
              {repository.issues.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {repository.issues.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pulls" className="flex items-center gap-2">
              <GitPullRequest className="w-4 h-4" />
              Pull Requests
              {repository.pullRequests.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {repository.pullRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="commits" className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Commits
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="code" className="h-full">
            <FileTree
              repository={repository}
              currentUser={currentUser}
              onFileSelect={onFileSelect}
              selectedBranch={selectedBranch}
              onBranchChange={setSelectedBranch}
            />
          </TabsContent>

          <TabsContent value="issues" className="h-full">
            <IssuesTab
              repository={repository}
              currentUser={currentUser}
              isOwner={isOwner}
            />
          </TabsContent>

          <TabsContent value="pulls" className="h-full">
            <PullRequestsTab
              repository={repository}
              currentUser={currentUser}
              isOwner={isOwner}
            />
          </TabsContent>

          <TabsContent value="commits" className="h-full">
            <CommitsTab
              repository={repository}
              selectedBranch={selectedBranch}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}