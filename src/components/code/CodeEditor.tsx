import { useState, useEffect, useRef, useCallback } from 'react';
import { useKVWithFallback } from '@/lib/kv-fallback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BinaryRain, ImmersiveBinaryRain } from '@/components/ui/loading-animations';
import { ArrowLeft, Play, Save, Share, Users, GitBranch, Clock, Download, Copy, Bug, GitCommit, History, Eye, EyeClosed } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface CodeEditorProps {
  repository: Repository
  filePath: string
  currentUser: User
  onBack: () => void
}

export function CodeEditor({ repository, filePath, currentUser, onBack }: CodeEditorProps) {
  const [repositories, setRepositories] = useKVWithFallback<Repository[]>('repositories', []);
  const [editorState, setEditorState] = useKVWithFallback<CodeEditorType[]>('editorSessions', []);
  const [allUsers] = useKVWithFallback<User[]>('allUsers', []);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<'read' | 'write'>('read');
  const [commitMessage, setCommitMessage] = useState('');
  const [activeCollaborators, setActiveCollaborators] = useState<EditorCollaborator[]>([]);
  const [showCollaboratorCursors, setShowCollaboratorCursors] = useState(true);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [selectedText, setSelectedText] = useState('');
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>('dark');
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [codeOutput, setCodeOutput] = useState<string>('');

  // Find the current file
  const currentFile = repository.files.find(file => file.path === filePath);
  
  useEffect(() => {
    if (currentFile) {
      setContent(currentFile.content);
      setIsDirty(false);
    }
  }, [currentFile]);
  
  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (isDirty && content.trim()) {
        setIsAutoSaving(true);
        handleAutoSave();
      }
    }, 10000); // Auto-save every 10 seconds

    return () => clearInterval(autoSaveInterval);
  }, [isDirty, content]);

  // Real-time collaboration simulation
  useEffect(() => {
    const sessionId = `${repository.id}-${filePath}`;
    const currentSession = editorState.find(session => session.id === sessionId);
    
    if (!currentSession) {
      // Create new editor session with mock collaborators
      const mockCollaborators: EditorCollaborator[] = [
        {
          userId: currentUser.id,
          cursorPosition,
          selections: [],
          color: '#3b82f6',
          isActive: true,
          lastSeen: new Date().toISOString()
        }
      ];

      // Add mock collaborators if they are repository collaborators
      if (repository.collaborators.includes('user_sample_2')) {
        mockCollaborators.push({
          userId: 'user_sample_2',
          cursorPosition: { line: Math.floor(Math.random() * 20) + 1, column: Math.floor(Math.random() * 40) + 1 },
          selections: [],
          color: '#10b981',
          isActive: Math.random() > 0.3, // 70% chance active
          lastSeen: new Date(Date.now() - Math.random() * 5 * 60 * 1000).toISOString() // Random within 5 minutes
        });
      }

      if (repository.collaborators.includes('user_sample_3')) {
        mockCollaborators.push({
          userId: 'user_sample_3',
          cursorPosition: { line: Math.floor(Math.random() * 20) + 1, column: Math.floor(Math.random() * 40) + 1 },
          selections: [],
          color: '#f59e0b',
          isActive: Math.random() > 0.5, // 50% chance active
          lastSeen: new Date(Date.now() - Math.random() * 10 * 60 * 1000).toISOString() // Random within 10 minutes
        });
      }

      const newSession: CodeEditorType = {
        id: sessionId,
        repositoryId: repository.id,
        fileName: currentFile?.name || '',
        filePath,
        content,
        language: getLanguageFromFilePath(filePath),
        cursorPosition,
        selections: [],
        collaborators: mockCollaborators,
        isReadOnly: false,
        isDirty,
        lastSaved: new Date().toISOString()
      };
      
      setEditorState(prev => [...prev.filter(s => s.id !== sessionId), newSession]);
    } else {
      // Update collaborators list
      setActiveCollaborators(currentSession.collaborators.filter(c => c.userId !== currentUser.id && c.isActive));
    }

    // Simulate real-time cursor movements and activity
    const collaborationInterval = setInterval(() => {
      setEditorState(prev => prev.map(session => {
        if (session.id === sessionId) {
          const updatedCollaborators = session.collaborators.map(collaborator => {
            if (collaborator.userId === currentUser.id) {
              return {
                ...collaborator,
                cursorPosition,
                isActive: true,
                lastSeen: new Date().toISOString()
              };
            } else if (collaborator.isActive && Math.random() > 0.7) {
              // Simulate occasional cursor movement for other collaborators
              const contentLines = content.split('\n');
              const randomLine = Math.min(Math.floor(Math.random() * contentLines.length) + 1, contentLines.length);
              const randomColumn = Math.min(Math.floor(Math.random() * 50) + 1, contentLines[randomLine - 1]?.length || 1);
              
              return {
                ...collaborator,
                cursorPosition: { line: randomLine, column: randomColumn },
                lastSeen: new Date().toISOString()
              };
            }
            return collaborator;
          });

          return {
            ...session,
            collaborators: updatedCollaborators
          };
        }
        return session;
      }));
    }, 2000); // Update every 2 seconds

    return () => clearInterval(collaborationInterval);
  }, [cursorPosition, repository.id, filePath, currentUser.id, content]);

  // Simulate receiving real-time updates from other collaborators
  useEffect(() => {
    const sessionId = `${repository.id}-${filePath}`;
    const currentSession = editorState.find(session => session.id === sessionId);
    
    if (currentSession) {
      const otherCollaborators = currentSession.collaborators.filter(c => c.userId !== currentUser.id && c.isActive);
      setActiveCollaborators(otherCollaborators);
    }
  }, [editorState, repository.id, filePath, currentUser.id]);

  useEffect(() => {
    // Update cursor position when text changes
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const updateCursorPosition = () => {
        const start = textarea.selectionStart;
        const textBeforeCursor = content.substring(0, start);
        const lines = textBeforeCursor.split('\n');
        const line = lines.length;
        const column = lines[lines.length - 1].length + 1;
        setCursorPosition({ line, column });
      };

      textarea.addEventListener('selectionchange', updateCursorPosition);
      textarea.addEventListener('click', updateCursorPosition);
      textarea.addEventListener('keyup', updateCursorPosition);

      return () => {
        textarea.removeEventListener('selectionchange', updateCursorPosition);
        textarea.removeEventListener('click', updateCursorPosition);
        textarea.removeEventListener('keyup', updateCursorPosition);
      };
    }
  }, [content]);

  const getLanguageFromFilePath = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
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
    };
    return langMap[ext || ''] || 'text';
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setIsDirty(true);
    
    // Broadcast changes to other collaborators
    const sessionId = `${repository.id}-${filePath}`;
    setEditorState(prev => prev.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          content: newContent,
          isDirty: true
        };
      }
      return session;
    }));
  };

  const handleAutoSave = useCallback(() => {
    if (!currentFile || !isDirty) {return;}

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
        };
      }
      return repo;
    }));

    setIsAutoSaving(false);
    setLastAutoSave(new Date());
    toast.success('Auto-saved', { duration: 2000 });
  }, [currentFile, isDirty, content, filePath, repository.id, setRepositories]);

  const handleSave = () => {
    if (!currentFile) {return;}

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
        };
      }
      return repo;
    }));
    
    setIsDirty(false);
    toast.success('File saved successfully');
  };

  const handleCommit = () => {
    if (!commitMessage.trim()) {
      toast.error('Please enter a commit message');
      return;
    }

    const newCommit: Commit = {
      id: Math.random().toString(36).substr(2, 9),
      message: commitMessage,
      authorId: currentUser.id,
      authorName: currentUser.username,
      authorEmail: currentUser.email,
      hash: Math.random().toString(36).substr(2, 9),
      branch: repository.defaultBranch,
      filesChanged: [{
        path: filePath,
        type: 'modified',
        additions: content.split('\n').length,
        deletions: 0
      }],
      additions: content.split('\n').length,
      deletions: 0,
      createdAt: new Date().toISOString()
    };

    setRepositories(prev => prev.map(repo => {
      if (repo.id === repository.id) {
        return {
          ...repo,
          files: repo.files.map(file => 
            file.path === filePath 
              ? { ...file, content, lastModified: new Date().toISOString(), lastCommit: newCommit.hash }
              : file
          ),
          commits: [newCommit, ...repo.commits],
          updatedAt: new Date().toISOString()
        };
      }
      return repo;
    }));

    setIsDirty(false);
    setShowCommitDialog(false);
    setCommitMessage('');
    toast.success('Changes committed successfully');
  };

  const handleRunCode = () => {
    const language = getLanguageFromFilePath(filePath);
    setIsRunningCode(true);
    setCodeOutput('');
    
    // Simulate code execution with binary rain effect
    setTimeout(() => {
      if (language === 'python') {
        setCodeOutput('Code executed successfully!\n\nOutput:\nHello, CyberConnect!\nProcess completed with exit code 0');
        toast.success('Python code executed successfully');
      } else if (language === 'javascript') {
        setCodeOutput('Code executed successfully!\n\nOutput:\nconsole.log("Secure connection established")\nProcess completed with exit code 0');
        toast.success('JavaScript code executed successfully');
      } else if (language === 'bash' || language === 'sh') {
        setCodeOutput('Script executed successfully!\n\nOutput:\nInitializing security scan...\nScan complete. No vulnerabilities found.\nProcess completed with exit code 0');
        toast.success('Bash script executed successfully');
      } else {
        setCodeOutput(`Compilation successful!\n\nOutput:\nCode analysis complete for ${language}\nNo syntax errors detected.\nProcess completed with exit code 0`);
        toast.info(`Code execution completed for ${language}`);
      }
      setIsRunningCode(false);
    }, 2000 + Math.random() * 1000); // Random execution time between 2-3 seconds
  };

  const handleShare = () => {
    if (!shareEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    // Simulate sharing
    toast.success(`File shared with ${shareEmail} (${sharePermission} access)`);
    setShowShareDialog(false);
    setShareEmail('');
    setSharePermission('read');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    toast.success('Code copied to clipboard');
  };

  const downloadFile = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile?.name || 'file.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('File downloaded');
  };

  const renderCollaboratorCursors = () => {
    if (!showCollaboratorCursors || !textareaRef.current) {return null;}

    return activeCollaborators.map(collaborator => {
      const user = allUsers.find(u => u.id === collaborator.userId);
      if (!user) {return null;}

      const { line, column } = collaborator.cursorPosition;
      const lineHeight = 24; // Match the leading-6 class
      const charWidth = 8.4; // Approximate character width in monospace font
      
      return (
        <div
          key={collaborator.userId}
          className="absolute pointer-events-none z-10"
          style={{
            top: `${(line - 1) * lineHeight + 16}px`, // 16px for padding
            left: `${column * charWidth + 64 + 16}px`, // 64px for line numbers + 16px padding
            transform: 'translateX(-1px)'
          }}
        >
          <div 
            className="w-0.5 h-6 opacity-80"
            style={{ backgroundColor: collaborator.color }}
          />
          <div 
            className="absolute -top-6 left-0 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
            style={{ backgroundColor: collaborator.color }}
          >
            {user.username}
          </div>
        </div>
      );
    });
  };

  const renderVersionHistory = () => {
    const recentCommits = repository.commits
      .filter(commit => commit.filesChanged.some(file => file.path === filePath))
      .slice(0, 10);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Version History</h3>
          <Button variant="outline" size="sm" onClick={() => setShowVersionHistory(false)}>
            Close
          </Button>
        </div>
        
        {recentCommits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No commits found for this file</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentCommits.map(commit => {
              const author = allUsers.find(u => u.id === commit.authorId);
              return (
                <Card key={commit.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <GitCommit className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono text-sm text-muted-foreground">
                          {commit.hash.substring(0, 7)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {commit.branch}
                        </Badge>
                      </div>
                      <p className="font-medium mb-1">{commit.message}</p>
                      <div className="text-sm text-muted-foreground">
                        {author?.username || 'Unknown'} • {new Date(commit.createdAt).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="text-green-500">+{commit.additions} additions</span>
                        <span className="text-red-500">-{commit.deletions} deletions</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const getLineNumbers = () => {
    const lines = content.split('\n');
    return lines.map((_, index) => index + 1);
  };

  const syntaxHighlight = (code: string, language: string) => {
    // Basic syntax highlighting
    const keywords: { [key: string]: string[] } = {
      python: ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'import', 'from', 'return', 'try', 'except', 'with', 'as'],
      javascript: ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'class', 'import', 'export', 'async', 'await'],
      go: ['func', 'var', 'const', 'if', 'else', 'for', 'range', 'return', 'package', 'import', 'type', 'struct'],
      rust: ['fn', 'let', 'mut', 'const', 'if', 'else', 'for', 'while', 'loop', 'match', 'return', 'struct', 'enum', 'impl']
    };

    let highlighted = code;
    const languageKeywords = keywords[language] || [];
    
    languageKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlighted = highlighted.replace(regex, `<span class="text-blue-400 font-semibold">${keyword}</span>`);
    });

    // Highlight strings
    highlighted = highlighted.replace(/"([^"]*)"/g, '<span class="text-green-400">"$1"</span>');
    highlighted = highlighted.replace(/'([^']*)'/g, '<span class="text-green-400">\'$1\'</span>');
    
    // Highlight comments
    highlighted = highlighted.replace(/#(.*)$/gm, '<span class="text-gray-500">#$1</span>');
    highlighted = highlighted.replace(/\/\/(.*)$/gm, '<span class="text-gray-500">//$1</span>');

    return highlighted;
  };

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
    );
  }

  const language = getLanguageFromFilePath(filePath);
  const lineNumbers = getLineNumbers();

  return (
    <div className="h-full flex flex-col relative">
      {/* Immersive Background Binary Rain Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Primary rain columns */}
        <div className="absolute inset-0 opacity-15">
          <div className="grid grid-cols-20 gap-1 h-full w-full">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={`primary-${i}`} className="relative h-full">
                <BinaryRain 
                  columns={1} 
                  speed="normal" 
                  density="normal" 
                  variant="matrix"
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Secondary slower rain for depth */}
        <div className="absolute inset-0 opacity-8">
          <div className="grid grid-cols-15 gap-2 h-full w-full">
            {Array.from({ length: 15 }).map((_, i) => (
              <div 
                key={`secondary-${i}`} 
                className="relative h-full"
              >
                <BinaryRain 
                  columns={1} 
                  speed="slow" 
                  density="sparse" 
                  variant="cyber"
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Accent streams on edges */}
        <div className="absolute left-0 top-0 h-full w-8 opacity-20">
          <BinaryRain 
            columns={2} 
            speed="fast" 
            density="dense" 
            variant="cyber"
          />
        </div>
        <div className="absolute right-0 top-0 h-full w-8 opacity-20">
          <BinaryRain 
            columns={2} 
            speed="fast" 
            density="dense" 
            variant="cyber"
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowCollaboratorCursors(!showCollaboratorCursors)}
            >
              {showCollaboratorCursors ? <Eye className="w-4 h-4 mr-2" /> : <EyeClosed className="w-4 h-4 mr-2" />}
              Cursors
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowVersionHistory(true)}>
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
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
            <Dialog open={showCommitDialog} onOpenChange={setShowCommitDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={!isDirty}>
                  <GitCommit className="w-4 h-4 mr-2" />
                  Commit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Commit Changes</DialogTitle>
                  <DialogDescription>
                    Save your changes to the repository with a descriptive message
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="commit-message">Commit Message</Label>
                    <Textarea
                      id="commit-message"
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      placeholder="Describe your changes..."
                      rows={3}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Files changed: {currentFile?.name}</p>
                    <p>Branch: {repository.defaultBranch}</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCommitDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCommit}>Commit Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                <div className="flex -space-x-1">
                  {activeCollaborators.slice(0, 3).map(collaborator => {
                    const user = allUsers.find(u => u.id === collaborator.userId);
                    return (
                      <div
                        key={collaborator.userId}
                        className="w-6 h-6 rounded-full border-2 border-background flex items-center justify-center text-xs font-medium text-white"
                        style={{ backgroundColor: collaborator.color }}
                        title={user?.username || 'Unknown'}
                      >
                        {user?.username?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    );
                  })}
                  {activeCollaborators.length > 3 && (
                    <div className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs">
                      +{activeCollaborators.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span>Last modified: {new Date(currentFile.lastModified).toLocaleString()}</span>
            {isAutoSaving && (
              <div className="flex items-center gap-2 text-amber-500">
                <Clock className="w-4 h-4 animate-spin" />
                <span>Auto-saving...</span>
              </div>
            )}
            {lastAutoSave && !isAutoSaving && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Auto-saved {lastAutoSave.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main editor area */}
      {showVersionHistory ? (
        <div className="flex-1 p-6 bg-background">
          {renderVersionHistory()}
        </div>
      ) : (
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

            {/* Collaborator cursors */}
            {renderCollaboratorCursors()}
          </div>
        </div>
      )}

      {/* Enhanced collaborators bar */}
      {activeCollaborators.length > 0 && (
        <div className="p-3 border-t border-border bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Active collaborators:</span>
              <div className="flex items-center gap-2">
                {activeCollaborators.map(collaborator => {
                  const user = allUsers.find(u => u.id === collaborator.userId);
                  return (
                    <div key={collaborator.userId} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: collaborator.color }}
                      />
                      <Badge variant="outline" className="text-xs">
                        {user?.username || 'Unknown'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Real-time sync enabled
              </Badge>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      )}
      
      {/* Code execution output panel */}
      {(isRunningCode || codeOutput) && (
        <div className="border-t border-border bg-card">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Output</h3>
              {codeOutput && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setCodeOutput('')}
                >
                  Clear
                </Button>
              )}
            </div>
            
            {isRunningCode ? (
              <div className="bg-background rounded-lg border border-border overflow-hidden">
                <ImmersiveBinaryRain 
                  message="Executing code..." 
                  className="h-32"
                />
              </div>
            ) : (
              <div className="bg-background rounded-lg border border-border p-4">
                <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">
                  {codeOutput}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}