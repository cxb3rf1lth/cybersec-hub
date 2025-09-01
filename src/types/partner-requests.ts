export interface PartnerRequest {
  id: string
  requesterId: string
  requesterName: string
  requesterAvatar: string
  title: string
  description: string
  projectType: 'bug-bounty' | 'red-team' | 'blue-team' | 'research' | 'tool-development' | 'ctf'
  skillsOffered: string[]
  skillsNeeded: string[]
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  commitment: 'part-time' | 'full-time' | 'project-based' | 'ongoing'
  compensation: 'revenue-share' | 'fixed-payment' | 'equity' | 'experience' | 'negotiable'
  estimatedDuration: string
  tags: string[]
  status: 'open' | 'matched' | 'closed'
  applications: PartnerApplication[]
  createdAt: string
  updatedAt: string
}

export interface PartnerApplication {
  id: string
  applicantId: string
  applicantName: string
  applicantAvatar: string
  message: string
  skillsHighlight: string[]
  portfolioItems: string[]
  availability: string
  status: 'pending' | 'accepted' | 'rejected'
  appliedAt: string
}

export interface SkillCategory {
  id: string
  name: string
  skills: string[]
  icon: string
}

export interface PartnerMatch {
  id: string
  requestId: string
  partnerId: string
  partnerName: string
  partnerAvatar: string
  matchScore: number
  compatibilityReasons: string[]
  suggestedAt: string
}