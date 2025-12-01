import { useKVWithFallback } from '@/lib/kv-fallback'
import { PartnerRequest } from '@/types/partner-requests'

export function useSamplePartnerRequests() {
  const [partnerRequests, setPartnerRequests] = useKVWithFallback<PartnerRequest[]>('partner-requests', [])

  // Initialize with sample data only if empty
  if (partnerRequests.length === 0) {
    const sampleRequests: PartnerRequest[] = [
      {
        id: 'pr-1',
        requesterId: 'user-2',
        requesterName: 'Sarah Chen',
        requesterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        title: 'Looking for Red Team Partner for Enterprise Assessment',
        description: 'Need an experienced red team operator to collaborate on a comprehensive enterprise security assessment. This is a 3-month engagement with a Fortune 500 company focusing on AD exploitation and lateral movement.',
        projectType: 'red-team',
        skillsOffered: ['Active Directory', 'PowerShell', 'C2 Development', 'OSINT'],
        skillsNeeded: ['Physical Security', 'Social Engineering', 'Hardware Hacking'],
        experienceLevel: 'advanced',
        commitment: 'project-based',
        compensation: 'revenue-share',
        estimatedDuration: '3 months',
        tags: ['enterprise', 'active-directory', 'lateral-movement', 'high-value'],
        status: 'open',
        applications: [],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 'pr-2',
        requesterId: 'user-4',
        requesterName: 'Marcus Rodriguez',
        requesterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus',
        title: 'Mobile App Security Researcher Needed',
        description: 'Building a comprehensive mobile security testing framework. Looking for someone with deep Android/iOS reverse engineering skills to help develop automated testing tools.',
        projectType: 'research',
        skillsOffered: ['Web App Testing', 'API Security', 'Automation'],
        skillsNeeded: ['Mobile Security', 'Reverse Engineering', 'Frida', 'Binary Analysis'],
        experienceLevel: 'expert',
        commitment: 'ongoing',
        compensation: 'fixed-payment',
        estimatedDuration: '6 months',
        tags: ['mobile', 'automation', 'research', 'tools'],
        status: 'open',
        applications: [
          {
            id: 'pa-1',
            applicantId: 'user-5',
            applicantName: 'Alex Thompson',
            applicantAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
            message: 'I have 5+ years in mobile security research and have developed several popular Frida scripts. Recently published research on iOS jailbreak detection bypasses.',
            skillsHighlight: ['iOS Security', 'Frida Scripting', 'LLDB', 'ARM Assembly'],
            portfolioItems: ['CVE-2023-1234 (iOS)', 'FridaKit Framework', 'Mobile CTF Challenges'],
            availability: 'Evenings and weekends',
            status: 'pending',
            appliedAt: '2024-01-16T14:30:00Z'
          }
        ],
        createdAt: '2024-01-14T08:00:00Z',
        updatedAt: '2024-01-16T14:30:00Z'
      },
      {
        id: 'pr-3',
        requesterId: 'user-6',
        requesterName: 'Elena Petrov',
        requesterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elena',
        title: 'Bug Bounty Team Formation - Web3 Focus',
        description: 'Forming a specialized team for Web3 and DeFi bug bounties. I handle smart contract auditing and need partners for frontend/backend web security and blockchain infrastructure.',
        projectType: 'bug-bounty',
        skillsOffered: ['Smart Contract Auditing', 'Solidity', 'DeFi Protocols', 'Blockchain Analysis'],
        skillsNeeded: ['Web App Testing', 'JavaScript Security', 'Node.js', 'API Testing'],
        experienceLevel: 'intermediate',
        commitment: 'part-time',
        compensation: 'revenue-share',
        estimatedDuration: 'Ongoing',
        tags: ['web3', 'defi', 'smart-contracts', 'bounty-team'],
        status: 'open',
        applications: [],
        createdAt: '2024-01-13T16:20:00Z',
        updatedAt: '2024-01-13T16:20:00Z'
      },
      {
        id: 'pr-4',
        requesterId: 'user-7',
        requesterName: 'David Kim',
        requesterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
        title: 'Cloud Security Assessment Partnership',
        description: 'Looking for a cloud security expert to partner on AWS/Azure assessments. I specialize in container security and Kubernetes, need someone strong in IAM and serverless.',
        projectType: 'blue-team',
        skillsOffered: ['Container Security', 'Kubernetes', 'Docker', 'CI/CD Security'],
        skillsNeeded: ['AWS Security', 'Azure Security', 'IAM', 'Serverless Security'],
        experienceLevel: 'advanced',
        commitment: 'project-based',
        compensation: 'revenue-share',
        estimatedDuration: '2-4 months per project',
        tags: ['cloud', 'aws', 'azure', 'serverless', 'containers'],
        status: 'open',
        applications: [],
        createdAt: '2024-01-12T11:45:00Z',
        updatedAt: '2024-01-12T11:45:00Z'
      },
      {
        id: 'pr-5',
        requesterId: 'user-8',
        requesterName: 'Zoe Anderson',
        requesterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zoe',
        title: 'CTF Team for DEF CON Qualifiers',
        description: 'Assembling a competitive CTF team for DEF CON qualifiers and other major competitions. Looking for specialists in crypto, pwn, and reverse engineering categories.',
        projectType: 'ctf',
        skillsOffered: ['Web Exploitation', 'Forensics', 'OSINT', 'Team Leadership'],
        skillsNeeded: ['Cryptography', 'Binary Exploitation', 'Reverse Engineering', 'Kernel Exploitation'],
        experienceLevel: 'expert',
        commitment: 'part-time',
        compensation: 'experience',
        estimatedDuration: '6 months (competition season)',
        tags: ['ctf', 'defcon', 'competition', 'team-building'],
        status: 'open',
        applications: [
          {
            id: 'pa-2',
            applicantId: 'user-9',
            applicantName: 'Ryan Garcia',
            applicantAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ryan',
            message: 'Crypto specialist with top 10 finishes in major CTFs. Strong in modern cryptography, elliptic curves, and lattice-based attacks.',
            skillsHighlight: ['Applied Cryptography', 'SageMath', 'Number Theory', 'Lattice Attacks'],
            portfolioItems: ['GoogleCTF 2023 Crypto', 'PlaidCTF Writeups', 'Crypto Challenge Author'],
            availability: 'Weekends and competition days',
            status: 'pending',
            appliedAt: '2024-01-14T20:15:00Z'
          }
        ],
        createdAt: '2024-01-11T14:00:00Z',
        updatedAt: '2024-01-14T20:15:00Z'
      },
      {
        id: 'pr-6',
        requesterId: 'user-10',
        requesterName: 'Ahmed Hassan',
        requesterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed',
        title: 'IoT Security Research Collaboration',
        description: 'Researching vulnerabilities in industrial IoT devices. Have access to testing lab and device samples, need partner with firmware analysis and hardware hacking skills.',
        projectType: 'research',
        skillsOffered: ['Network Protocols', 'Wireless Security', 'Lab Setup', 'Device Access'],
        skillsNeeded: ['Firmware Analysis', 'Hardware Hacking', 'Embedded Systems', 'JTAG/SWD'],
        experienceLevel: 'advanced',
        commitment: 'ongoing',
        compensation: 'revenue-share',
        estimatedDuration: '1 year research project',
        tags: ['iot', 'firmware', 'hardware', 'industrial', 'research'],
        status: 'open',
        applications: [],
        createdAt: '2024-01-10T09:30:00Z',
        updatedAt: '2024-01-10T09:30:00Z'
      },
      {
        id: 'pr-7',
        requesterId: 'user-11',
        requesterName: 'Kai Zhang',
        requesterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kai',
        title: 'Threat Intelligence Platform Integration',
        description: 'Building integrations with major threat intel sources like Shodan, Project Discovery, and ThreatFox. Need partner with API development skills and threat hunting experience.',
        projectType: 'tool-development',
        skillsOffered: ['Threat Intelligence', 'Data Analysis', 'OSINT', 'Python'],
        skillsNeeded: ['API Development', 'System Integration', 'Database Design', 'Real-time Processing'],
        experienceLevel: 'advanced',
        commitment: 'project-based',
        compensation: 'revenue-share',
        estimatedDuration: '4-6 months',
        tags: ['threat-intel', 'api', 'shodan', 'osint', 'automation'],
        status: 'open',
        applications: [],
        createdAt: '2024-01-09T15:20:00Z',
        updatedAt: '2024-01-09T15:20:00Z'
      },
      {
        id: 'pr-8',
        requesterId: 'user-12',
        requesterName: 'Isabella Rodriguez',
        requesterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=isabella',
        title: 'Bug Bounty Platform Automation Suite',
        description: 'Creating automation tools for HackerOne, Bugcrowd, Intigriti, and YesWeHack. Need partner for advanced reconnaissance and vulnerability discovery automation.',
        projectType: 'tool-development',
        skillsOffered: ['Automation', 'Scripting', 'Platform APIs', 'Workflow Design'],
        skillsNeeded: ['Reconnaissance', 'Vulnerability Research', 'Bash/Python', 'CI/CD'],
        experienceLevel: 'expert',
        commitment: 'ongoing',
        compensation: 'revenue-share',
        estimatedDuration: '6+ months',
        tags: ['automation', 'bounty', 'recon', 'platforms', 'tools'],
        status: 'open',
        applications: [
          {
            id: 'pa-3',
            applicantId: 'user-13',
            applicantName: 'Phoenix Walker',
            applicantAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=phoenix',
            message: 'Expert in reconnaissance automation with custom tools for subdomain discovery, port scanning, and vulnerability assessment. Active on multiple bug bounty platforms.',
            skillsHighlight: ['Subfinder', 'Nuclei', 'Custom Tooling', 'Bug Bounty'],
            portfolioItems: ['ReconPipe Framework', '50+ Valid Bounties', 'HackerOne Top 100'],
            availability: 'Full-time availability',
            status: 'pending',
            appliedAt: '2024-01-11T09:45:00Z'
          }
        ],
        createdAt: '2024-01-08T12:00:00Z',
        updatedAt: '2024-01-11T09:45:00Z'
      }
    ]

    setPartnerRequests(sampleRequests)
  }

  return { partnerRequests }
}