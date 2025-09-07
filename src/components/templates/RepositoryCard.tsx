import { useState } from 'react';
import { useKVWithFallback } from '@/lib/kv-fallback';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Star, GitFork, FolderOpen, Eye, Copy } from '@/lib/phosphor-icons-wrapper';
import { ToolRepository } from '@/types/templates';
import { User } from '@/types/user';
import { RepositoryDetailModal } from './RepositoryDetailModal';
import { toast } from 'sonner';

interface RepositoryCardProps {
  repository: ToolRepository
  currentUser: User
}

export function RepositoryCard({ repository, currentUser }: RepositoryCardProps) {
  const [repositories, setRepositories] = useKVWithFallback<ToolRepository[]>('toolRepositories', []);
  const [showDetail, setShowDetail] = useState(false);
  const [isStarred, setIsStarred] = useState(false); // In real app, track user's stars

  const handleStar = async () => {
    try {
      setIsStarred(!isStarred);
      const updatedRepositories = repositories.map(r => 
        r.id === repository.id 
          ? { ...r, stars: isStarred ? r.stars - 1 : r.stars + 1 }
          : r
      );
      setRepositories(updatedRepositories);
      toast.success(isStarred ? 'Removed from starred' : 'Added to starred');
    } catch (error) {
      console.error('Error starring repository:', error);
      toast.error('Failed to star repository');
    }
  };

  const handleFork = async () => {
    try {
      // In real app, this would create a fork of the repository
      const updatedRepositories = repositories.map(r => 
        r.id === repository.id 
          ? { ...r, forks: r.forks + 1 }
          : r
      );
      setRepositories(updatedRepositories);
      toast.success('Repository forked to your account!');
    } catch (error) {
      console.error('Error forking repository:', error);
      toast.error('Failed to fork repository');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'reconnaissance': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'exploitation': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'post-exploitation': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'defense': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'analysis': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'automation': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-muted';
    }
  };

  return (
    <>
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer group">
        <CardHeader className="pb-3" onClick={() => setShowDetail(true)}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-accent flex-shrink-0" />
                <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-1">
                  {repository.name}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {repository.description}
              </p>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStar();
                }}
                className={`p-1 h-auto ${isStarred ? 'text-yellow-400' : 'text-muted-foreground'}`}
              >
                <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="outline" className={getCategoryColor(repository.category)}>
              {repository.category.replace('-', ' ')}
            </Badge>
            <Badge variant="secondary">
              {repository.tools.length} tools
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 pb-3" onClick={() => setShowDetail(true)}>
          <div className="space-y-3">
            {/* Tool preview */}
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-foreground">Popular Tools:</h4>
              <div className="text-sm text-muted-foreground">
                {repository.tools.slice(0, 3).map((tool, index) => (
                  <span key={tool.id}>
                    {tool.name}
                    {index < Math.min(2, repository.tools.length - 1) && ', '}
                  </span>
                ))}
                {repository.tools.length > 3 && ` +${repository.tools.length - 3} more`}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {repository.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {repository.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{repository.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-3 border-t border-border">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Avatar className="w-6 h-6">
                <AvatarImage src={repository.author.avatar} />
                <AvatarFallback className="text-xs">
                  {repository.author.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {repository.author.username}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                <span>{repository.stars}</span>
              </div>
              <div className="flex items-center gap-1">
                <GitFork className="w-4 h-4" />
                <span>{repository.forks}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-3 w-full">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setShowDetail(true);
              }}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleFork();
              }}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <GitFork className="w-4 h-4 mr-1" />
              Fork
            </Button>
          </div>
        </CardFooter>
      </Card>

      {showDetail && (
        <RepositoryDetailModal
          repository={repository}
          currentUser={currentUser}
          onClose={() => setShowDetail(false)}
          onFork={handleFork}
        />
      )}
    </>
  );
}