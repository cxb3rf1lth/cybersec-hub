import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Code, FileText, X } from '@phosphor-icons/react'
import { MatrixDots } from '@/components/ui/loading-animations'
import { User, Post } from '@/types/user'

interface CreatePostModalProps {
  currentUser: User
  onClose: () => void
  onCreatePost: (post: Post) => void
}

const PROGRAMMING_LANGUAGES = [
  'python', 'javascript', 'bash', 'powershell', 'c', 'cpp', 'java',
  'go', 'rust', 'sql', 'html', 'css', 'json', 'yaml', 'xml'
]

const COMMON_TAGS = [
  'vulnerability', 'exploit', 'detection', 'automation', 'forensics',
  'malware', 'network-security', 'web-security', 'mobile-security',
  'cloud-security', 'threat-hunting', 'incident-response'
]

export function CreatePostModal({ currentUser, onClose, onCreatePost }: CreatePostModalProps) {
  const [postType, setPostType] = useState<'text' | 'code'>('text')
  const [content, setContent] = useState('')
  const [codeLanguage, setCodeLanguage] = useState('python')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)

  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) return

    setIsPublishing(true)
    
    // Simulate posting delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const post: Post = {
      id: Date.now().toString(),
      authorId: currentUser.id,
      content: content.trim(),
      type: postType,
      codeLanguage: postType === 'code' ? codeLanguage : undefined,
      tags,
      likes: [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    onCreatePost(post)
    setIsPublishing(false)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={postType} onValueChange={(value) => setPostType(value as 'text' | 'code')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Text Post
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Code Snippet
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <div>
                <Label htmlFor="text-content">Share your thoughts</Label>
                <Textarea
                  id="text-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind? Share insights, ask questions, or discuss cybersecurity topics..."
                  rows={6}
                  className="mt-2"
                />
              </div>
            </TabsContent>

            <TabsContent value="code" className="space-y-4">
              <div>
                <Label htmlFor="language">Programming Language</Label>
                <Select value={codeLanguage} onValueChange={setCodeLanguage}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAMMING_LANGUAGES.map(lang => (
                      <SelectItem key={lang} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="code-content">Code</Label>
                <Textarea
                  id="code-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your code here..."
                  rows={12}
                  className="mt-2 font-mono text-sm code-scroll"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2 mb-3">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-2 mb-3">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag(newTag)
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddTag(newTag)}
              >
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {COMMON_TAGS.filter(tag => !tags.includes(tag)).map(tag => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleAddTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPublishing}>
              Cancel
            </Button>
            <Button type="submit" disabled={!content.trim() || isPublishing} className="hover-red-glow">
              {isPublishing ? (
                <div className="flex items-center gap-2">
                  <MatrixDots size="sm" />
                  Publishing...
                </div>
              ) : (
                'Publish Post'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}