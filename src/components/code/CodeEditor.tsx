import { useState, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Play, Save, Share, Users, GitBranch, Clock, Download, Copy, Bug } from '@phosphor-icons/react'
import { Repository, User, RepositoryFile, CodeEditor as CodeEditorType, EditorCollaborator } from '@/types/user'
import { toast } from 'sonner'

interface CodeEditorProps {
  repository: Repository
  filePath: string
  currentUser: User
  onBack: () => void
}

export function CodeEditor({ repository, filePath, currentUser, onBack }: CodeEditorProps) {
  const [repositories, setRepositories] = useKV<Repository[]>('repositories', [])
  const [editorState, setEditorState] = useKV<CodeEditorType[]>('editorSessions', [])
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareEmail, setShareEmail] = useState('')
  const [sharePermission, setSharePermission] = useState<'read' | 'write'>('read')
  const [activeCollaborators, setActiveCollaborators] = useState<EditorCollaborator[]>([])
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [content, setContent] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const [selectedText, setSelectedText] = useState('')
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>('dark')

  // Find the current file
  const currentFile = repository.files.find(file => file.path === filePath)
  
  useEffect(() => {
    if (currentFile) {
      setContent(currentFile.content)
      setIsDirty(false)
    }
  }, [currentFile])

  useEffect(() => {
    // Update cursor position when text changes
    if (textareaRef.current) {
      const textarea = textareaRef.current
      const updateCursorPosition = () => {
        const start = textarea.selectionStart
        const textBeforeCursor = content.substring(0, start)
        const lines = textBeforeCursor.split('\n')
        const line = lines.length
        const column = lines[lines.length - 1].length + 1
        setCursorPosition({ line, column })
      }

      textarea.addEventListener('selectionchange', updateCursorPosition)
      textarea.addEventListener('click', updateCursorPosition)
      textarea.addEventListener('keyup', updateCursorPosition)

      return () => {
        textarea.removeEventListener('selectionchange', updateCursorPosition)
        textarea.removeEventListener('click', updateCursorPosition)
        textarea.removeEventListener('keyup', updateCursorPosition)
      }
    }
  }, [content])

  const getLanguageFromFilePath = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase()
    const langMap: { [key: string]: string } = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'go': 'go',
      'rs': 'rust',
      'c': 'c',
      'cpp': 'cpp',
      'sh': 'bash',
      'ps1': 'powershell',
      'md': 'markdown',
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml',
      'sql': 'sql',
      'php': 'php',
      'rb': 'ruby',
      'java': 'java'
    }
    return langMap[ext || ''] || 'text'
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    setIsDirty(true)
  }

  const handleSave = () => {
    if (!currentFile) return

    setRepositories(prev => prev.map(repo => {
      if (repo.id === repository.id) {
        return {
          ...repo,
          files: repo.files.map(file => 
            file.path === filePath 
              ? { ...file, content, lastModified: new Date().toISOString() }
              : file
          ),
          updatedAt: new Date().toISOString()
        }
      }
      return repo
    }))
    
    setIsDirty(false)
    toast.success('File saved successfully')
  }

  const handleRunCode = () => {
    const language = getLanguageFromFilePath(filePath)
    
    // Simulate code execution
    if (language === 'python') {
      toast.success('Python code executed successfully')
    } else if (language === 'javascript') {
      toast.success('JavaScript code executed successfully')
    } else {
      toast.info(`Code execution not supported for ${language}`)
    }
  }

  const handleShare = () => {
    if (!shareEmail.trim()) {
      toast.error('Please enter an email address')
      return
    }

    // Simulate sharing
    toast.success(`File shared with ${shareEmail} (${sharePermission} access)`)
    setShowShareDialog(false)
    setShareEmail('')
    setSharePermission('read')
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content)
    toast.success('Code copied to clipboard')
  }

  const downloadFile = () => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = currentFile?.name || 'file.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('File downloaded')
  }

  const getLineNumbers = () => {
    const lines = content.split('\n')
    return lines.map((_, index) => index + 1)
  }

  const syntaxHighlight = (code: string, language: string) => {
    // Basic syntax highlighting
    const keywords: { [key: string]: string[] } = {
      python: ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'import', 'from', 'return', 'try', 'except', 'with', 'as'],
      javascript: ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'class', 'import', 'export', 'async', 'await'],
      go: ['func', 'var', 'const', 'if', 'else', 'for', 'range', 'return', 'package', 'import', 'type', 'struct'],
      rust: ['fn', 'let', 'mut', 'const', 'if', 'else', 'for', 'while', 'loop', 'match', 'return', 'struct', 'enum', 'impl']
    }

    let highlighted = code
    const languageKeywords = keywords[language] || []
    
    languageKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g')
      highlighted = highlighted.replace(regex, `<span class="text-blue-400 font-semibold">${keyword}</span>`)
    })

    // Highlight strings
    highlighted = highlighted.replace(/"([^"]*)"/g, '<span class="text-green-400">"$1"</span>')
    highlighted = highlighted.replace(/'([^']*)'/g, '<span class="text-green-400">\'$1\'</span>')
    
    // Highlight comments
    highlighted = highlighted.replace(/#(.*)$/gm, '<span class="text-gray-500">#$1</span>')
    highlighted = highlighted.replace(/\/\/(.*)$/gm, '<span class="text-gray-500">//$1</span>')

    return highlighted
  }

  if (!currentFile) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-6 border-b border-border">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Repository
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Bug className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>File not found</p>
          </div>
        </div>
      </div>
    )
  }

  const language = getLanguageFromFilePath(filePath)
  const lineNumbers = getLineNumbers()

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Repository
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">{currentFile.name}</h1>
              <Badge variant="secondary">{language}</Badge>
              {isDirty && <Badge variant="destructive">Unsaved</Badge>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={downloadFile}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share File</DialogTitle>
                  <DialogDescription>
                    Share this file with other cybersecurity professionals
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      placeholder="colleague@example.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="permission">Permission Level</Label>
                    <Select value={sharePermission} onValueChange={(value: any) => setSharePermission(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="read">Read Only</SelectItem>
                        <SelectItem value="write">Read & Write</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleShare}>Share File</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={handleRunCode}>
              <Play className="w-4 h-4 mr-2" />
              Run
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!isDirty}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-6">
            <span>Line {cursorPosition.line}, Column {cursorPosition.column}</span>
            <span>{content.length} characters</span>
            <span>{lineNumbers.length} lines</span>
            {activeCollaborators.length > 0 && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{activeCollaborators.length} collaborators</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span>Last modified: {new Date(currentFile.lastModified).toLocaleString()}</span>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Auto-save enabled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line numbers */}
        <div className="w-16 bg-muted/20 border-r border-border p-2 text-right font-mono text-sm text-muted-foreground overflow-hidden">
          {lineNumbers.map(lineNum => (
            <div key={lineNum} className="h-6 leading-6">
              {lineNum}
            </div>
          ))}
        </div>

        {/* Code content */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full h-full p-4 bg-background text-foreground font-mono text-sm resize-none border-none outline-none leading-6"
            style={{
              tabSize: 2,
              whiteSpace: 'pre',
              overflowWrap: 'normal',
              overflowX: 'auto'
            }}
            spellCheck={false}
            placeholder={`Start coding in ${language}...`}
          />
          
          {/* Syntax highlighting overlay */}
          {content && (
            <div 
              className="absolute inset-0 p-4 font-mono text-sm leading-6 pointer-events-none opacity-0"
              dangerouslySetInnerHTML={{ 
                __html: syntaxHighlight(content, language) 
              }}
            />
          )}
        </div>
      </div>

      {/* Collaborators bar */}
      {activeCollaborators.length > 0 && (
        <div className="p-2 border-t border-border bg-card">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Active collaborators:</span>
            {activeCollaborators.map(collaborator => (
              <Badge key={collaborator.userId} variant="outline" className="text-xs">
                {collaborator.userId}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}