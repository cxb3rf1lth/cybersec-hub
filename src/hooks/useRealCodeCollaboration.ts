/**
 * Production Code Collaboration Service
 * Real-time collaborative editing, version control, and code sharing
 */

import { useKV } from '@github/spark/hooks'
import { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import { codeCollaborationService, webSocketService } from '@/lib/production-services'

export interface CodeProject {
  id: string
  name: string
  description: string
  visibility: 'public' | 'private' | 'team'
  language: string
  framework?: string
  category: 'exploit' | 'tool' | 'poc' | 'analysis' | 'automation' | 'research'
  files: CodeFile[]
  collaborators: Array<{
    userId: string
    name: string
    avatar?: string
    role: 'owner' | 'admin' | 'write' | 'read'
    joinedAt: string
    lastActive?: string
  }>
  createdBy: string
  createdAt: string
  updatedAt: string
  stars: number
  forks: number
  tags: string[]
  license?: string
  repository?: {
    provider: 'github' | 'gitlab' | 'bitbucket'
    url: string
    branch: string
    lastSync?: string
  }
  vulnerability?: {
    cveId?: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    platform: string
    description: string
  }
}

export interface CodeFile {
  id: string
  projectId: string
  path: string
  name: string
  content: string
  language: string
  size: number
  createdAt: string
  updatedAt: string
  lastEditedBy?: string
  isDirectory: boolean
  parent?: string
}

export interface Operation {
  id: string
  type: 'insert' | 'delete' | 'retain'
  index: number
  length?: number
  content?: string
  userId: string
  timestamp: number
}

export interface CursorPosition {
  userId: string
  userName: string
  fileId: string
  line: number
  column: number
  selection?: {
    startLine: number
    startColumn: number
    endLine: number
    endColumn: number
  }
  timestamp: number
}

export interface CodeComment {
  id: string
  fileId: string
  projectId: string
  line: number
  column?: number
  content: string
  author: {
    userId: string
    name: string
    avatar?: string
  }
  replies: Array<{
    id: string
    content: string
    author: {
      userId: string
      name: string
      avatar?: string
    }
    timestamp: string
  }>
  resolved: boolean
  timestamp: string
  type: 'comment' | 'suggestion' | 'issue' | 'vulnerability'
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

export interface CodeCommit {
  id: string
  projectId: string
  message: string
  author: {
    userId: string
    name: string
    avatar?: string
  }
  timestamp: string
  changes: Array<{
    fileId: string
    path: string
    type: 'added' | 'modified' | 'deleted'
    linesAdded: number
    linesRemoved: number
  }>
  parentCommit?: string
  branch: string
  hash: string
}

// Operational Transform for real-time collaboration
class OperationalTransform {
  static transform(op1: Operation, op2: Operation): [Operation, Operation] {
    if (op1.type === 'retain') return [op1, op2]
    if (op2.type === 'retain') return [op1, op2]

    if (op1.type === 'insert' && op2.type === 'insert') {
      if (op1.index <= op2.index) {
        return [op1, { ...op2, index: op2.index + (op1.content?.length || 0) }]
      } else {
        return [{ ...op1, index: op1.index + (op2.content?.length || 0) }, op2]
      }
    }

    if (op1.type === 'delete' && op2.type === 'delete') {
      if (op1.index <= op2.index) {
        return [op1, { ...op2, index: Math.max(op2.index - (op1.length || 0), op1.index) }]
      } else {
        return [{ ...op1, index: op1.index - Math.min(op2.length || 0, op1.index - op2.index) }, op2]
      }
    }

    if (op1.type === 'insert' && op2.type === 'delete') {
      if (op1.index <= op2.index) {
        return [op1, { ...op2, index: op2.index + (op1.content?.length || 0) }]
      } else {
        return [{ ...op1, index: op1.index - Math.min(op2.length || 0, op1.index - op2.index) }, op2]
      }
    }

    if (op1.type === 'delete' && op2.type === 'insert') {
      if (op2.index <= op1.index) {
        return [{ ...op1, index: op1.index + (op2.content?.length || 0) }, op2]
      } else {
        return [op1, { ...op2, index: Math.max(op2.index - (op1.length || 0), op1.index) }]
      }
    }

    return [op1, op2]
  }

  static apply(content: string, operation: Operation): string {
    switch (operation.type) {
      case 'insert':
        return content.slice(0, operation.index) + (operation.content || '') + content.slice(operation.index)
      case 'delete':
        return content.slice(0, operation.index) + content.slice(operation.index + (operation.length || 0))
      case 'retain':
        return content
      default:
        return content
    }
  }
}

// WebSocket for real-time collaboration
class CodeCollaborationSocket {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private pendingOperations: Map<string, Operation[]> = new Map()
  private operationAcks: Map<string, number> = new Map()

  connect(projectId: string, userId: string, onMessage: (data: any) => void, onStatusChange: (status: string) => void) {
    try {
      const wsUrl = `wss://api.cyberconnect.io/code-collab?projectId=${projectId}&userId=${userId}&token=${this.getAuthToken()}`
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('Code collaboration WebSocket connected')
        onStatusChange('connected')
        this.reconnectAttempts = 0
        this.sendPendingOperations(projectId)
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'operation_ack') {
            this.handleOperationAck(data.payload)
            return
          }

          onMessage(data)
        } catch (error) {
          console.error('Failed to parse collaboration message:', error)
        }
      }

      this.ws.onclose = () => {
        onStatusChange('disconnected')
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnect(projectId, userId, onMessage, onStatusChange)
        }
      }

      this.ws.onerror = (error) => {
        console.error('Code collaboration WebSocket error:', error)
        onStatusChange('error')
      }
    } catch (error) {
      console.error('Failed to establish code collaboration connection:', error)
      onStatusChange('error')
    }
  }

  private reconnect(projectId: string, userId: string, onMessage: (data: any) => void, onStatusChange: (status: string) => void) {
    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000)
    
    setTimeout(() => {
      console.log(`Reconnecting code collaboration... Attempt ${this.reconnectAttempts}`)
      this.connect(projectId, userId, onMessage, onStatusChange)
    }, delay)
  }

  sendOperation(projectId: string, operation: Operation): boolean {
    const message = {
      type: 'operation',
      payload: { projectId, operation }
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
      
      // Store operation until acknowledged
      if (!this.pendingOperations.has(projectId)) {
        this.pendingOperations.set(projectId, [])
      }
      this.pendingOperations.get(projectId)!.push(operation)
      
      return true
    } else {
      // Store for later when connection is restored
      if (!this.pendingOperations.has(projectId)) {
        this.pendingOperations.set(projectId, [])
      }
      this.pendingOperations.get(projectId)!.push(operation)
      return false
    }
  }

  sendCursorPosition(projectId: string, cursor: CursorPosition): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'cursor_position',
        payload: { projectId, cursor }
      }))
      return true
    }
    return false
  }

  private sendPendingOperations(projectId: string) {
    const pending = this.pendingOperations.get(projectId) || []
    pending.forEach(operation => {
      this.sendOperation(projectId, operation)
    })
  }

  private handleOperationAck(ackData: { projectId: string; operationId: string }) {
    const pending = this.pendingOperations.get(ackData.projectId) || []
    const filtered = pending.filter(op => op.id !== ackData.operationId)
    this.pendingOperations.set(ackData.projectId, filtered)
  }

  private getAuthToken(): string {
    return localStorage.getItem('authToken') || ''
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

// GitHub Integration
class GitHubIntegration {
  private apiToken: string

  constructor(apiToken: string) {
    this.apiToken = apiToken
  }

  async createRepository(name: string, description: string, isPrivate: boolean = true): Promise<any> {
    const response = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `token ${this.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        description,
        private: isPrivate,
        auto_init: true
      })
    })

    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.statusText}`)
    }

    return await response.json()
  }

  async pushCode(repoUrl: string, files: CodeFile[], commitMessage: string): Promise<boolean> {
    try {
      // This would implement the full GitHub API push workflow
      // For brevity, showing simplified version
      const response = await fetch(`${repoUrl}/contents`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: commitMessage,
          content: btoa(files[0]?.content || ''), // Base64 encode
        })
      })

      return response.ok
    } catch (error) {
      console.error('GitHub push failed:', error)
      return false
    }
  }

  async createGist(files: CodeFile[], description: string, isPublic: boolean = false): Promise<string> {
    const gistFiles: Record<string, { content: string }> = {}
    files.forEach(file => {
      gistFiles[file.name] = { content: file.content }
    })

    const response = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        'Authorization': `token ${this.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description,
        public: isPublic,
        files: gistFiles
      })
    })

    if (!response.ok) {
      throw new Error(`GitHub Gist API Error: ${response.statusText}`)
    }

    const result = await response.json()
    return result.html_url
  }
}

export function useRealCodeCollaboration(currentUserId: string) {
  const [projects, setProjects] = useKV<CodeProject[]>('codeProjects', [])
  const [activeProject, setActiveProject] = useState<CodeProject | null>(null)
  const [activeCursors, setActiveCursors] = useState<CursorPosition[]>([])
  const [comments, setComments] = useKV<Record<string, CodeComment[]>>('codeComments', {})
  const [commits, setCommits] = useKV<Record<string, CodeCommit[]>>('codeCommits', {})
  const [collaborationStatus, setCollaborationStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  const [isLoading, setIsLoading] = useState(false)

  const collaborationSocketRef = useRef<CodeCollaborationSocket | null>(null)
  const operationQueueRef = useRef<Map<string, Operation[]>>(new Map())

  useEffect(() => {
    if (activeProject) {
      initializeCollaboration(activeProject.id)
    }
    return () => {
      collaborationSocketRef.current?.disconnect()
    }
  }, [activeProject?.id])

  const initializeCollaboration = useCallback(async (projectId: string) => {
    try {
      setCollaborationStatus('connecting')
      
      // Initialize collaboration using production service
      await codeCollaborationService.initializeCollaboration(projectId)
      
      // Set up real-time event handlers
      webSocketService.on('code_change', handleRemoteOperation)
      webSocketService.on('cursor_update', handleCursorUpdate)
      webSocketService.on('file_change', handleFileChange)
      webSocketService.on('comment_added', handleCommentAdded)
      webSocketService.on('user_joined', handleUserJoined)
      webSocketService.on('user_left', handleUserLeft)
      
      // Subscribe to project channel
      webSocketService.subscribe(`project:${projectId}`)
      
      setCollaborationStatus('connected')
    } catch (error) {
      console.error('Failed to initialize collaboration:', error)
      setCollaborationStatus('error')
    }
  }, [])

  const saveProject = useCallback(async (project: CodeProject) => {
    try {
      await codeCollaborationService.saveProject(project)
      
      // Update local state
      setProjects(current => 
        current.map(p => p.id === project.id ? project : p)
      )
      
      if (activeProject?.id === project.id) {
        setActiveProject(project)
      }
    } catch (error) {
      console.error('Failed to save project:', error)
      toast.error('Failed to save project')
    }
  }, [activeProject])

  const shareProject = useCallback(async (projectId: string, method: 'github' | 'gist' | 'link'): Promise<string> => {
    setIsLoading(true)
    
    try {
      const shareUrl = await codeCollaborationService.shareProject(projectId, method)
      
      navigator.clipboard.writeText(shareUrl)
      toast.success('Project shared! Link copied to clipboard')
      
      return shareUrl
    } catch (error) {
      console.error('Failed to share project:', error)
      toast.error(`Failed to share project: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleCollaborationMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'operation':
        handleRemoteOperation(data.payload)
        break
      case 'cursor_position':
        handleCursorUpdate(data.payload)
        break
      case 'file_change':
        handleFileChange(data.payload)
        break
      case 'comment_added':
        handleCommentAdded(data.payload)
        break
      case 'user_joined':
        handleUserJoined(data.payload)
        break
      case 'user_left':
        handleUserLeft(data.payload)
        break
    }
  }, [])

  const handleRemoteOperation = useCallback((operationData: { operation: Operation; fileId: string }) => {
    if (!activeProject) return

    const { operation, fileId } = operationData
    
    // Skip operations from current user to prevent conflicts
    if (operation.userId === currentUserId) return

    // Apply operation to file content
    setActiveProject(current => {
      if (!current) return current

      const updatedFiles = current.files.map(file => {
        if (file.id === fileId) {
          const newContent = OperationalTransform.apply(file.content, operation)
          return {
            ...file,
            content: newContent,
            updatedAt: new Date().toISOString(),
            lastEditedBy: operation.userId
          }
        }
        return file
      })

      return { ...current, files: updatedFiles }
    })

    // Update projects list
    setProjects(current => 
      current.map(project => 
        project.id === activeProject.id 
          ? { ...project, files: activeProject.files }
          : project
      )
    )
  }, [activeProject, currentUserId])

  const handleCursorUpdate = useCallback((cursorData: { cursor: CursorPosition }) => {
    const { cursor } = cursorData
    
    if (cursor.userId === currentUserId) return

    setActiveCursors(current => {
      const filtered = current.filter(c => !(c.userId === cursor.userId && c.fileId === cursor.fileId))
      return [...filtered, cursor]
    })

    // Remove cursor after 5 seconds of inactivity
    setTimeout(() => {
      setActiveCursors(current => 
        current.filter(c => c.timestamp > Date.now() - 5000)
      )
    }, 5000)
  }, [currentUserId])

  const handleFileChange = useCallback((fileData: { file: CodeFile }) => {
    if (!activeProject) return

    setActiveProject(current => {
      if (!current) return current

      const updatedFiles = current.files.map(file => 
        file.id === fileData.file.id ? fileData.file : file
      )

      return { ...current, files: updatedFiles }
    })
  }, [activeProject])

  const handleCommentAdded = useCallback((commentData: { comment: CodeComment }) => {
    const { comment } = commentData
    
    setComments(current => ({
      ...current,
      [comment.fileId]: [...(current[comment.fileId] || []), comment]
    }))
  }, [])

  const handleUserJoined = useCallback((userData: { userId: string; userName: string }) => {
    toast.success(`${userData.userName} joined the collaboration`)
  }, [])

  const handleUserLeft = useCallback((userData: { userId: string; userName: string }) => {
    toast.info(`${userData.userName} left the collaboration`)
    
    // Remove their cursors
    setActiveCursors(current => current.filter(c => c.userId !== userData.userId))
  }, [])

  const createProject = useCallback(async (projectData: Omit<CodeProject, 'id' | 'createdAt' | 'updatedAt' | 'files' | 'collaborators' | 'stars' | 'forks'>): Promise<CodeProject> => {
    setIsLoading(true)
    
    try {
      const projectId = `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const newProject: CodeProject = {
        ...projectData,
        id: projectId,
        files: [],
        collaborators: [{
          userId: currentUserId,
          name: 'You',
          role: 'owner',
          joinedAt: new Date().toISOString()
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stars: 0,
        forks: 0
      }

      // Create initial file structure
      const readmeFile: CodeFile = {
        id: `file-${Date.now()}-readme`,
        projectId: projectId,
        path: '/README.md',
        name: 'README.md',
        content: `# ${projectData.name}\n\n${projectData.description}\n\n## Description\n\nThis is a cybersecurity project for ${projectData.category}.\n\n## Usage\n\nTODO: Add usage instructions\n\n## Contributing\n\nContributions are welcome! Please follow responsible disclosure practices.\n`,
        language: 'markdown',
        size: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDirectory: false
      }

      newProject.files = [readmeFile]

      setProjects(current => [newProject, ...current])
      setActiveProject(newProject)
      
      toast.success('Project created successfully')
      return newProject
    } catch (error) {
      console.error('Failed to create project:', error)
      toast.error('Failed to create project')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [currentUserId])

  const addFile = useCallback(async (projectId: string, fileName: string, content: string = '', path: string = '/'): Promise<CodeFile> => {
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const language = getLanguageFromFileName(fileName)
    
    const newFile: CodeFile = {
      id: fileId,
      projectId,
      path: path.endsWith('/') ? path + fileName : `${path}/${fileName}`,
      name: fileName,
      content,
      language,
      size: content.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDirectory: false
    }

    setProjects(current => 
      current.map(project => 
        project.id === projectId 
          ? { ...project, files: [...project.files, newFile], updatedAt: new Date().toISOString() }
          : project
      )
    )

    if (activeProject?.id === projectId) {
      setActiveProject(current => 
        current ? { ...current, files: [...current.files, newFile] } : current
      )
    }

    return newFile
  }, [activeProject])

  const editFile = useCallback(async (fileId: string, newContent: string, operation?: Operation): Promise<void> => {
    if (!activeProject) return

    // Create operation if not provided
    if (!operation) {
      const file = activeProject.files.find(f => f.id === fileId)
      if (!file) return

      operation = {
        id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'insert',
        index: 0,
        content: newContent,
        userId: currentUserId,
        timestamp: Date.now()
      }
    }

    // Send operation to other collaborators
    collaborationSocketRef.current?.sendOperation(activeProject.id, operation)

    // Apply locally
    setActiveProject(current => {
      if (!current) return current

      const updatedFiles = current.files.map(file => 
        file.id === fileId 
          ? { 
              ...file, 
              content: newContent, 
              size: newContent.length,
              updatedAt: new Date().toISOString(),
              lastEditedBy: currentUserId
            }
          : file
      )

      return { ...current, files: updatedFiles, updatedAt: new Date().toISOString() }
    })

    // Update in projects list
    setProjects(current => 
      current.map(project => 
        project.id === activeProject.id 
          ? { ...project, files: activeProject.files, updatedAt: new Date().toISOString() }
          : project
      )
    )
  }, [activeProject, currentUserId])

  const updateCursorPosition = useCallback((fileId: string, line: number, column: number, selection?: CursorPosition['selection']) => {
    if (!activeProject) return

    const cursor: CursorPosition = {
      userId: currentUserId,
      userName: 'You',
      fileId,
      line,
      column,
      selection,
      timestamp: Date.now()
    }

    collaborationSocketRef.current?.sendCursorPosition(activeProject.id, cursor)
  }, [activeProject, currentUserId])

  const addComment = useCallback(async (fileId: string, line: number, content: string, type: CodeComment['type'] = 'comment'): Promise<CodeComment> => {
    const commentId = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const newComment: CodeComment = {
      id: commentId,
      fileId,
      projectId: activeProject?.id || '',
      line,
      content,
      author: {
        userId: currentUserId,
        name: 'You'
      },
      replies: [],
      resolved: false,
      timestamp: new Date().toISOString(),
      type
    }

    setComments(current => ({
      ...current,
      [fileId]: [...(current[fileId] || []), newComment]
    }))

    // Broadcast to other collaborators
    collaborationSocketRef.current?.ws?.send(JSON.stringify({
      type: 'comment_added',
      payload: { comment: newComment }
    }))

    return newComment
  }, [activeProject?.id, currentUserId])

  const shareProject = useCallback(async (projectId: string, method: 'github' | 'gist' | 'link'): Promise<string> => {
    setIsLoading(true)
    
    try {
      const project = projects.find(p => p.id === projectId)
      if (!project) throw new Error('Project not found')

      let shareUrl = ''

      if (method === 'github') {
        const githubToken = localStorage.getItem('githubToken')
        if (!githubToken) throw new Error('GitHub token not configured')

        const github = new GitHubIntegration(githubToken)
        const repo = await github.createRepository(project.name, project.description, false)
        await github.pushCode(repo.url, project.files, 'Initial commit from CyberConnect')
        shareUrl = repo.html_url
      } else if (method === 'gist') {
        const githubToken = localStorage.getItem('githubToken')
        if (!githubToken) throw new Error('GitHub token not configured')

        const github = new GitHubIntegration(githubToken)
        shareUrl = await github.createGist(project.files, project.description, true)
      } else if (method === 'link') {
        // Generate shareable link for the platform
        shareUrl = `https://cyberconnect.io/projects/${projectId}/view`
      }

      navigator.clipboard.writeText(shareUrl)
      toast.success('Project shared! Link copied to clipboard')
      
      return shareUrl
    } catch (error) {
      console.error('Failed to share project:', error)
      toast.error(`Failed to share project: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [projects])

  const forkProject = useCallback(async (originalProjectId: string): Promise<CodeProject> => {
    const originalProject = projects.find(p => p.id === originalProjectId)
    if (!originalProject) throw new Error('Project not found')

    const forkedProject: CodeProject = {
      ...originalProject,
      id: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${originalProject.name} (Fork)`,
      createdBy: currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      collaborators: [{
        userId: currentUserId,
        name: 'You',
        role: 'owner',
        joinedAt: new Date().toISOString()
      }],
      stars: 0,
      forks: 0,
      files: originalProject.files.map(file => ({
        ...file,
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        projectId: forkedProject.id
      }))
    }

    setProjects(current => [forkedProject, ...current])
    
    // Increment fork count on original
    setProjects(current => 
      current.map(project => 
        project.id === originalProjectId 
          ? { ...project, forks: project.forks + 1 }
          : project
      )
    )

    toast.success('Project forked successfully')
    return forkedProject
  }, [projects, currentUserId])

  const getLanguageFromFileName = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'go': 'go',
      'rs': 'rust',
      'c': 'c',
      'cpp': 'cpp',
      'h': 'c',
      'sh': 'bash',
      'ps1': 'powershell',
      'sql': 'sql',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'txt': 'text'
    }
    return languageMap[extension || ''] || 'text'
  }

  return {
    projects,
    activeProject,
    activeCursors,
    comments,
    commits,
    collaborationStatus,
    isLoading,
    setActiveProject,
    createProject,
    addFile,
    editFile,
    updateCursorPosition,
    addComment,
    shareProject,
    forkProject
  }
}