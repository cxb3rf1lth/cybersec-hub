import { useState } from 'react';
import { useKVWithFallback } from '@/lib/kv-fallback';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Star, Download, Code, Copy, Eye, Users, GitBranch } from '@phosphor-icons/react';
import { Template } from '@/types/templates';
import { User } from '@/types/user';
import { TemplateDetailModal } from './TemplateDetailModal';
import { toast } from 'sonner';

interface TemplateCardProps {
  template: Template
  currentUser: User
}

export function TemplateCard({ template, currentUser }: TemplateCardProps) {
  const [templates, setTemplates] = useKVWithFallback<Template[]>('templates', []);
  const [showDetail, setShowDetail] = useState(false);
  const [isStarred, setIsStarred] = useState(false); // In real app, track user's stars

  const handleStar = async () => {
    try {
      setIsStarred(!isStarred);
      const updatedTemplates = templates.map(t => 
        t.id === template.id 
          ? { ...t, stars: isStarred ? t.stars - 1 : t.stars + 1 }
          : t
      );
      setTemplates(updatedTemplates);
      toast.success(isStarred ? 'Removed from starred' : 'Added to starred');
    } catch (error) {
      console.error('Error starring template:', error);
      toast.error('Failed to star template');
    }
  };

  const handleUseTemplate = async () => {
    try {
      // In real app, this would create a new project from template
      const updatedTemplates = templates.map(t => 
        t.id === template.id 
          ? { ...t, downloads: t.downloads + 1 }
          : t
      );
      setTemplates(updatedTemplates);
      toast.success('Template copied to your projects!');
    } catch (error) {
      console.error('Error using template:', error);
      toast.error('Failed to use template');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'expert': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-muted';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'web-app': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'cli-tool': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'exploitation': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'analysis': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'networking': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'forensics': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'automation': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      default: return 'bg-muted';
    }
  };

  return (
    <>
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer group">
        <CardHeader className="pb-3" onClick={() => setShowDetail(true)}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-1">
                {template.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {template.description}
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
            <Badge variant="outline" className={getDifficultyColor(template.difficulty)}>
              {template.difficulty}
            </Badge>
            <Badge variant="outline" className={getCategoryColor(template.category)}>
              {template.category.replace('-', ' ')}
            </Badge>
            {template.framework && (
              <Badge variant="secondary">
                {template.framework}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 pb-3" onClick={() => setShowDetail(true)}>
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-3 border-t border-border">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Avatar className="w-6 h-6">
                <AvatarImage src={template.author.avatar} />
                <AvatarFallback className="text-xs">
                  {template.author.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {template.author.username}
              </span>
              {template.team && (
                <>
                  <Badge variant="outline" className="text-xs gap-1">
                    <Users className="w-3 h-3" />
                    {template.team.name}
                  </Badge>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                <span>{template.stars}</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="w-4 h-4" />
                <span>{template.downloads}</span>
              </div>
              {template.branches && template.branches.length > 1 && (
                <div className="flex items-center gap-1">
                  <GitBranch className="w-4 h-4" />
                  <span>{template.branches.length}</span>
                </div>
              )}
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
                handleUseTemplate();
              }}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Copy className="w-4 h-4 mr-1" />
              Use
            </Button>
          </div>
        </CardFooter>
      </Card>

      {showDetail && (
        <TemplateDetailModal
          template={template}
          currentUser={currentUser}
          onClose={() => setShowDetail(false)}
          onUse={handleUseTemplate}
        />
      )}
    </>
  );
}