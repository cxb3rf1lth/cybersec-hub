export interface Earning {
  id: string
  userId: string
  teamId?: string
  projectId?: string
  contractId?: string
  
  // Basic earning details
  amount: number
  currency: string
  type: EarningType
  status: PaymentStatus
  
  // Source information
  source: EarningSource
  description: string
  
  // Dates
  earnedAt: string
  paidAt?: string
  dueDate?: string
  
  // Additional metadata
  taxable: boolean
  category: string
  tags: string[]
  
  // Team/project context
  teamName?: string
  projectName?: string
  clientName?: string
  
  // Payment details
  paymentMethod?: string
  transactionId?: string
  fees?: number
  netAmount?: number
}

export type EarningType = 
  | 'bug-bounty'
  | 'penetration-test'
  | 'security-audit'
  | 'incident-response'
  | 'consulting'
  | 'training'
  | 'code-review'
  | 'research'
  | 'bonus'
  | 'referral'

export type EarningSource = 
  | 'team-project'
  | 'individual-bounty'
  | 'platform-reward'
  | 'external-contract'
  | 'partnership'
  | 'referral-bonus'

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'disputed'
  | 'cancelled'

export interface PaymentHistory {
  id: string
  userId: string
  earnings: Earning[]
  totalAmount: number
  totalPaid: number
  totalPending: number
  currency: string
  period: {
    start: string
    end: string
  }
  generatedAt: string
}

export interface EarningsAnalytics {
  userId: string
  period: {
    start: string
    end: string
  }
  
  // Overview metrics
  totalEarnings: number
  totalPaid: number
  totalPending: number
  averagePerProject: number
  currency: string
  
  // Performance metrics
  projectsCompleted: number
  successRate: number
  averageRating: number
  repeatClients: number
  
  // Breakdown by categories
  earningsByType: {
    [key in EarningType]?: {
      amount: number
      count: number
      percentage: number
    }
  }
  
  earningsBySource: {
    [key in EarningSource]?: {
      amount: number
      count: number
      percentage: number
    }
  }
  
  // Time-based analysis
  monthlyTrends: {
    month: string
    earnings: number
    projects: number
    averagePerProject: number
  }[]
  
  // Team performance
  teamPerformance: {
    teamId: string
    teamName: string
    earnings: number
    projects: number
    rating: number
    memberCount: number
    myContribution: number
  }[]
  
  // Growth metrics
  growthRate: number
  projectedEarnings: number
  rankingPercentile: number
}

export interface TeamEarningsAnalytics {
  teamId: string
  teamName: string
  period: {
    start: string
    end: string
  }
  
  // Team overview
  totalEarnings: number
  totalProjects: number
  averagePerProject: number
  successRate: number
  averageRating: number
  
  // Member performance
  memberPerformance: {
    userId: string
    username: string
    avatar: string
    role: string
    earnings: number
    contribution: number
    projectsParticipated: number
    averageRating: number
    joinedAt: string
  }[]
  
  // Project breakdown
  projectBreakdown: {
    projectId: string
    projectName: string
    type: EarningType
    earnings: number
    completion: number
    rating?: number
    duration: number
    memberCount: number
  }[]
  
  // Distribution analysis
  distributionMethod: 'role-based' | 'contribution-based' | 'equal' | 'custom'
  fairnessScore: number
  memberSatisfaction: number
  
  // Trends
  monthlyTrends: {
    month: string
    earnings: number
    projects: number
    memberCount: number
    averageRating: number
  }[]
}

export interface EarningsGoal {
  id: string
  userId: string
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  currency: string
  deadline: string
  category: string
  priority: 'low' | 'medium' | 'high'
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  createdAt: string
  completedAt?: string
}

export interface PayoutMethod {
  id: string
  userId: string
  type: 'bank-transfer' | 'paypal' | 'crypto' | 'stripe' | 'wire'
  name: string
  details: {
    [key: string]: string // Flexible for different payment method requirements
  }
  isDefault: boolean
  isVerified: boolean
  minimumAmount?: number
  fees?: number
  processingTime?: string
  currency: string[]
  createdAt: string
  lastUsed?: string
}