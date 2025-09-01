export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  bio?: string
  specializations: Specialization[]
  followers: string[]
  following: string[]
  joinedAt: string
}

export interface Post {
  id: string
  authorId: string
  content: string
  type: 'text' | 'code'
  codeLanguage?: string
  tags: string[]
  likes: string[]
  comments: Comment[]
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  authorId: string
  content: string
  createdAt: string
}

export interface CodeSnippet {
  id: string
  title: string
  description: string
  code: string
  language: string
  authorId: string
  tags: string[]
  likes: string[]
  forks: string[]
  createdAt: string
  updatedAt: string
}

export type Specialization = 
  | 'Red Team' 
  | 'Blue Team' 
  | 'Bug Bounty' 
  | 'Penetration Testing' 
  | 'Ethical Hacking' 
  | 'Malware Analysis' 
  | 'Incident Response' 
  | 'Security Research'
  | 'OSINT'
  | 'Reverse Engineering'

export interface Activity {
  id: string
  userId: string
  type: 'post' | 'follow' | 'like' | 'comment' | 'code_snippet'
  targetId?: string
  content?: string
  createdAt: string
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  type: 'text' | 'code' | 'file'
  codeLanguage?: string
  fileName?: string
  isRead: boolean
  createdAt: string
  status?: 'sending' | 'sent' | 'delivered' | 'read'
}

export interface Conversation {
  id: string
  participants: string[]
  lastMessage?: Message
  lastMessageAt: string
  isGroup: boolean
  name?: string
  unreadCount: number
}

export interface Repository {
  id: string
  name: string
  description: string
  ownerId: string
  isPrivate: boolean
  language: string
  tags: string[]
  stars: string[]
  forks: string[]
  watchers: string[]
  collaborators: string[]
  files: RepositoryFile[]
  commits: Commit[]
  branches: Branch[]
  issues: Issue[]
  pullRequests: PullRequest[]
  createdAt: string
  updatedAt: string
  cloneUrl: string
  defaultBranch: string
}

export interface RepositoryFile {
  id: string
  name: string
  path: string
  content: string
  language: string
  size: number
  lastModified: string
  lastCommit: string
  isDirectory: boolean
  children?: RepositoryFile[]
}

export interface Commit {
  id: string
  message: string
  authorId: string
  authorName: string
  authorEmail: string
  hash: string
  parentHash?: string
  branch: string
  filesChanged: FileChange[]
  additions: number
  deletions: number
  createdAt: string
}

export interface FileChange {
  path: string
  type: 'added' | 'modified' | 'deleted' | 'renamed'
  additions: number
  deletions: number
  oldPath?: string
}

export interface Branch {
  id: string
  name: string
  lastCommit: string
  createdAt: string
  isDefault: boolean
  isProtected: boolean
}

export interface Issue {
  id: string
  title: string
  description: string
  authorId: string
  assigneeId?: string
  labels: string[]
  status: 'open' | 'closed' | 'in_progress'
  priority: 'low' | 'medium' | 'high' | 'critical'
  createdAt: string
  updatedAt: string
  closedAt?: string
  comments: IssueComment[]
}

export interface IssueComment {
  id: string
  authorId: string
  content: string
  createdAt: string
}

export interface PullRequest {
  id: string
  title: string
  description: string
  authorId: string
  sourceBranch: string
  targetBranch: string
  status: 'open' | 'closed' | 'merged' | 'draft'
  reviewers: string[]
  reviews: Review[]
  filesChanged: FileChange[]
  commits: string[]
  createdAt: string
  updatedAt: string
  mergedAt?: string
}

export interface Review {
  id: string
  reviewerId: string
  status: 'pending' | 'approved' | 'changes_requested' | 'dismissed'
  comment?: string
  createdAt: string
}

export interface CodeEditor {
  id: string
  repositoryId: string
  fileName: string
  filePath: string
  content: string
  language: string
  cursorPosition: { line: number; column: number }
  selections: Selection[]
  collaborators: EditorCollaborator[]
  isReadOnly: boolean
  isDirty: boolean
  lastSaved: string
}

export interface Selection {
  startLine: number
  startColumn: number
  endLine: number
  endColumn: number
}

export interface EditorCollaborator {
  userId: string
  cursorPosition: { line: number; column: number }
  selections: Selection[]
  color: string
  isActive: boolean
  lastSeen: string
}