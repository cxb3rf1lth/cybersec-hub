export interface TeamMember {
  id: string
  userId: string
  username: string
  avatar: string
  role: TeamRole
  permissions: Permission[]
  earningsPercentage: number
  joinedAt: string
  status: 'active' | 'inactive' | 'pending'
  specializations: string[]
  contribution: number // Overall contribution score
}

export interface TeamRole {
  id: string
  name: string
  description: string
  permissions: Permission[]
  defaultEarningsPercentage: number
  priority: number // Higher = more senior
  color: string
}

export interface Permission {
  id: string
  name: string
  description: string
  category: 'project' | 'team' | 'earnings' | 'admin'
}

export interface Team {
  id: string
  name: string
  description: string
  type: TeamType
  specialization: string[]
  status: 'active' | 'recruiting' | 'full' | 'inactive'
  privacy: 'public' | 'private' | 'invite-only'
  
  // Team composition
  members: TeamMember[]
  maxMembers: number
  requiredRoles: string[]
  
  // Leadership
  leaderId: string
  moderators: string[]
  
  // Earnings & Bounties
  totalEarnings: number
  activeContracts: number
  completedBounties: number
  averageRating: number
  
  // Team metadata
  createdAt: string
  lastActive: string
  verified: boolean
  tags: string[]
  location?: string
  
  // Requirements
  minExperience: number
  requiredCertifications: string[]
  applicationRequired: boolean
}

export type TeamType = 
  | 'red-team' 
  | 'blue-team' 
  | 'purple-team' 
  | 'bug-bounty' 
  | 'research' 
  | 'incident-response' 
  | 'forensics' 
  | 'compliance' 
  | 'education'

export interface TeamApplication {
  id: string
  teamId: string
  applicantId: string
  applicantUsername: string
  applicantAvatar: string
  desiredRole: string
  motivation: string
  experience: string
  certifications: string[]
  portfolio: string[]
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  feedback?: string
}

export interface TeamContract {
  id: string
  teamId: string
  title: string
  description: string
  client: string
  type: 'bug-bounty' | 'penetration-test' | 'security-audit' | 'incident-response' | 'training'
  budget: number
  deadline: string
  status: 'active' | 'completed' | 'cancelled'
  progress: number
  assignedMembers: string[]
  
  // Earnings distribution
  earningsDistribution: {
    memberId: string
    percentage: number
    amount: number
    role: string
  }[]
  
  createdAt: string
  completedAt?: string
  rating?: number
  clientFeedback?: string
}

export interface EarningsDistribution {
  id: string
  teamId: string
  contractId?: string
  amount: number
  currency: string
  distributionMethod: 'role-based' | 'contribution-based' | 'equal' | 'custom'
  
  distributions: {
    memberId: string
    username: string
    role: string
    percentage: number
    amount: number
    contribution: number
    status: 'pending' | 'paid' | 'disputed'
  }[]
  
  createdAt: string
  paidAt?: string
  notes?: string
}

export interface TeamInvitation {
  id: string
  teamId: string
  teamName: string
  inviterId: string
  inviterUsername: string
  targetUserId: string
  targetUsername: string
  role: string
  message: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  sentAt: string
  respondedAt?: string
  expiresAt: string
}

export interface TeamStats {
  teamId: string
  totalProjects: number
  successRate: number
  averageProjectDuration: number
  totalEarnings: number
  memberSatisfaction: number
  clientRating: number
  specializations: {
    [key: string]: number // specialization -> proficiency score
  }
}