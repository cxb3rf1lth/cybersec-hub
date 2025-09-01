export interface MarketplaceListing {
  id: string
  teamId: string
  title: string
  description: string
  category: 'penetration-testing' | 'bug-bounty' | 'red-team' | 'blue-team' | 'security-audit' | 'consultation' | 'training' | 'other'
  skills: string[]
  priceRange: {
    min: number
    max: number
    currency: 'USD' | 'EUR' | 'GBP'
  }
  duration: string // e.g., "1-2 weeks", "3-6 months"
  availability: 'immediate' | 'within-week' | 'within-month' | 'future'
  portfolio: {
    projectName: string
    description: string
    technologies: string[]
    imageUrl?: string
    caseStudyUrl?: string
  }[]
  certifications: string[]
  rating: number
  reviewCount: number
  completedProjects: number
  responseTime: string // e.g., "< 24 hours"
  featured: boolean
  createdAt: string
  updatedAt: string
  status: 'active' | 'paused' | 'draft'
}

export interface MarketplaceProposal {
  id: string
  listingId: string
  clientId: string
  teamId: string
  projectTitle: string
  projectDescription: string
  budget: {
    amount: number
    currency: 'USD' | 'EUR' | 'GBP'
  }
  timeline: string
  requirements: string[]
  attachments?: {
    name: string
    url: string
    type: string
  }[]
  status: 'pending' | 'accepted' | 'rejected' | 'in-progress' | 'completed'
  createdAt: string
  updatedAt: string
  deadline?: string
}

export interface MarketplaceReview {
  id: string
  listingId: string
  clientId: string
  teamId: string
  proposalId: string
  rating: number
  title: string
  comment: string
  createdAt: string
  helpful: number
  verified: boolean
}

export interface MarketplaceFilters {
  category?: string[]
  skills?: string[]
  priceRange?: {
    min: number
    max: number
  }
  rating?: number
  availability?: string[]
  location?: string[]
}

export interface MarketplaceStats {
  totalListings: number
  activeTeams: number
  averageRating: number
  totalProjects: number
  categoryCounts: Record<string, number>
}