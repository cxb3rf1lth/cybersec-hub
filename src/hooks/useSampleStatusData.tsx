import { useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { SecurityBadge, SecurityCertification, UserStatus } from '@/types/user'

export function useSampleStatusData() {
  const [, setUserStatuses] = useKV<Record<string, UserStatus>>('userStatuses', {})
  const [, setBadges] = useKV<Record<string, SecurityBadge[]>>('userBadges', {})
  const [, setCertifications] = useKV<Record<string, SecurityCertification[]>>('userCertifications', {})

  useEffect(() => {
    // Sample user statuses
    const sampleStatuses: Record<string, UserStatus> = {
      'user1': {
        type: 'on-hunt',
        customMessage: 'Analyzing HackerOne targets',
        isActivelyHunting: true,
        currentProject: 'Web App Pentest'
      },
      'user2': {
        type: 'available',
        customMessage: 'Ready for collaboration',
        isActivelyHunting: false
      },
      'user3': {
        type: 'busy',
        customMessage: 'In critical vulnerability analysis',
        currentProject: 'CVE Research'
      },
      'user4': {
        type: 'in-meeting',
        customMessage: 'Bug bounty planning session'
      },
      'user5': {
        type: 'analyzing',
        customMessage: 'Deep diving into binary analysis',
        currentProject: 'Malware Research'
      }
    }

    // Sample security badges
    const sampleBadges: Record<string, SecurityBadge[]> = {
      'user1': [
        {
          id: 'badge1',
          type: 'first-blood',
          name: 'First Blood',
          description: 'First to report a critical vulnerability on a major platform',
          icon: '🩸',
          earnedAt: '2024-01-15',
          rarity: 'epic',
          metadata: {
            platform: 'HackerOne',
            severity: 'critical',
            bountyValue: 5000,
            targetCompany: 'TechCorp'
          }
        },
        {
          id: 'badge2',
          type: 'hall-of-fame',
          name: 'Hall of Fame',
          description: 'Inducted into platform hall of fame',
          icon: '🏆',
          earnedAt: '2024-02-20',
          rarity: 'legendary',
          metadata: {
            platform: 'Bugcrowd'
          }
        },
        {
          id: 'badge3',
          type: 'critical-finder',
          name: 'Critical Hunter',
          description: 'Found 10+ critical vulnerabilities',
          icon: '⚡',
          earnedAt: '2024-03-10',
          rarity: 'rare',
          metadata: {
            amount: 12,
            severity: 'critical'
          }
        }
      ],
      'user2': [
        {
          id: 'badge4',
          type: 'bug-hunter',
          name: 'Bug Hunter',
          description: 'Successfully reported 50+ vulnerabilities',
          icon: '🎯',
          earnedAt: '2024-01-20',
          rarity: 'uncommon',
          metadata: {
            amount: 73
          }
        },
        {
          id: 'badge5',
          type: 'collaborator',
          name: 'Team Player',
          description: 'Collaborated on 5+ successful team hunts',
          icon: '🤝',
          earnedAt: '2024-02-15',
          rarity: 'rare'
        }
      ],
      'user3': [
        {
          id: 'badge6',
          type: 'cve-publisher',
          name: 'CVE Publisher',
          description: 'Published a CVE',
          icon: '🛡️',
          earnedAt: '2024-01-05',
          rarity: 'epic',
          metadata: {
            cveId: 'CVE-2024-1234'
          }
        },
        {
          id: 'badge7',
          type: 'zero-day',
          name: 'Zero Day',
          description: 'Discovered a zero-day vulnerability',
          icon: '💀',
          earnedAt: '2024-03-01',
          rarity: 'legendary'
        }
      ],
      'user4': [
        {
          id: 'badge8',
          type: 'mentor',
          name: 'Mentor',
          description: 'Mentored 10+ junior researchers',
          icon: '👨‍🏫',
          earnedAt: '2024-02-10',
          rarity: 'rare'
        },
        {
          id: 'badge9',
          type: 'conference-speaker',
          name: 'Speaker',
          description: 'Spoke at major security conference',
          icon: '🎤',
          earnedAt: '2024-01-30',
          rarity: 'epic'
        }
      ],
      'user5': [
        {
          id: 'badge10',
          type: 'tool-creator',
          name: 'Tool Creator',
          description: 'Created popular security tool',
          icon: '🔧',
          earnedAt: '2024-02-25',
          rarity: 'rare'
        },
        {
          id: 'badge11',
          type: 'bounty-master',
          name: 'Bounty Master',
          description: 'Earned $100K+ in bounties',
          icon: '👑',
          earnedAt: '2024-03-15',
          rarity: 'legendary',
          metadata: {
            bountyValue: 125000
          }
        }
      ]
    }

    // Sample certifications
    const sampleCertifications: Record<string, SecurityCertification[]> = {
      'user1': [
        {
          id: 'cert1',
          name: 'OSCP',
          organization: 'Offensive Security',
          dateEarned: '2023-06-15',
          credentialId: 'OS-12345',
          level: 'expert',
          category: 'penetration-testing'
        },
        {
          id: 'cert2',
          name: 'CEH',
          organization: 'EC-Council',
          dateEarned: '2023-03-10',
          expiryDate: '2026-03-10',
          credentialId: 'ECC-67890',
          level: 'intermediate',
          category: 'penetration-testing'
        }
      ],
      'user2': [
        {
          id: 'cert3',
          name: 'CISSP',
          organization: 'ISC²',
          dateEarned: '2023-09-20',
          expiryDate: '2026-09-20',
          credentialId: 'ISC2-11111',
          level: 'expert',
          category: 'general'
        }
      ],
      'user3': [
        {
          id: 'cert4',
          name: 'GCIH',
          organization: 'GIAC',
          dateEarned: '2023-08-05',
          expiryDate: '2027-08-05',
          credentialId: 'GIAC-22222',
          level: 'intermediate',
          category: 'incident-response'
        },
        {
          id: 'cert5',
          name: 'GCFA',
          organization: 'GIAC',
          dateEarned: '2023-11-12',
          expiryDate: '2027-11-12',
          credentialId: 'GIAC-33333',
          level: 'expert',
          category: 'forensics'
        }
      ],
      'user4': [
        {
          id: 'cert6',
          name: 'CISM',
          organization: 'ISACA',
          dateEarned: '2023-05-18',
          expiryDate: '2026-05-18',
          credentialId: 'ISACA-44444',
          level: 'master',
          category: 'governance'
        }
      ],
      'user5': [
        {
          id: 'cert7',
          name: 'CCSP',
          organization: 'ISC²',
          dateEarned: '2023-07-22',
          expiryDate: '2026-07-22',
          credentialId: 'ISC2-55555',
          level: 'expert',
          category: 'cloud-security'
        }
      ]
    }

    setUserStatuses(sampleStatuses)
    setBadges(sampleBadges)
    setCertifications(sampleCertifications)
  }, [setUserStatuses, setBadges, setCertifications])
}