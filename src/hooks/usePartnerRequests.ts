import { useKV } from '@github/spark/hooks'
import { PartnerRequest, PartnerApplication, SkillCategory, PartnerMatch } from '@/types/partner-requests'

export function usePartnerRequests() {
  const [partnerRequests, setPartnerRequests] = useKV<PartnerRequest[]>('partner-requests', [])
  const [skillCategories] = useKV<SkillCategory[]>('skill-categories', [
    {
      id: 'penetration-testing',
      name: 'Penetration Testing',
      icon: '🔍',
      skills: ['Web App Testing', 'Network Pentesting', 'Mobile App Testing', 'API Testing', 'Infrastructure Testing']
    },
    {
      id: 'reverse-engineering',
      name: 'Reverse Engineering',
      icon: '🔧',
      skills: ['Malware Analysis', 'Binary Analysis', 'Firmware Analysis', 'Protocol Analysis', 'Crypto Analysis']
    },
    {
      id: 'red-team',
      name: 'Red Team Operations',
      icon: '⚔️',
      skills: ['Social Engineering', 'Physical Security', 'C2 Development', 'Payload Development', 'OSINT']
    },
    {
      id: 'blue-team',
      name: 'Blue Team Defense',
      icon: '🛡️',
      skills: ['Incident Response', 'Threat Hunting', 'SIEM Management', 'Forensics', 'SOC Operations']
    },
    {
      id: 'development',
      name: 'Security Development',
      icon: '💻',
      skills: ['Secure Coding', 'Tool Development', 'Automation', 'DevSecOps', 'Cloud Security']
    },
    {
      id: 'research',
      name: 'Security Research',
      icon: '🔬',
      skills: ['Vulnerability Research', 'Exploit Development', 'Zero-day Discovery', 'CVE Analysis', 'PoC Development']
    }
  ])

  const createPartnerRequest = (requestData: Omit<PartnerRequest, 'id' | 'applications' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const newRequest: PartnerRequest = {
      id: `pr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...requestData,
      applications: [],
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setPartnerRequests(current => [newRequest, ...current])
    return newRequest
  }

  const updatePartnerRequest = (requestId: string, updates: Partial<PartnerRequest>) => {
    setPartnerRequests(current => 
      current.map(request => 
        request.id === requestId 
          ? { ...request, ...updates, updatedAt: new Date().toISOString() }
          : request
      )
    )
  }

  const applyToPartnerRequest = (requestId: string, application: Omit<PartnerApplication, 'id' | 'appliedAt' | 'status'>) => {
    const newApplication: PartnerApplication = {
      id: `pa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...application,
      status: 'pending',
      appliedAt: new Date().toISOString()
    }

    setPartnerRequests(current => 
      current.map(request => 
        request.id === requestId 
          ? { 
              ...request, 
              applications: [...request.applications, newApplication],
              updatedAt: new Date().toISOString()
            }
          : request
      )
    )

    return newApplication
  }

  const updateApplicationStatus = (requestId: string, applicationId: string, status: PartnerApplication['status']) => {
    setPartnerRequests(current => 
      current.map(request => 
        request.id === requestId 
          ? {
              ...request,
              applications: request.applications.map(app => 
                app.id === applicationId ? { ...app, status } : app
              ),
              updatedAt: new Date().toISOString()
            }
          : request
      )
    )
  }

  const getMyRequests = (userId: string) => {
    return partnerRequests.filter(request => request.requesterId === userId)
  }

  const getMyApplications = (userId: string) => {
    const applications: Array<{ request: PartnerRequest; application: PartnerApplication }> = []
    
    partnerRequests.forEach(request => {
      const userApplication = request.applications.find(app => app.applicantId === userId)
      if (userApplication) {
        applications.push({ request, application: userApplication })
      }
    })
    
    return applications
  }

  const findMatches = (userId: string, userSkills: string[]): PartnerMatch[] => {
    const matches: PartnerMatch[] = []
    
    partnerRequests
      .filter(request => request.requesterId !== userId && request.status === 'open')
      .forEach(request => {
        const skillMatches = request.skillsNeeded.filter(skill => 
          userSkills.some(userSkill => 
            userSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(userSkill.toLowerCase())
          )
        ).length
        
        const skillsOfferedMatches = userSkills.filter(skill => 
          request.skillsOffered.some(offeredSkill => 
            skill.toLowerCase().includes(offeredSkill.toLowerCase()) ||
            offeredSkill.toLowerCase().includes(skill.toLowerCase())
          )
        ).length

        if (skillMatches > 0 || skillsOfferedMatches > 0) {
          const matchScore = (skillMatches * 2 + skillsOfferedMatches) * 20
          const compatibilityReasons = []
          
          if (skillMatches > 0) {
            compatibilityReasons.push(`You have ${skillMatches} skills they need`)
          }
          if (skillsOfferedMatches > 0) {
            compatibilityReasons.push(`They offer ${skillsOfferedMatches} skills you could learn`)
          }
          
          matches.push({
            id: `match-${request.id}-${userId}`,
            requestId: request.id,
            partnerId: request.requesterId,
            partnerName: request.requesterName,
            partnerAvatar: request.requesterAvatar,
            matchScore: Math.min(matchScore, 100),
            compatibilityReasons,
            suggestedAt: new Date().toISOString()
          })
        }
      })
    
    return matches.sort((a, b) => b.matchScore - a.matchScore)
  }

  return {
    partnerRequests,
    skillCategories,
    createPartnerRequest,
    updatePartnerRequest,
    applyToPartnerRequest,
    updateApplicationStatus,
    getMyRequests,
    getMyApplications,
    findMatches
  }
}