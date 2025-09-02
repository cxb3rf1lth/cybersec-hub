export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  displayName?: string
  bio?: string
  specializations: Specialization[]
  followers: string[]
  following: string[]
  joinedAt: string
  reputation?: number
  successfulFindings?: number
  status?: UserStatus
  badges?: SecurityBadge[]
  certifications?: SecurityCertification[]
  workHistory?: WorkExperience[]
  securityClearance?: SecurityClearance
}

export interface UserStatus {
  type: 'available' | 'busy' | 'away' | 'in-meeting' | 'on-hunt' | 'analyzing' | 'offline'
  customMessage?: string
  lastSeen?: string
  isActivelyHunting?: boolean
  currentProject?: string
}

export interface SecurityBadge {
  id: string
  type: BadgeType
  name: string
  description: string
  icon: string
  earnedAt: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  metadata?: {
    platform?: string
    amount?: number
    severity?: 'low' | 'medium' | 'high' | 'critical'
    cveId?: string
    bountyValue?: number
    targetCompany?: string
  }
}

export type BadgeType = 
  | 'first-blood'
  | 'hall-of-fame'
  | 'bug-hunter'
  | 'critical-finder'
  | 'bounty-master'
  | 'researcher'
  | 'collaborator'
  | 'mentor'
  | 'community-leader'
  | 'cve-publisher'
  | 'zero-day'
  | 'methodology-master'
  | 'tool-creator'
  | 'conference-speaker'
  | 'certified-expert'
  | 'team-player'
  | 'rapid-responder'
  | 'documentation-pro'
  | 'knowledge-sharer'
  | 'platform-champion'

export interface SecurityCertification {
  id: string
  name: string
  organization: string
  dateEarned: string
  expiryDate?: string
  credentialId?: string
  verificationUrl?: string
  level: 'entry' | 'intermediate' | 'expert' | 'master'
  category: 'penetration-testing' | 'incident-response' | 'forensics' | 'compliance' | 'cloud-security' | 'governance' | 'general'
}

export interface WorkExperience {
  id: string
  company: string
  role: string
  startDate: string
  endDate?: string
  description?: string
  specializations: Specialization[]
  isVerified: boolean
}

export interface SecurityClearance {
  level: 'none' | 'confidential' | 'secret' | 'top-secret'
  country: string
  isActive: boolean
  expiryDate?: string
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
  | 'Web Application Security'
  | 'Mobile Security'
  | 'API Security'
  | 'Cloud Security'
  | 'Network Security'
  | 'Cryptography'
  | 'Social Engineering'
  | 'Physical Security'
  | 'IoT Security'
  | 'Automotive Security'
  | 'Binary Analysis'
  | 'Forensics'
  | 'Threat Intelligence'
  | 'DevSecOps'

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