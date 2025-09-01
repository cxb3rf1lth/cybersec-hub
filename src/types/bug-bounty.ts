export interface BugBountyPlatform {
  id: string
  name: string
  displayName: string
  baseUrl: string
  apiUrl: string
  logoUrl: string
  description: string
  isActive: boolean
  
  // Platform characteristics
  type: 'continuous' | 'vdp' | 'private' | 'crowdsourced'
  minPayout: number
  maxPayout: number
  averagePayout: number
  currency: string
  
  // Authentication
  authentication: {
    type: 'api-key' | 'oauth' | 'jwt' | 'basic'
    endpoints: {
      auth?: string
      refresh?: string
    }
    scopes?: string[]
  }
  
  // API endpoints
  endpoints: {
    programs: string
    submissions: string
    reports: string
    profile: string
    earnings: string
    leaderboard?: string
  }
  
  // Rate limiting
  rateLimit: {
    requestsPerMinute: number
    requestsPerHour: number
    burstLimit: number
  }
  
  // Platform stats
  stats: {
    activeProgramsCount: number
    totalResearchers: number
    totalPayouts: number
    averageResponseTime: number // in hours
    lastUpdated: string
  }
  
  // Integration status
  integration: {
    status: 'connected' | 'disconnected' | 'error' | 'pending'
    lastSync: string
    syncErrors: string[]
    nextSync: string
  }
}

export interface BugBountyProgram {
  id: string
  platformId: string
  externalId: string
  
  // Basic info
  name: string
  company: string
  description: string
  url: string
  logoUrl?: string
  
  // Program details
  type: 'public' | 'private' | 'vdp'
  status: 'active' | 'paused' | 'ended'
  launchDate: string
  
  // Scope
  scope: {
    inScope: ScopeItem[]
    outOfScope: ScopeItem[]
    instructions: string
  }
  
  // Rewards
  rewards: {
    currency: string
    bountyTable: BountyRange[]
    hasSwag: boolean
    hasHallOfFame: boolean
    responseTargets: {
      acknowledgment: number // hours
      triage: number // hours
      bounty: number // hours
      resolution: number // hours
    }
  }
  
  // Requirements
  requirements: {
    minimumAge: number
    countries: string[] // allowed countries
    excludedCountries: string[]
    eligibilityRequirements: string[]
  }
  
  // Stats
  stats: {
    participantCount: number
    resolvedReports: number
    averageBounty: number
    topBounty: number
    responseTime: number
    rating: number
  }
  
  // Team hunt compatibility
  teamHuntEligible: boolean
  maxTeamSize?: number
  teamBonusMultiplier?: number
  
  // Metadata
  tags: string[]
  lastUpdated: string
  createdAt: string
}

export interface ScopeItem {
  target: string
  type: 'web' | 'mobile' | 'api' | 'hardware' | 'source-code' | 'other'
  description?: string
  maxSeverity?: VulnerabilitySeverity
  eligibleForBounty: boolean
}

export interface BountyRange {
  severity: VulnerabilitySeverity
  minAmount: number
  maxAmount: number
  description?: string
}

export type VulnerabilitySeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export interface BugReport {
  id: string
  platformId: string
  programId: string
  externalId: string
  
  // Report details
  title: string
  description: string
  severity: VulnerabilitySeverity
  status: ReportStatus
  
  // Submission info
  submittedBy: string
  submittedAt: string
  teamId?: string // if submitted by team
  
  // Bounty info
  bountyAmount?: number
  currency?: string
  paidAt?: string
  
  // Technical details
  vulnerability: {
    category: string
    cwe?: string
    cvss?: number
    proofOfConcept: string
    impactDescription: string
    reproductionSteps: string[]
  }
  
  // Timeline
  timeline: ReportTimeline[]
  
  // Team collaboration
  collaboration?: {
    teamId: string
    contributors: TeamContributor[]
    contributionNotes: string
  }
}

export type ReportStatus = 
  | 'new' 
  | 'triaged' 
  | 'accepted' 
  | 'rejected' 
  | 'duplicate' 
  | 'resolved' 
  | 'awarded'

export interface ReportTimeline {
  id: string
  timestamp: string
  event: 'submitted' | 'triaged' | 'bounty_awarded' | 'resolved' | 'comment'
  description: string
  actor: string
  internal: boolean
}

export interface TeamContributor {
  userId: string
  username: string
  role: string
  contributionPercentage: number
  contributionType: 'discovery' | 'analysis' | 'exploitation' | 'documentation' | 'coordination'
}

export interface TeamHunt {
  id: string
  name: string
  description: string
  
  // Target program
  programId: string
  programName: string
  platformId: string
  
  // Team composition
  teamId: string
  teamName: string
  participants: TeamHuntParticipant[]
  maxParticipants: number
  
  // Hunt details
  startDate: string
  endDate: string
  duration: number // hours
  status: 'planned' | 'active' | 'completed' | 'cancelled'
  
  // Objectives
  objectives: HuntObjective[]
  rules: string[]
  
  // Results
  results?: {
    reportsSubmitted: number
    validReports: number
    totalBounty: number
    teamRanking: number
    achievements: string[]
  }
  
  // Coordination
  chatChannelId?: string
  meetingSchedule?: MeetingSchedule[]
  sharedResources: SharedResource[]
  
  createdAt: string
  createdBy: string
}

export interface TeamHuntParticipant {
  userId: string
  username: string
  avatar: string
  role: 'leader' | 'researcher' | 'analyst' | 'coordinator'
  specialization: string[]
  joinedAt: string
  status: 'active' | 'inactive'
  contributionScore: number
}

export interface HuntObjective {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in-progress' | 'completed'
  assignedTo?: string[]
  targetCompletion: string
  completedAt?: string
}

export interface MeetingSchedule {
  id: string
  title: string
  type: 'kickoff' | 'progress' | 'debrief' | 'coordination'
  scheduledTime: string
  duration: number // minutes
  participants: string[]
  meetingUrl?: string
  agenda: string[]
  notes?: string
}

export interface SharedResource {
  id: string
  name: string
  type: 'document' | 'tool' | 'script' | 'wordlist' | 'payload'
  url: string
  description: string
  uploadedBy: string
  uploadedAt: string
  accessLevel: 'public' | 'team' | 'restricted'
  downloadCount: number
}

export interface BountyPartnerRequest {
  id: string
  requesterId: string
  requesterUsername: string
  
  // Partner criteria
  targetRole: 'co-researcher' | 'specialist' | 'mentor' | 'coordinator'
  requiredSkills: string[]
  preferredExperience: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  
  // Collaboration details
  programId?: string
  programName?: string
  platformId?: string
  expectedDuration: string
  timeCommitment: string // hours per week
  
  // Compensation
  revenueSharePercentage: number
  upfrontPayment?: number
  bonusStructure?: string
  
  // Request details
  title: string
  description: string
  requirements: string[]
  preferences: string[]
  
  // Response handling
  status: 'open' | 'matched' | 'closed' | 'expired'
  applications: PartnerApplication[]
  selectedPartnerId?: string
  
  createdAt: string
  expiresAt: string
}

export interface PartnerApplication {
  id: string
  applicantId: string
  applicantUsername: string
  applicantAvatar: string
  
  // Application details
  message: string
  experience: string
  relevantSkills: string[]
  pastCollaborations: number
  portfolioLinks: string[]
  
  // Terms
  proposedRevenueShare?: number
  availability: string
  startDate: string
  
  // Status
  status: 'pending' | 'accepted' | 'rejected'
  submittedAt: string
  reviewedAt?: string
  reviewerNotes?: string
}

export interface LiveBountyFeed {
  id: string
  type: 'new_program' | 'program_update' | 'bounty_awarded' | 'leaderboard_change' | 'platform_news'
  platform: string
  title: string
  description: string
  timestamp: string
  
  // Type-specific data
  data: {
    programId?: string
    programName?: string
    bountyAmount?: number
    severity?: VulnerabilitySeverity
    researcherUsername?: string
    companyName?: string
    [key: string]: any
  }
  
  // Feed metadata
  priority: 'high' | 'medium' | 'low'
  category: string[]
  readBy: string[] // user IDs who have seen this
  bookmarkedBy: string[] // user IDs who bookmarked this
}

export interface PlatformConfiguration {
  platformId: string
  userId: string
  
  // API credentials
  credentials: {
    apiKey?: string
    apiSecret?: string
    accessToken?: string
    refreshToken?: string
    username?: string
    email?: string
  }
  
  // Sync preferences
  syncSettings: {
    autoSync: boolean
    syncInterval: number // minutes
    syncPrograms: boolean
    syncReports: boolean
    syncEarnings: boolean
    syncLeaderboard: boolean
  }
  
  // Notification preferences
  notifications: {
    newPrograms: boolean
    programUpdates: boolean
    bountyAwards: boolean
    teamInvitations: boolean
    partnerRequests: boolean
  }
  
  // Privacy settings
  privacy: {
    showEarnings: boolean
    showRanking: boolean
    allowTeamInvitations: boolean
    allowPartnerRequests: boolean
  }
  
  isConfigured: boolean
  lastConfigured: string
  configuredBy: string
}

export interface ResearcherProfile {
  userId: string
  platforms: {
    [platformId: string]: {
      username: string
      profileUrl: string
      rank: number
      totalEarnings: number
      validReports: number
      joinDate: string
      reputation: number
      badges: string[]
      lastActivity: string
    }
  }
  
  // Aggregate stats
  aggregateStats: {
    totalEarnings: number
    totalReports: number
    averageSeverity: VulnerabilitySeverity
    topBounty: number
    specializations: string[]
    preferredPrograms: string[]
  }
  
  // Team collaboration history
  teamHistory: {
    totalTeamHunts: number
    successfulCollaborations: number
    averageTeamRating: number
    preferredRoles: string[]
    collaborationStyle: string[]
  }
  
  lastUpdated: string
}