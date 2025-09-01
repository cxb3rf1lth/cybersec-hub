import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Star, Download, Copy, Code, FileText, List, CalendarBlank, Users, GitBranch, Edit3 } from '@phosphor-icons/react'
import { Template } from '@/types/templates'
import { User } from '@/types/user'
import { CodeBlock } from '@/components/code/CodeBlock'
import { CollaborativeEditor } from './CollaborativeEditor'

interface TemplateDetailModalProps {
  template: Template
  currentUser: User
  onClose: () => void
  onUse: () => void
}

export function TemplateDetailModal({ template, currentUser, onClose, onUse }: TemplateDetailModalProps) {
  const [activeFileIndex, setActiveFileIndex] = useState(0)
  const [showCollaborativeEditor, setShowCollaborativeEditor] = useState(false)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'advanced': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'expert': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-muted'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'web-app': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'cli-tool': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'exploitation': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'analysis': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'networking': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'forensics': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
      case 'automation': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
      default: return 'bg-muted'
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-bold mb-2">
                {template.name}
              </DialogTitle>
              <p className="text-muted-foreground mb-4">
                {template.description}
              </p>
              
              <div className="flex items-center gap-2 mb-4">
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
                <Badge variant="outline">
                  {template.license}
                </Badge>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={template.author.avatar} />
                    <AvatarFallback className="text-xs">
                      {template.author.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    by {template.author.username}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span>{template.stars}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    <span>{template.downloads}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarBlank className="w-4 h-4" />
                    <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
                  </div>
                  {template.branches && template.branches.length > 1 && (
                    <div className="flex items-center gap-1">
                      <GitBranch className="w-4 h-4" />
                      <span>{template.branches.length} branches</span>
                    </div>
                  )}
                  {template.team && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{template.team.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 ml-4">
              {template.collaboration?.isCollaborative && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowCollaborativeEditor(true)}
                  className="gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Collaboratively
                </Button>
              )}
              <Button variant="outline">
                <Star className="w-4 h-4 mr-2" />
                Star
              </Button>
              <Button onClick={onUse} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Copy className="w-4 h-4 mr-2" />
                Use Template
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <Tabs defaultValue="files" className="h-full flex flex-col">
            <div className="px-6">
              <TabsList className="grid w-fit grid-cols-4">
                <TabsTrigger value="files" className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Files
                </TabsTrigger>
                <TabsTrigger value="readme" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Setup
                </TabsTrigger>
                <TabsTrigger value="dependencies" className="flex items-center gap-2">
                  <List className="w-4 h-4" />
                  Dependencies
                </TabsTrigger>
                <TabsTrigger value="tags" className="flex items-center gap-2">
                  <List className="w-4 h-4" />
                  Tags
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 min-h-0 px-6 pb-6">
              <TabsContent value="files" className="h-full mt-4">
                <div className="grid grid-cols-12 gap-4 h-full">
                  {/* File list */}
                  <div className="col-span-3">
                    <h3 className="font-semibold mb-3">Files ({template.files.length})</h3>
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-1">
                        {template.files.map((file, index) => (
                          <button
                            key={file.id}
                            onClick={() => setActiveFileIndex(index)}
                            className={`w-full text-left p-2 rounded text-sm transition-colors ${
                              activeFileIndex === index
                                ? 'bg-accent text-accent-foreground'
                                : 'hover:bg-muted'
                            }`}
                          >
                            <div className="font-medium">{file.name}</div>
                            <div className="text-xs text-muted-foreground">{file.path}</div>
                            {file.isEntryPoint && (
                              <Badge variant="secondary" className="mt-1 text-xs">
                                Entry Point
                              </Badge>
                            )}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* File content */}
                  <div className="col-span-9">
                    {template.files[activeFileIndex] && (
                      <div className="h-full">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">
                            {template.files[activeFileIndex].name}
                          </h3>
                          <Badge variant="outline">
                            {template.files[activeFileIndex].language}
                          </Badge>
                        </div>
                        <CodeBlock
                          code={template.files[activeFileIndex].content}
                          language={template.files[activeFileIndex].language}
                          showCopy={true}
                          maxHeight="500px"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="readme" className="mt-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Setup Instructions</h3>
                    <div className="bg-muted rounded-lg p-4">
                      <pre className="text-sm whitespace-pre-wrap">
                        {template.setupInstructions}
                      </pre>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Usage Example</h3>
                    <div className="bg-muted rounded-lg p-4">
                      <pre className="text-sm whitespace-pre-wrap">
                        {template.usageExample}
                      </pre>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="dependencies" className="mt-4">
                <div>
                  <h3 className="font-semibold mb-3">Dependencies ({template.dependencies.length})</h3>
                  {template.dependencies.length === 0 ? (
                    <p className="text-muted-foreground">No dependencies required</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {template.dependencies.map((dep, index) => (
                        <div key={index} className="bg-muted rounded p-3">
                          <code className="text-sm">{dep}</code>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="tags" className="mt-4">
                <div>
                  <h3 className="font-semibold mb-3">Tags ({template.tags.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map(tag => (
                      <Badge key={tag} variant="outline">
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
      
      {/* Collaborative Editor Modal */}
      {showCollaborativeEditor && (
        <CollaborativeEditor
          template={template}
          currentUser={currentUser}
          onClose={() => setShowCollaborativeEditor(false)}
          onTemplateUpdated={(updatedTemplate) => {
            // Handle template updates
            setShowCollaborativeEditor(false)
          }}
        />
      )}
    </Dialog>
  )
}