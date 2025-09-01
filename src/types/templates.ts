export interface Template {
  id: string
  name: string
  description: string
  category: 'web-app' | 'cli-tool' | 'exploitation' | 'analysis' | 'networking' | 'forensics' | 'automation'
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  files: TemplateFile[]
  dependencies: string[]
  setupInstructions: string
  usageExample: string
  author: {
    id: string
    username: string
    avatar: string
  }
  stars: number
  downloads: number
  createdAt: Date
  updatedAt: Date
  isPublic: boolean
  license: string
  framework?: 'python' | 'javascript' | 'bash' | 'powershell' | 'go' | 'rust' | 'c' | 'cpp'
  collaboration?: CollaborationSettings
  team?: TeamInfo
  version: string
  branches?: TemplateBranch[]
}

export interface TemplateFile {
  id: string
  name: string
  path: string
  content: string
  language: string
  isEntryPoint?: boolean
  lastModifiedBy?: {
    id: string
    username: string
    avatar: string
  }
  lastModified?: Date
  changeHistory?: FileChange[]
}

export interface ToolRepository {
  id: string
  name: string
  description: string
  category: 'reconnaissance' | 'exploitation' | 'post-exploitation' | 'defense' | 'analysis' | 'automation'
  tools: Tool[]
  author: {
    id: string
    username: string
    avatar: string
  }
  isPublic: boolean
  stars: number
  forks: number
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

export interface Tool {
  id: string
  name: string
  description: string
  version: string
  installCommand: string
  usageExample: string
  documentation: string
  platform: ('linux' | 'windows' | 'macos' | 'web')[]
  dependencies: string[]
  category: 'scanner' | 'exploit' | 'payload' | 'encoder' | 'decoder' | 'analyzer' | 'monitor'
  complexity: 'simple' | 'moderate' | 'complex'
}

export interface TemplateSearchFilters {
  category?: string
  difficulty?: string
  framework?: string
  tags?: string[]
  sortBy?: 'stars' | 'downloads' | 'recent' | 'name'
  sortOrder?: 'asc' | 'desc'
}

export interface RepositorySearchFilters {
  category?: string
  tags?: string[]
  sortBy?: 'stars' | 'forks' | 'recent' | 'name'
  sortOrder?: 'asc' | 'desc'
}

// Collaboration interfaces
export interface CollaborationSettings {
  isCollaborative: boolean
  allowedUsers: string[]
  permissions: {
    [userId: string]: 'read' | 'write' | 'admin'
  }
  requireApproval: boolean
  maxCollaborators: number
}

export interface TeamInfo {
  id: string
  name: string
  description: string
  members: TeamMember[]
  createdAt: Date
  isPublic: boolean
  avatar?: string
}

export interface TeamMember {
  id: string
  username: string
  avatar: string
  role: 'owner' | 'admin' | 'maintainer' | 'developer' | 'viewer'
  joinedAt: Date
  lastActive: Date
  permissions: CollaboratorPermissions
}

export interface CollaboratorPermissions {
  canEdit: boolean
  canDelete: boolean
  canInvite: boolean
  canManagePermissions: boolean
  canCreateBranches: boolean
  canMergeBranches: boolean
  canPublish: boolean
}

export interface TemplateBranch {
  id: string
  name: string
  description: string
  createdBy: {
    id: string
    username: string
    avatar: string
  }
  createdAt: Date
  lastModified: Date
  isMain: boolean
  commits: TemplateCommit[]
  status: 'active' | 'merged' | 'abandoned'
}

export interface TemplateCommit {
  id: string
  message: string
  author: {
    id: string
    username: string
    avatar: string
  }
  timestamp: Date
  changes: FileChange[]
  parentCommit?: string
}

export interface FileChange {
  type: 'added' | 'modified' | 'deleted' | 'renamed'
  filePath: string
  oldPath?: string
  content?: string
  oldContent?: string
  linesAdded: number
  linesRemoved: number
}

export interface PullRequest {
  id: string
  title: string
  description: string
  sourceBranch: string
  targetBranch: string
  author: {
    id: string
    username: string
    avatar: string
  }
  createdAt: Date
  updatedAt: Date
  status: 'open' | 'merged' | 'closed' | 'draft'
  reviewers: PullRequestReviewer[]
  comments: PullRequestComment[]
  changes: FileChange[]
  mergeConflicts?: MergeConflict[]
}

export interface PullRequestReviewer {
  id: string
  username: string
  avatar: string
  status: 'pending' | 'approved' | 'changes_requested' | 'dismissed'
  reviewedAt?: Date
  comments?: string
}

export interface PullRequestComment {
  id: string
  content: string
  author: {
    id: string
    username: string
    avatar: string
  }
  createdAt: Date
  filePath?: string
  lineNumber?: number
  isResolved: boolean
  replies: PullRequestComment[]
}

export interface MergeConflict {
  filePath: string
  conflictType: 'content' | 'rename' | 'delete'
  currentContent: string
  incomingContent: string
  baseContent?: string
}

export interface TeamProject {
  id: string
  name: string
  description: string
  team: TeamInfo
  templates: Template[]
  repositories: ToolRepository[]
  createdAt: Date
  isPublic: boolean
  status: 'active' | 'archived' | 'planning'
  roadmap: ProjectMilestone[]
}

export interface ProjectMilestone {
  id: string
  title: string
  description: string
  dueDate: Date
  status: 'planning' | 'in_progress' | 'completed' | 'overdue'
  assignees: TeamMember[]
  tasks: ProjectTask[]
  progress: number
}

export interface ProjectTask {
  id: string
  title: string
  description: string
  assignee?: TeamMember
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  labels: string[]
  createdAt: Date
  dueDate?: Date
  estimatedHours?: number
  actualHours?: number
}