import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Star, GitFork, List, Wrench, CalendarBlank, Terminal } from '@/lib/phosphor-icons-wrapper';
import { ToolRepository, Tool } from '@/types/templates';
import { User } from '@/types/user';

interface RepositoryDetailModalProps {
  repository: ToolRepository
  currentUser: User
  onClose: () => void
  onFork: () => void
}

export function RepositoryDetailModal({ repository, currentUser, onClose, onFork }: RepositoryDetailModalProps) {
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

  const getToolComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'moderate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'complex': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-muted';
    }
  };

  const getToolCategoryColor = (category: string) => {
    switch (category) {
      case 'scanner': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'exploit': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'payload': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'encoder': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'decoder': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'analyzer': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'monitor': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-muted';
    }
  };

  const groupedTools = repository.tools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Wrench className="w-6 h-6 text-accent" />
                {repository.name}
              </DialogTitle>
              <p className="text-muted-foreground mb-4">
                {repository.description}
              </p>
              
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className={getCategoryColor(repository.category)}>
                  {repository.category.replace('-', ' ')}
                </Badge>
                <Badge variant="secondary">
                  {repository.tools.length} tools
                </Badge>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={repository.author.avatar} />
                    <AvatarFallback className="text-xs">
                      {repository.author.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    by {repository.author.username}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span>{repository.stars}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork className="w-4 h-4" />
                    <span>{repository.forks}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarBlank className="w-4 h-4" />
                    <span>{new Date(repository.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 ml-4">
              <Button variant="outline">
                <Star className="w-4 h-4 mr-2" />
                Star
              </Button>
              <Button onClick={onFork} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <GitFork className="w-4 h-4 mr-2" />
                Fork Repository
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <Tabs defaultValue="tools" className="h-full flex flex-col">
            <div className="px-6">
              <TabsList className="grid w-fit grid-cols-2">
                <TabsTrigger value="tools" className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Tools ({repository.tools.length})
                </TabsTrigger>
                <TabsTrigger value="tags" className="flex items-center gap-2">
                  <List className="w-4 h-4" />
                  Tags ({repository.tags.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 min-h-0 px-6 pb-6">
              <TabsContent value="tools" className="h-full mt-4">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-6">
                    {Object.entries(groupedTools).map(([category, tools]) => (
                      <div key={category}>
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="font-semibold text-lg capitalize">
                            {category.replace('-', ' ')}
                          </h3>
                          <Badge variant="secondary">
                            {tools.length}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {tools.map(tool => (
                            <Card key={tool.id} className="hover:shadow-md transition-shadow">
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-foreground">
                                      {tool.name}
                                    </h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {tool.description}
                                    </p>
                                  </div>
                                  <Badge variant="outline" className="ml-2">
                                    v{tool.version}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className={getToolComplexityColor(tool.complexity)}>
                                    {tool.complexity}
                                  </Badge>
                                  <Badge variant="outline" className={getToolCategoryColor(tool.category)}>
                                    {tool.category}
                                  </Badge>
                                </div>
                              </CardHeader>

                              <CardContent className="space-y-3">
                                {/* Platform badges */}
                                <div className="flex flex-wrap gap-1">
                                  {tool.platform.map(platform => (
                                    <Badge key={platform} variant="secondary" className="text-xs">
                                      {platform}
                                    </Badge>
                                  ))}
                                </div>

                                {/* Installation */}
                                <div>
                                  <h5 className="text-sm font-medium mb-1">Installation:</h5>
                                  <div className="bg-muted rounded p-2">
                                    <code className="text-xs">{tool.installCommand}</code>
                                  </div>
                                </div>

                                {/* Usage example */}
                                <div>
                                  <h5 className="text-sm font-medium mb-1">Usage:</h5>
                                  <div className="bg-muted rounded p-2">
                                    <code className="text-xs">{tool.usageExample}</code>
                                  </div>
                                </div>

                                {/* Dependencies */}
                                {tool.dependencies.length > 0 && (
                                  <div>
                                    <h5 className="text-sm font-medium mb-1">Dependencies:</h5>
                                    <div className="flex flex-wrap gap-1">
                                      {tool.dependencies.map((dep, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {dep}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Documentation link */}
                                {tool.documentation && (
                                  <Button variant="outline" size="sm" className="w-full">
                                    <Terminal className="w-4 h-4 mr-2" />
                                    View Documentation
                                  </Button>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="tags" className="mt-4">
                <div>
                  <h3 className="font-semibold mb-3">Repository Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {repository.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}