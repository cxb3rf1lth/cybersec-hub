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
import { Plus, X, FileText, Settings, Code } from '@phosphor-icons/react';
import { Template, TemplateFile } from '@/types/templates';
import { User } from '@/types/user';
import { CodeBlock } from '@/components/code/CodeBlock';
import { toast } from 'sonner';

interface CreateTemplateModalProps {
  currentUser: User
  onClose: () => void
}

export function CreateTemplateModal({ currentUser, onClose }: CreateTemplateModalProps) {
  const [templates, setTemplates] = useKVWithFallback<Template[]>('templates', []);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [framework, setFramework] = useState<string>('');
  const [license, setLicense] = useState('MIT');
  const [isPublic, setIsPublic] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [newDependency, setNewDependency] = useState('');
  const [setupInstructions, setSetupInstructions] = useState('');
  const [usageExample, setUsageExample] = useState('');
  const [files, setFiles] = useState<TemplateFile[]>([]);
  const [newFile, setNewFile] = useState({
    name: '',
    path: '',
    content: '',
    language: 'text',
    isEntryPoint: false
  });
  const [activeTab, setActiveTab] = useState('basic');

  const templateCategories = [
    { value: 'web-app', label: 'Web Applications' },
    { value: 'cli-tool', label: 'CLI Tools' },
    { value: 'exploitation', label: 'Exploitation' },
    { value: 'analysis', label: 'Analysis' },
    { value: 'networking', label: 'Networking' },
    { value: 'forensics', label: 'Forensics' },
    { value: 'automation', label: 'Automation' }
  ];

  const difficultyLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
  ];

  const frameworks = [
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'bash', label: 'Bash' },
    { value: 'powershell', label: 'PowerShell' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'c', label: 'C' },
    { value: 'cpp', label: 'C++' }
  ];

  const programmingLanguages = [
    'text', 'python', 'javascript', 'typescript', 'bash', 'powershell', 
    'go', 'rust', 'c', 'cpp', 'java', 'php', 'ruby', 'sql', 'yaml', 'json'
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

  const addDependency = () => {
    if (newDependency.trim() && !dependencies.includes(newDependency.trim())) {
      setDependencies([...dependencies, newDependency.trim()]);
      setNewDependency('');
    }
  };

  const removeDependency = (depToRemove: string) => {
    setDependencies(dependencies.filter(dep => dep !== depToRemove));
  };

  const addFile = () => {
    if (newFile.name.trim() && newFile.content.trim()) {
      const file: TemplateFile = {
        id: Date.now().toString(),
        name: newFile.name.trim(),
        path: newFile.path.trim() || newFile.name.trim(),
        content: newFile.content.trim(),
        language: newFile.language,
        isEntryPoint: newFile.isEntryPoint
      };
      setFiles([...files, file]);
      setNewFile({
        name: '',
        path: '',
        content: '',
        language: 'text',
        isEntryPoint: false
      });
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(files.filter(file => file.id !== fileId));
  };

  const handleSubmit = async () => {
    if (!name.trim() || !description.trim() || !category || !difficulty) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (files.length === 0) {
      toast.error('Please add at least one file');
      return;
    }

    try {
      const template: Template = {
        id: Date.now().toString(),
        name: name.trim(),
        description: description.trim(),
        category: category as any,
        tags,
        difficulty: difficulty as any,
        files,
        dependencies,
        setupInstructions: setupInstructions.trim(),
        usageExample: usageExample.trim(),
        author: {
          id: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.avatar
        },
        stars: 0,
        downloads: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic,
        license,
        framework: framework || undefined
      };

      setTemplates(prev => [template, ...prev]);
      toast.success('Template created successfully!');
      onClose();
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold">Create New Template</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-h-0">
          <div className="px-6">
            <TabsList className="grid w-fit grid-cols-3">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Files ({files.length})
              </TabsTrigger>
              <TabsTrigger value="documentation" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Documentation
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 min-h-0 px-6 pb-6">
            <TabsContent value="basic" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Awesome Template"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="license">License</Label>
                  <Input
                    id="license"
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                    placeholder="MIT"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief description of what this template does..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateCategories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty *</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyLevels.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="framework">Framework</Label>
                  <Select value={framework} onValueChange={setFramework}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select framework" />
                    </SelectTrigger>
                    <SelectContent>
                      {frameworks.map(fw => (
                        <SelectItem key={fw.value} value={fw.value}>
                          {fw.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <Label htmlFor="public">Make template public</Label>
              </div>

              <Separator />

              {/* Tags */}
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

              {/* Dependencies */}
              <div className="space-y-2">
                <Label>Dependencies</Label>
                <div className="flex gap-2">
                  <Input
                    value={newDependency}
                    onChange={(e) => setNewDependency(e.target.value)}
                    placeholder="e.g., numpy>=1.20.0"
                    onKeyPress={(e) => e.key === 'Enter' && addDependency()}
                  />
                  <Button onClick={addDependency} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {dependencies.map(dep => (
                    <Badge key={dep} variant="secondary" className="flex items-center gap-1">
                      {dep}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-destructive"
                        onClick={() => removeDependency(dep)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="files" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Add New File</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>File Name *</Label>
                      <Input
                        value={newFile.name}
                        onChange={(e) => setNewFile(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="main.py"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>File Path</Label>
                      <Input
                        value={newFile.path}
                        onChange={(e) => setNewFile(prev => ({ ...prev, path: e.target.value }))}
                        placeholder="src/main.py"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select
                        value={newFile.language}
                        onValueChange={(value) => setNewFile(prev => ({ ...prev, language: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {programmingLanguages.map(lang => (
                            <SelectItem key={lang} value={lang}>
                              {lang}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        checked={newFile.isEntryPoint}
                        onCheckedChange={(checked) => setNewFile(prev => ({ ...prev, isEntryPoint: checked }))}
                      />
                      <Label>Entry Point</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>File Content *</Label>
                    <Textarea
                      value={newFile.content}
                      onChange={(e) => setNewFile(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Enter your code here..."
                      rows={8}
                      className="font-mono"
                    />
                  </div>

                  <Button onClick={addFile} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add File
                  </Button>
                </CardContent>
              </Card>

              {files.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Files ({files.length})</h3>
                  {files.map(file => (
                    <Card key={file.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{file.name}</h4>
                            <p className="text-sm text-muted-foreground">{file.path}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{file.language}</Badge>
                            {file.isEntryPoint && (
                              <Badge variant="secondary">Entry Point</Badge>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFile(file.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CodeBlock
                          code={file.content}
                          language={file.language}
                          maxHeight="200px"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="documentation" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="setup">Setup Instructions</Label>
                <Textarea
                  id="setup"
                  value={setupInstructions}
                  onChange={(e) => setSetupInstructions(e.target.value)}
                  placeholder="1. Clone the repository&#10;2. Install dependencies&#10;3. Configure settings..."
                  rows={8}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usage">Usage Example</Label>
                <Textarea
                  id="usage"
                  value={usageExample}
                  onChange={(e) => setUsageExample(e.target.value)}
                  placeholder="python main.py --target example.com"
                  rows={6}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="p-6 border-t border-border flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Create Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}