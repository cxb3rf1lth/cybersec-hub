export interface Task {
  id: string
  title: string
  description: string
  assigneeId?: string
  status: 'todo' | 'in-progress' | 'review' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  dueDate?: string
  createdAt: string
  updatedAt: string
  comments: TaskComment[]
  labels: string[]
  estimatedHours?: number
  actualHours?: number
}

export interface TaskComment {
  id: string
  authorId: string
  content: string
  createdAt: string
}

export interface Milestone {
  id: string
  title: string
  description: string
  dueDate: string
  status: 'planning' | 'active' | 'completed' | 'overdue'
  progress: number // 0-100
  tasks: string[] // Task IDs
  createdAt: string
}

export interface Project {
  id: string
  name: string
  description: string
  type: 'general' | 'bug-bounty' | 'research' | 'development' | 'red-team' | 'blue-team'
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled'
  ownerId: string
  teamId: string
  repositoryId?: string
  milestones: Milestone[]
  tasks: Task[]
  startDate: string
  endDate?: string
  budget?: number
  tags: string[]
  visibility: 'public' | 'team' | 'private'
  createdAt: string
  updatedAt: string
}

export interface Team {
  id: string
  name: string
  description: string
  type: 'general' | 'bug-bounty' | 'research' | 'development' | 'red-team' | 'blue-team'
  ownerId: string
  members: TeamMember[]
  projects: string[] // Project IDs
  requiredSkills: string[]
  maxMembers?: number
  isPublic: boolean
  reputation: number
  totalEarnings?: number // For bug bounty teams
  successfulProjects: number
  createdAt: string
  settings: TeamSettings
}

export interface TeamMember {
  userId: string
  role: 'owner' | 'admin' | 'member' | 'contributor'
  permissions: TeamPermission[]
  joinedAt: string
  contribution: number // 0-100 percentage for earnings distribution
  isActive: boolean
}

export interface TeamPermission {
  resource: 'projects' | 'tasks' | 'members' | 'settings' | 'repositories'
  actions: ('create' | 'read' | 'update' | 'delete' | 'assign')[]
}

export interface TeamSettings {
  autoAcceptMembers: boolean
  requireSkillVerification: boolean
  earningsDistribution: 'equal' | 'contribution-based' | 'manual'
  projectApprovalRequired: boolean
  maxProjectsPerMember: number
}

export interface BugBountyProgram {
  id: string
  name: string
  company: string
  description: string
  targetUrl: string
  scope: string[]
  excludedScopes: string[]
  rewards: BugBountyReward[]
  teamId?: string
  status: 'active' | 'completed' | 'paused' | 'planning'
  startDate: string
  endDate?: string
  rules: string
  contactInfo: string
  isPrivate: boolean
  assignedResearchers: string[] // User IDs
  findings: Finding[]
  createdAt: string
}

export interface BugBountyReward {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  minAmount: number
  maxAmount: number
  currency: 'USD' | 'EUR' | 'BTC' | 'ETH'
}

export interface Finding {
  id: string
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  status: 'draft' | 'submitted' | 'triaged' | 'accepted' | 'rejected' | 'duplicate'
  discoveredBy: string[] // User IDs
  submittedAt: string
  rewardAmount?: number
  proofOfConcept: string
  affectedAssets: string[]
  reproductionSteps: string[]
  impact: string
  recommendation: string
  attachments: string[]
}

export interface ProjectTemplate {
  id: string
  name: string
  description: string
  category: 'bug-bounty' | 'penetration-testing' | 'incident-response' | 'malware-analysis' | 'research'
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  estimatedDuration: string
  requiredSkills: string[]
  milestones: Omit<Milestone, 'id' | 'createdAt' | 'status' | 'progress'>[]
  taskTemplates: Omit<Task, 'id' | 'assigneeId' | 'status' | 'createdAt' | 'updatedAt' | 'comments' | 'actualHours'>[]
  resources: ProjectResource[]
  createdBy: string
  usageCount: number
  rating: number
  reviews: TemplateReview[]
  tags: string[]
  isPublic: boolean
  createdAt: string
}

export interface ProjectResource {
  type: 'document' | 'tool' | 'link' | 'tutorial'
  name: string
  url: string
  description: string
  isRequired: boolean
}

export interface TemplateReview {
  id: string
  userId: string
  rating: number // 1-5
  comment: string
  createdAt: string
}

export interface ProjectInvitation {
  id: string
  projectId: string
  teamId: string
  invitedBy: string
  invitedUser: string
  role: TeamMember['role']
  message: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  createdAt: string
  expiresAt: string
}