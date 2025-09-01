import { useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { TeamHunt, BountyPartnerRequest, PartnerApplication } from '@/types/bug-bounty'
import { User } from '@/types/user'

// Sample team hunts for demonstration
const SAMPLE_TEAM_HUNTS: TeamHunt[] = [
  {
    id: 'hunt-1',
    name: 'PayPal Mobile Security Sprint',
    description: 'Focused team hunt targeting PayPal mobile applications for authentication and payment flow vulnerabilities',
    programId: 'h1-paypal',
    programName: 'PayPal Bug Bounty',
    platformId: 'hackerone',
    teamId: 'team-red-hawks',
    teamName: 'Red Hawks',
    participants: [
      {
        userId: 'user-1',
        username: 'mobile_hunter',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mobile_hunter',
        role: 'leader',
        specialization: ['mobile', 'ios', 'android', 'api'],
        joinedAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'active',
        contributionScore: 95
      },
      {
        userId: 'user-2',
        username: 'crypto_expert',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=crypto_expert',
        role: 'researcher',
        specialization: ['cryptography', 'authentication', 'payments'],
        joinedAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'active',
        contributionScore: 88
      },
      {
        userId: 'user-3',
        username: 'api_specialist',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=api_specialist',
        role: 'analyst',
        specialization: ['api', 'web', 'business-logic'],
        joinedAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'active',
        contributionScore: 82
      }
    ],
    maxParticipants: 5,
    startDate: new Date(Date.now() - 86400000).toISOString(),
    endDate: new Date(Date.now() + 518400000).toISOString(), // 6 days from now
    duration: 168, // 7 days in hours
    status: 'active',
    objectives: [
      {
        id: 'obj-1',
        title: 'Mobile App Authentication Analysis',
        description: 'Analyze authentication mechanisms in PayPal mobile apps',
        priority: 'high',
        status: 'in-progress',
        assignedTo: ['user-1', 'user-2'],
        targetCompletion: new Date(Date.now() + 172800000).toISOString(), // 2 days
      },
      {
        id: 'obj-2',
        title: 'Payment Flow Security Testing',
        description: 'Test payment flows for business logic vulnerabilities',
        priority: 'high',
        status: 'pending',
        assignedTo: ['user-2', 'user-3'],
        targetCompletion: new Date(Date.now() + 345600000).toISOString(), // 4 days
      },
      {
        id: 'obj-3',
        title: 'API Security Assessment',
        description: 'Review mobile API endpoints for security issues',
        priority: 'medium',
        status: 'pending',
        assignedTo: ['user-3'],
        targetCompletion: new Date(Date.now() + 432000000).toISOString(), // 5 days
      }
    ],
    rules: [
      'All findings must be validated by at least 2 team members',
      'Document all testing methodology and tools used',
      'Maintain team communication in dedicated channel',
      'Share reconnaissance data and wordlists'
    ],
    chatChannelId: 'hunt-chat-1',
    meetingSchedule: [
      {
        id: 'meeting-1',
        title: 'Daily Standup',
        type: 'progress',
        scheduledTime: new Date(Date.now() + 86400000).toISOString(),
        duration: 30,
        participants: ['user-1', 'user-2', 'user-3'],
        agenda: ['Progress updates', 'Blocker discussion', 'Next 24h goals']
      }
    ],
    sharedResources: [
      {
        id: 'resource-1',
        name: 'PayPal Mobile Endpoints',
        type: 'document',
        url: '/shared/paypal-endpoints.txt',
        description: 'Compiled list of mobile API endpoints',
        uploadedBy: 'user-3',
        uploadedAt: new Date(Date.now() - 43200000).toISOString(),
        accessLevel: 'team',
        downloadCount: 3
      },
      {
        id: 'resource-2',
        name: 'Mobile Testing Toolkit',
        type: 'tool',
        url: '/shared/mobile-toolkit.zip',
        description: 'Custom tools for mobile app security testing',
        uploadedBy: 'user-1',
        uploadedAt: new Date(Date.now() - 21600000).toISOString(),
        accessLevel: 'team',
        downloadCount: 2
      }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    createdBy: 'user-1'
  },
  {
    id: 'hunt-2',
    name: 'Tesla Infotainment Deep Dive',
    description: 'Comprehensive security assessment of Tesla vehicle infotainment systems',
    programId: 'bc-tesla',
    programName: 'Tesla Motors Bug Bounty',
    platformId: 'bugcrowd',
    teamId: 'team-auto-hackers',
    teamName: 'Auto Hackers',
    participants: [
      {
        userId: 'user-4',
        username: 'car_hacker',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=car_hacker',
        role: 'leader',
        specialization: ['automotive', 'can-bus', 'embedded'],
        joinedAt: new Date(Date.now() - 172800000).toISOString(),
        status: 'active',
        contributionScore: 92
      },
      {
        userId: 'user-5',
        username: 'embedded_ninja',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=embedded_ninja',
        role: 'researcher',
        specialization: ['embedded', 'reverse-engineering', 'firmware'],
        joinedAt: new Date(Date.now() - 172800000).toISOString(),
        status: 'active',
        contributionScore: 89
      }
    ],
    maxParticipants: 3,
    startDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    endDate: new Date(Date.now() + 1209600000).toISOString(), // 14 days from now
    duration: 384, // 16 days in hours
    status: 'active',
    objectives: [
      {
        id: 'obj-4',
        title: 'Infotainment System Reconnaissance',
        description: 'Map the attack surface of Tesla infotainment system',
        priority: 'high',
        status: 'completed',
        assignedTo: ['user-4', 'user-5'],
        targetCompletion: new Date(Date.now() - 86400000).toISOString(),
        completedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'obj-5',
        title: 'Network Interface Analysis',
        description: 'Analyze network interfaces and communication protocols',
        priority: 'high',
        status: 'in-progress',
        assignedTo: ['user-5'],
        targetCompletion: new Date(Date.now() + 259200000).toISOString() // 3 days
      }
    ],
    rules: [
      'Only test on authorized Tesla vehicles',
      'Do not attempt to access vehicle control systems',
      'Document all findings with video proof',
      'Follow Tesla responsible disclosure timeline'
    ],
    results: {
      reportsSubmitted: 1,
      validReports: 1,
      totalBounty: 5000,
      teamRanking: 3,
      achievements: ['First valid automotive finding', 'Team collaboration excellence']
    },
    chatChannelId: 'hunt-chat-2',
    meetingSchedule: [],
    sharedResources: [
      {
        id: 'resource-3',
        name: 'Tesla Firmware Analysis',
        type: 'document',
        url: '/shared/tesla-firmware-notes.md',
        description: 'Detailed analysis of Tesla infotainment firmware',
        uploadedBy: 'user-5',
        uploadedAt: new Date(Date.now() - 86400000).toISOString(),
        accessLevel: 'team',
        downloadCount: 2
      }
    ],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    createdBy: 'user-4'
  }
]

// Sample bounty partner requests
const SAMPLE_PARTNER_REQUESTS: BountyPartnerRequest[] = [
  {
    id: 'partner-req-1',
    requesterId: 'user-6',
    requesterUsername: 'web_hunter_pro',
    targetRole: 'specialist',
    requiredSkills: ['mobile', 'ios', 'android', 'swift', 'kotlin'],
    preferredExperience: 'advanced',
    programId: 'h1-paypal',
    programName: 'PayPal Bug Bounty',
    platformId: 'hackerone',
    expectedDuration: '2-3 weeks',
    timeCommitment: '15-20 hours per week',
    revenueSharePercentage: 30,
    upfrontPayment: 500,
    bonusStructure: 'Additional 10% for critical findings',
    title: 'Looking for Mobile Security Expert',
    description: 'I\'m a web security specialist looking to partner with an experienced mobile security researcher for a focused campaign on PayPal mobile applications. I have extensive knowledge of PayPal\'s web infrastructure and APIs, but need mobile expertise to complete a comprehensive assessment.',
    requirements: [
      'Proven track record in mobile app security testing',
      'Experience with PayPal or similar fintech applications',
      'Knowledge of iOS/Android security models',
      'Ability to work in US timezones'
    ],
    preferences: [
      'Previous PayPal bounty awards',
      'Team collaboration experience',
      'Good communication skills',
      'Available for video calls'
    ],
    status: 'open',
    applications: [
      {
        id: 'app-1',
        applicantId: 'user-1',
        applicantUsername: 'mobile_hunter',
        applicantAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mobile_hunter',
        message: 'Hi! I have 5+ years of mobile security experience and have found several PayPal mobile vulnerabilities. I\'d love to collaborate on this campaign.',
        experience: '5+ years mobile security, 15 valid mobile bug bounty reports, iOS/Android penetration testing',
        relevantSkills: ['mobile', 'ios', 'android', 'api', 'burp-suite', 'frida'],
        pastCollaborations: 3,
        portfolioLinks: ['https://hackerone.com/mobile_hunter', 'https://github.com/mobile_hunter'],
        proposedRevenueShare: 35,
        availability: 'Available 20 hours/week, US EST timezone',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        status: 'pending',
        submittedAt: new Date(Date.now() - 43200000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 604800000).toISOString() // 7 days from creation
  },
  {
    id: 'partner-req-2',
    requesterId: 'user-7',
    requesterUsername: 'crypto_researcher',
    targetRole: 'co-researcher',
    requiredSkills: ['web', 'api', 'business-logic', 'authentication'],
    preferredExperience: 'intermediate',
    expectedDuration: '1-2 months',
    timeCommitment: '10-15 hours per week',
    revenueSharePercentage: 50,
    title: 'Equal Partnership for Banking Program',
    description: 'Looking for an equal partner to collaborate on a private banking bug bounty program. I specialize in cryptographic implementations and need someone strong in web application security.',
    requirements: [
      'Web application security expertise',
      'API testing experience',
      'Business logic vulnerability research',
      'Professional communication skills'
    ],
    preferences: [
      'Banking/fintech experience',
      'Previous private program participation',
      'Long-term collaboration interest'
    ],
    status: 'open',
    applications: [],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    expiresAt: new Date(Date.now() + 1209600000).toISOString() // 14 days from creation
  }
]

export function useTeamHunts() {
  const [teamHunts, setTeamHunts] = useKV<TeamHunt[]>('team-hunts', [])
  const [partnerRequests, setPartnerRequests] = useKV<BountyPartnerRequest[]>('partner-requests', [])

  useEffect(() => {
    if (teamHunts.length === 0) {
      setTeamHunts(SAMPLE_TEAM_HUNTS)
    }
  }, [teamHunts.length, setTeamHunts])

  useEffect(() => {
    if (partnerRequests.length === 0) {
      setPartnerRequests(SAMPLE_PARTNER_REQUESTS)
    }
  }, [partnerRequests.length, setPartnerRequests])

  const createTeamHunt = (hunt: Omit<TeamHunt, 'id' | 'createdAt'>, createdBy: string) => {
    const newHunt: TeamHunt = {
      ...hunt,
      id: `hunt-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy
    }
    setTeamHunts((current) => [newHunt, ...current])
    return newHunt
  }

  const updateTeamHunt = (huntId: string, updates: Partial<TeamHunt>) => {
    setTeamHunts((current) =>
      current.map((hunt) =>
        hunt.id === huntId ? { ...hunt, ...updates } : hunt
      )
    )
  }

  const joinTeamHunt = (huntId: string, user: User) => {
    setTeamHunts((current) =>
      current.map((hunt) => {
        if (hunt.id === huntId && hunt.participants.length < hunt.maxParticipants) {
          const newParticipant = {
            userId: user.id,
            username: user.username,
            avatar: user.avatar,
            role: 'researcher' as const,
            specialization: user.specializations || [],
            joinedAt: new Date().toISOString(),
            status: 'active' as const,
            contributionScore: 0
          }
          return {
            ...hunt,
            participants: [...hunt.participants, newParticipant]
          }
        }
        return hunt
      })
    )
  }

  const leaveTeamHunt = (huntId: string, userId: string) => {
    setTeamHunts((current) =>
      current.map((hunt) => {
        if (hunt.id === huntId) {
          return {
            ...hunt,
            participants: hunt.participants.filter(p => p.userId !== userId)
          }
        }
        return hunt
      })
    )
  }

  const updateObjectiveStatus = (huntId: string, objectiveId: string, status: 'pending' | 'in-progress' | 'completed') => {
    setTeamHunts((current) =>
      current.map((hunt) => {
        if (hunt.id === huntId) {
          return {
            ...hunt,
            objectives: hunt.objectives.map((obj) =>
              obj.id === objectiveId 
                ? { 
                    ...obj, 
                    status,
                    completedAt: status === 'completed' ? new Date().toISOString() : obj.completedAt
                  } 
                : obj
            )
          }
        }
        return hunt
      })
    )
  }

  const createPartnerRequest = (request: Omit<BountyPartnerRequest, 'id' | 'createdAt' | 'expiresAt' | 'applications'>) => {
    const newRequest: BountyPartnerRequest = {
      ...request,
      id: `partner-req-${Date.now()}`,
      applications: [],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 604800000).toISOString() // 7 days
    }
    setPartnerRequests((current) => [newRequest, ...current])
    return newRequest
  }

  const applyToPartnerRequest = (requestId: string, application: Omit<PartnerApplication, 'id' | 'submittedAt'>) => {
    const newApplication: PartnerApplication = {
      ...application,
      id: `app-${Date.now()}`,
      submittedAt: new Date().toISOString()
    }

    setPartnerRequests((current) =>
      current.map((request) =>
        request.id === requestId
          ? { ...request, applications: [...request.applications, newApplication] }
          : request
      )
    )
    return newApplication
  }

  const respondToApplication = (requestId: string, applicationId: string, response: 'accepted' | 'rejected', feedback?: string) => {
    setPartnerRequests((current) =>
      current.map((request) => {
        if (request.id === requestId) {
          const updatedApplications = request.applications.map((app) =>
            app.id === applicationId
              ? {
                  ...app,
                  status: response,
                  reviewedAt: new Date().toISOString(),
                  reviewerNotes: feedback
                }
              : app
          )
          
          // If accepted, mark request as matched
          const updatedRequest = response === 'accepted' 
            ? { 
                ...request, 
                applications: updatedApplications,
                status: 'matched' as const,
                selectedPartnerId: request.applications.find(app => app.id === applicationId)?.applicantId
              }
            : { ...request, applications: updatedApplications }
            
          return updatedRequest
        }
        return request
      })
    )
  }

  return {
    teamHunts,
    partnerRequests,
    setTeamHunts,
    setPartnerRequests,
    createTeamHunt,
    updateTeamHunt,
    joinTeamHunt,
    leaveTeamHunt,
    updateObjectiveStatus,
    createPartnerRequest,
    applyToPartnerRequest,
    respondToApplication
  }
}