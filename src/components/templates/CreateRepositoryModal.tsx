import { useState } from 'react';
import { useKVWithFallback } from '@/lib/kv-fallback';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Plus, X, Wrench, Settings, List } from '@/lib/phosphor-icons-wrapper';
import { ToolRepository, Tool } from '@/types/templates';
import { User } from '@/types/user';
import { toast } from 'sonner';

interface CreateRepositoryModalProps {
  currentUser: User
  onClose: () => void
}

export function CreateRepositoryModal({ currentUser, onClose }: CreateRepositoryModalProps) {
  const [repositories, setRepositories] = useKVWithFallback<ToolRepository[]>('toolRepositories', []);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('');
  const [isPublic, setIsPublic] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [tools, setTools] = useState<Tool[]>([]);
  const [newTool, setNewTool] = useState({
    name: '',
    description: '',
    version: '1.0.0',
    installCommand: '',
    usageExample: '',
    documentation: '',
    platform: [] as string[],
    dependencies: [] as string[],
    category: '',
    complexity: 'simple'
  });
  const [newPlatform, setNewPlatform] = useState('');
  const [newDependency, setNewDependency] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  const repositoryCategories = [
    { value: 'reconnaissance', label: 'Reconnaissance' },
    { value: 'exploitation', label: 'Exploitation' },
    { value: 'post-exploitation', label: 'Post-Exploitation' },
    { value: 'defense', label: 'Defense' },
    { value: 'analysis', label: 'Analysis' },
    { value: 'automation', label: 'Automation' }
  ];

  const toolCategories = [
    { value: 'scanner', label: 'Scanner' },
    { value: 'exploit', label: 'Exploit' },
    { value: 'payload', label: 'Payload' },
    { value: 'encoder', label: 'Encoder' },
    { value: 'decoder', label: 'Decoder' },
    { value: 'analyzer', label: 'Analyzer' },
    { value: 'monitor', label: 'Monitor' }
  ];

  const complexityLevels = [
    { value: 'simple', label: 'Simple' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'complex', label: 'Complex' }
  ];

  const platforms = [
    { value: 'linux', label: 'Linux' },
    { value: 'windows', label: 'Windows' },
    { value: 'macos', label: 'macOS' },
    { value: 'web', label: 'Web' }
  ];

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addPlatformToTool = () => {
    if (newPlatform && !newTool.platform.includes(newPlatform)) {
      setNewTool(prev => ({
        ...prev,
        platform: [...prev.platform, newPlatform]
      }));
      setNewPlatform('');
    }
  };

  const removePlatformFromTool = (platform: string) => {
    setNewTool(prev => ({
      ...prev,
      platform: prev.platform.filter(p => p !== platform)
    }));
  };

  const addDependencyToTool = () => {
    if (newDependency.trim() && !newTool.dependencies.includes(newDependency.trim())) {
      setNewTool(prev => ({
        ...prev,
        dependencies: [...prev.dependencies, newDependency.trim()]
      }));
      setNewDependency('');
    }
  };

  const removeDependencyFromTool = (dependency: string) => {
    setNewTool(prev => ({
      ...prev,
      dependencies: prev.dependencies.filter(d => d !== dependency)
    }));
  };

  const addTool = () => {
    if (!newTool.name.trim() || !newTool.description.trim() || !newTool.category) {
      toast.error('Please fill in all required tool fields');
      return;
    }

    const tool: Tool = {
      id: Date.now().toString(),
      name: newTool.name.trim(),
      description: newTool.description.trim(),
      version: newTool.version.trim(),
      installCommand: newTool.installCommand.trim(),
      usageExample: newTool.usageExample.trim(),
      documentation: newTool.documentation.trim(),
      platform: newTool.platform as any[],
      dependencies: newTool.dependencies,
      category: newTool.category as any,
      complexity: newTool.complexity as any
    };

    setTools(prev => [...prev, tool]);
    setNewTool({
      name: '',
      description: '',
      version: '1.0.0',
      installCommand: '',
      usageExample: '',
      documentation: '',
      platform: [],
      dependencies: [],
      category: '',
      complexity: 'simple'
    });
    toast.success('Tool added successfully');
  };

  const removeTool = (toolId: string) => {
    setTools(tools.filter(tool => tool.id !== toolId));
  };

  const handleSubmit = async () => {
    if (!name.trim() || !description.trim() || !category) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (tools.length === 0) {
      toast.error('Please add at least one tool');
      return;
    }

    try {
      const repository: ToolRepository = {
        id: Date.now().toString(),
        name: name.trim(),
        description: description.trim(),
        category: category as any,
        tools,
        author: {
          id: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.avatar
        },
        isPublic,
        stars: 0,
        forks: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags
      };

      setRepositories(prev => [repository, ...prev]);
      toast.success('Repository created successfully!');
      onClose();
    } catch (error) {
      console.error('Error creating repository:', error);
      toast.error('Failed to create repository');
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="w-6 h-6 text-accent" />
            Create New Tool Repository
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-h-0">
          <div className="px-6">
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="tools" className="flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Tools ({tools.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 min-h-0 px-6 pb-6">
            <TabsContent value="basic" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="repo-name">Repository Name *</Label>
                <Input
                  id="repo-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Security Toolkit"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="repo-description">Description *</Label>
                <Textarea
                  id="repo-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A comprehensive collection of cybersecurity tools for..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="repo-category">Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {repositoryCategories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="repo-public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <Label htmlFor="repo-public">Make repository public</Label>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-destructive"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tools" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Add New Tool</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tool Name *</Label>
                      <Input
                        value={newTool.name}
                        onChange={(e) => setNewTool(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="nmap"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Version</Label>
                      <Input
                        value={newTool.version}
                        onChange={(e) => setNewTool(prev => ({ ...prev, version: e.target.value }))}
                        placeholder="1.0.0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <Textarea
                      value={newTool.description}
                      onChange={(e) => setNewTool(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Network port scanner and security auditing tool"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select
                        value={newTool.category}
                        onValueChange={(value) => setNewTool(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {toolCategories.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Complexity</Label>
                      <Select
                        value={newTool.complexity}
                        onValueChange={(value) => setNewTool(prev => ({ ...prev, complexity: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {complexityLevels.map(level => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Platforms</Label>
                    <div className="flex gap-2">
                      <Select value={newPlatform} onValueChange={setNewPlatform}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          {platforms.map(platform => (
                            <SelectItem key={platform.value} value={platform.value}>
                              {platform.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={addPlatformToTool} variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newTool.platform.map(platform => (
                        <Badge key={platform} variant="secondary" className="flex items-center gap-1">
                          {platform}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-destructive"
                            onClick={() => removePlatformFromTool(platform)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Install Command</Label>
                      <Input
                        value={newTool.installCommand}
                        onChange={(e) => setNewTool(prev => ({ ...prev, installCommand: e.target.value }))}
                        placeholder="apt install nmap"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Documentation URL</Label>
                      <Input
                        value={newTool.documentation}
                        onChange={(e) => setNewTool(prev => ({ ...prev, documentation: e.target.value }))}
                        placeholder="https://nmap.org/docs"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Usage Example</Label>
                    <Textarea
                      value={newTool.usageExample}
                      onChange={(e) => setNewTool(prev => ({ ...prev, usageExample: e.target.value }))}
                      placeholder="nmap -sV -O target.com"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Dependencies</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newDependency}
                        onChange={(e) => setNewDependency(e.target.value)}
                        placeholder="libpcap-dev"
                        onKeyPress={(e) => e.key === 'Enter' && addDependencyToTool()}
                      />
                      <Button onClick={addDependencyToTool} variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newTool.dependencies.map(dep => (
                        <Badge key={dep} variant="secondary" className="flex items-center gap-1">
                          {dep}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-destructive"
                            onClick={() => removeDependencyFromTool(dep)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button onClick={addTool} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Tool
                  </Button>
                </CardContent>
              </Card>

              {tools.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Tools ({tools.length})</h3>
                  {tools.map(tool => (
                    <Card key={tool.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{tool.name} v{tool.version}</h4>
                            <p className="text-sm text-muted-foreground">{tool.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{tool.category}</Badge>
                            <Badge variant="secondary">{tool.complexity}</Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeTool(tool.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      {(tool.platform.length > 0 || tool.usageExample || tool.dependencies.length > 0) && (
                        <CardContent className="pt-0">
                          <div className="space-y-2 text-sm">
                            {tool.platform.length > 0 && (
                              <div>
                                <span className="font-medium">Platforms: </span>
                                {tool.platform.join(', ')}
                              </div>
                            )}
                            {tool.usageExample && (
                              <div>
                                <span className="font-medium">Usage: </span>
                                <code className="bg-muted px-1 rounded">{tool.usageExample}</code>
                              </div>
                            )}
                            {tool.dependencies.length > 0 && (
                              <div>
                                <span className="font-medium">Dependencies: </span>
                                {tool.dependencies.join(', ')}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        <div className="p-6 border-t border-border flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Create Repository
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}