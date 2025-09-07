import { useEffect } from 'react'
import { useKVWithFallback } from '@/lib/kv-fallback'
import { User } from '@/types/user'
import { 
  Template, 
  ToolRepository, 
  TeamInfo, 
  TeamProject, 
  TemplateBranch, 
  TemplateCommit 
} from '@/types/templates'

const SAMPLE_USERS: User[] = [
  {
    id: 'user_sample_1',
    username: 'alex_hunter',
    displayName: 'Alex Hunter',
    email: 'alex@cyberconnect.com',
    bio: 'Penetration tester with 5+ years experience in web application security',
    specializations: ['Penetration Testing', 'Bug Bounty', 'Ethical Hacking'],
    followers: ['user_sample_2', 'user_sample_3'],
    following: ['user_sample_2'],
    joinedAt: '2023-01-15T10:00:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    reputation: 125,
    successfulFindings: 8,
    status: {
      type: 'on-hunt',
      customMessage: 'Analyzing HackerOne targets',
      isActivelyHunting: true,
      currentProject: 'Web App Pentest'
    },
    badges: [
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
    certifications: [
      {
        id: 'cert1',
        name: 'OSCP',
        organization: 'Offensive Security',
        dateEarned: '2023-06-15',
        credentialId: 'OS-12345',
        level: 'expert',
        category: 'penetration-testing'
      }
    ],
    securityClearance: {
      level: 'secret',
      country: 'US',
      isActive: true,
      expiryDate: '2025-06-15'
    }
  },
  {
    id: 'user_sample_2',
    username: 'maya_defense',
    displayName: 'Maya Defense',
    email: 'maya@cyberconnect.com',
    bio: 'Blue team specialist focused on incident response and threat hunting',
    specializations: ['Blue Team', 'Incident Response', 'Threat Hunting'],
    followers: ['user_sample_1', 'user_sample_3'],
    following: ['user_sample_1', 'user_sample_3'],
    joinedAt: '2023-02-20T14:30:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    reputation: 95,
    successfulFindings: 3,
    status: {
      type: 'available',
      customMessage: 'Ready for collaboration',
      isActivelyHunting: false
    },
    badges: [
      {
        id: 'badge4',
        type: 'collaborator',
        name: 'Team Player',
        description: 'Collaborated on 5+ successful team hunts',
        icon: '🤝',
        earnedAt: '2024-02-15',
        rarity: 'rare'
      }
    ],
    certifications: [
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
    ]
  },
  {
    id: 'user_sample_3',
    username: 'code_ninja',
    displayName: 'Code Ninja',
    email: 'ninja@cyberconnect.com',
    bio: 'Malware researcher and reverse engineering expert',
    specializations: ['Malware Analysis', 'Reverse Engineering', 'Security Research'],
    followers: ['user_sample_1'],
    following: ['user_sample_2'],
    joinedAt: '2023-03-10T09:15:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    reputation: 78,
    successfulFindings: 5,
    status: {
      type: 'analyzing',
      customMessage: 'Deep diving into binary analysis',
      currentProject: 'Malware Research'
    },
    badges: [
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
    certifications: [
      {
        id: 'cert4',
        name: 'GCIH',
        organization: 'GIAC',
        dateEarned: '2023-08-05',
        expiryDate: '2027-08-05',
        credentialId: 'GIAC-22222',
        level: 'intermediate',
        category: 'incident-response'
      }
    ]
  },
  {
    id: 'user_sample_4',
    username: 'red_phantom',
    email: 'phantom@cyberconnect.com',
    bio: 'Red team operative specializing in social engineering and physical security',
    specializations: ['Red Team', 'Social Engineering', 'Physical Security'],
    followers: [],
    following: ['user_sample_1', 'user_sample_2'],
    joinedAt: '2023-04-05T16:45:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    reputation: 142,
    successfulFindings: 12,
    status: {
      type: 'busy',
      customMessage: 'In critical vulnerability analysis',
      currentProject: 'CVE Research'
    },
    badges: [
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
    ],
    certifications: [
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
    securityClearance: {
      level: 'top-secret',
      country: 'US',
      isActive: true,
      expiryDate: '2025-05-18'
    }
  }
]

const SAMPLE_TEMPLATES: Template[] = [
  {
    id: 'template_1',
    name: 'Web Vulnerability Scanner',
    description: 'A comprehensive Python-based web application vulnerability scanner with support for OWASP Top 10',
    category: 'web-app',
    tags: ['python', 'security', 'scanner', 'owasp', 'vulnerability-assessment'],
    difficulty: 'intermediate',
    files: [
      {
        id: 'file_1',
        name: 'scanner.py',
        path: 'src/scanner.py',
        content: `#!/usr/bin/env python3
import requests
import urllib.parse
from bs4 import BeautifulSoup
import threading
import argparse

class WebVulnScanner:
    def __init__(self, target_url):
        self.target_url = target_url
        self.session = requests.Session()
        self.vulnerabilities = []
    
    def scan_sql_injection(self):
        """Test for SQL injection vulnerabilities"""
        payloads = ["'", '"', "1' OR '1'='1", "1\\" OR \\"1\\"=\\"1"]
        
        for payload in payloads:
            test_url = f"{self.target_url}?id={payload}"
            try:
                response = self.session.get(test_url)
                if "mysql" in response.text.lower() or "syntax error" in response.text.lower():
                    self.vulnerabilities.append({
                        'type': 'SQL Injection',
                        'url': test_url,
                        'payload': payload
                    })
            except Exception as e:
                print(f"Error testing SQL injection: {e}")
    
    def run_scan(self):
        """Run all vulnerability scans"""
        print(f"Starting scan of {self.target_url}")
        self.scan_sql_injection()
        return self.vulnerabilities

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Web Vulnerability Scanner')
    parser.add_argument('url', help='Target URL to scan')
    args = parser.parse_args()
    
    scanner = WebVulnScanner(args.url)
    vulnerabilities = scanner.run_scan()`,
        language: 'python',
        isEntryPoint: true
      },
      {
        id: 'file_2',
        name: 'requirements.txt',
        path: 'requirements.txt',
        content: `requests>=2.28.0
beautifulsoup4>=4.11.0
urllib3>=1.26.0`,
        language: 'text'
      }
    ],
    dependencies: ['requests>=2.28.0', 'beautifulsoup4>=4.11.0'],
    setupInstructions: `1. Clone the repository
2. Install dependencies: pip install -r requirements.txt
3. Run the scanner: python src/scanner.py https://example.com`,
    usageExample: 'python scanner.py https://testphp.vulnweb.com/',
    author: {
      id: 'user_sample_1',
      username: 'alex_hunter',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    stars: 142,
    downloads: 89,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-01'),
    isPublic: true,
    license: 'MIT',
    framework: 'python'
  },
  {
    id: 'template_2',
    name: 'Network Port Scanner',
    description: 'Fast and efficient network port scanner with stealth scanning capabilities',
    category: 'networking',
    tags: ['python', 'networking', 'scanner', 'ports', 'reconnaissance'],
    difficulty: 'beginner',
    files: [
      {
        id: 'file_3',
        name: 'port_scanner.py',
        path: 'port_scanner.py',
        content: `#!/usr/bin/env python3
import socket
import threading
import argparse
from datetime import datetime

class PortScanner:
    def __init__(self, target, timeout=1):
        self.target = target
        self.timeout = timeout
        self.open_ports = []
    
    def scan_port(self, port):
        """Scan a single port"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(self.timeout)
            result = sock.connect_ex((self.target, port))
            sock.close()
            
            if result == 0:
                self.open_ports.append(port)
                print(f"Port {port}: Open")
        except Exception:
            pass
    
    def scan_range(self, start_port, end_port):
        """Scan a range of ports"""
        print(f"Scanning {self.target}")
        for port in range(start_port, end_port + 1):
            self.scan_port(port)
        return sorted(self.open_ports)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Network Port Scanner')
    parser.add_argument('target', help='Target IP address')
    args = parser.parse_args()
    
    scanner = PortScanner(args.target)
    open_ports = scanner.scan_range(1, 1000)`,
        language: 'python',
        isEntryPoint: true
      }
    ],
    dependencies: [],
    setupInstructions: `1. Download the script
2. Make it executable: chmod +x port_scanner.py
3. Run: python port_scanner.py <target_ip>`,
    usageExample: 'python port_scanner.py 192.168.1.1',
    author: {
      id: 'user_sample_2',
      username: 'maya_defense',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    stars: 78,
    downloads: 156,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-25'),
    isPublic: true,
    license: 'GPL-3.0',
    framework: 'python'
  }
]

const SAMPLE_REPOSITORIES: ToolRepository[] = [
  {
    id: 'repo_1',
    name: 'Penetration Testing Toolkit',
    description: 'A comprehensive collection of tools for penetration testing and security assessments',
    category: 'exploitation',
    tools: [
      {
        id: 'tool_1',
        name: 'Nmap',
        description: 'Network exploration tool and security/port scanner',
        version: '7.94',
        installCommand: 'sudo apt install nmap',
        usageExample: 'nmap -sV -O target.com',
        documentation: 'https://nmap.org/docs.html',
        platform: ['linux', 'windows', 'macos'],
        dependencies: ['libpcap'],
        category: 'scanner',
        complexity: 'moderate'
      },
      {
        id: 'tool_2',
        name: 'Metasploit',
        description: 'Advanced open-source penetration testing framework',
        version: '6.3.0',
        installCommand: 'curl https://raw.githubusercontent.com/rapid7/metasploit-omnibus/master/config/templates/metasploit-framework-wrappers/msfupdate.erb > msfinstall',
        usageExample: 'msfconsole',
        documentation: 'https://docs.metasploit.com/',
        platform: ['linux', 'windows', 'macos'],
        dependencies: ['ruby', 'postgresql'],
        category: 'exploit',
        complexity: 'complex'
      }
    ],
    author: {
      id: 'user_sample_1',
      username: 'alex_hunter',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    isPublic: true,
    stars: 245,
    forks: 67,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-02-05'),
    tags: ['penetration-testing', 'security', 'tools', 'vulnerability-assessment']
  },
  {
    id: 'repo_2',
    name: 'Digital Forensics Arsenal',
    description: 'Essential tools for digital forensics investigations and incident response',
    category: 'analysis',
    tools: [
      {
        id: 'tool_3',
        name: 'Volatility',
        description: 'Advanced memory forensics framework',
        version: '3.2.0',
        installCommand: 'pip install volatility3',
        usageExample: 'vol -f memory.dmp windows.info',
        documentation: 'https://volatility3.readthedocs.io/',
        platform: ['linux', 'windows', 'macos'],
        dependencies: ['python3'],
        category: 'analyzer',
        complexity: 'complex'
      }
    ],
    author: {
      id: 'user_sample_3',
      username: 'code_ninja',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    isPublic: true,
    stars: 123,
    forks: 34,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-02-10'),
    tags: ['forensics', 'incident-response', 'memory-analysis', 'investigation']
  }
]

// Sample Teams
const SAMPLE_TEAMS: TeamInfo[] = [
  {
    id: 'team_1',
    name: 'CyberGuard Elite',
    description: 'Advanced threat hunting and incident response specialists',
    members: [
      {
        id: 'user_sample_1',
        username: 'alex_hunter',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        role: 'owner',
        joinedAt: new Date('2023-01-15'),
        lastActive: new Date('2024-01-15'),
        permissions: {
          canEdit: true,
          canDelete: true,
          canInvite: true,
          canManagePermissions: true,
          canCreateBranches: true,
          canMergeBranches: true,
          canPublish: true
        }
      },
      {
        id: 'user_sample_2',
        username: 'maya_defense',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        role: 'admin',
        joinedAt: new Date('2023-02-01'),
        lastActive: new Date('2024-01-14'),
        permissions: {
          canEdit: true,
          canDelete: true,
          canInvite: true,
          canManagePermissions: true,
          canCreateBranches: true,
          canMergeBranches: true,
          canPublish: true
        }
      },
      {
        id: 'user_sample_3',
        username: 'code_ninja',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        role: 'developer',
        joinedAt: new Date('2023-03-15'),
        lastActive: new Date('2024-01-13'),
        permissions: {
          canEdit: true,
          canDelete: false,
          canInvite: false,
          canManagePermissions: false,
          canCreateBranches: true,
          canMergeBranches: false,
          canPublish: false
        }
      }
    ],
    createdAt: new Date('2023-01-15'),
    isPublic: true
  }
]

// Sample Team Projects
const SAMPLE_TEAM_PROJECTS: TeamProject[] = [
  {
    id: 'project_1',
    name: 'Enterprise Security Framework',
    description: 'Comprehensive security framework for enterprise environments',
    team: SAMPLE_TEAMS[0],
    templates: [],
    repositories: [],
    createdAt: new Date('2023-06-01'),
    isPublic: true,
    status: 'active',
    roadmap: [
      {
        id: 'milestone_1',
        title: 'Authentication Module',
        description: 'Implement multi-factor authentication system',
        dueDate: new Date('2024-02-28'),
        status: 'in_progress',
        assignees: [SAMPLE_TEAMS[0].members[0], SAMPLE_TEAMS[0].members[1]],
        tasks: [
          {
            id: 'task_1',
            title: 'Implement OAuth integration',
            description: 'Add OAuth 2.0 authentication flow',
            assignee: SAMPLE_TEAMS[0].members[0],
            status: 'in_progress',
            priority: 'high',
            labels: ['authentication', 'oauth'],
            createdAt: new Date('2024-01-10'),
            estimatedHours: 16
          }
        ],
        progress: 40
      }
    ]
  }
]

// Update existing templates with collaborative features
const COLLABORATIVE_TEMPLATES: Template[] = SAMPLE_TEMPLATES.map((template, index) => ({
  ...template,
  version: '1.0.0',
  collaboration: index < 2 ? {
    isCollaborative: true,
    allowedUsers: SAMPLE_TEAMS[0].members.map(m => m.id),
    permissions: SAMPLE_TEAMS[0].members.reduce((acc, member) => ({
      ...acc,
      [member.id]: member.role === 'owner' || member.role === 'admin' ? 'admin' : 'write'
    }), {}),
    requireApproval: true,
    maxCollaborators: 10
  } : undefined,
  team: index < 2 ? SAMPLE_TEAMS[0] : undefined,
  branches: index === 0 ? [
    {
      id: 'branch_main',
      name: 'main',
      description: 'Main development branch',
      createdBy: {
        id: 'user_sample_1',
        username: 'alex_hunter',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      createdAt: new Date('2023-12-01'),
      lastModified: new Date('2024-01-15'),
      isMain: true,
      commits: [
        {
          id: 'commit_1',
          message: 'Add SQL injection detection improvements',
          author: {
            id: 'user_sample_1',
            username: 'alex_hunter',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
          },
          timestamp: new Date('2024-01-15'),
          changes: [
            {
              type: 'modified',
              filePath: 'src/scanner.py',
              linesAdded: 15,
              linesRemoved: 3
            }
          ]
        }
      ],
      status: 'active'
    }
  ] : undefined
}))

export function useSampleData() {
  const [allUsers, setAllUsers] = useKVWithFallback<User[]>('allUsers', [])
  const [templates, setTemplates] = useKVWithFallback<Template[]>('templates', [])
  const [repositories, setRepositories] = useKVWithFallback<ToolRepository[]>('toolRepositories', [])
  const [teams, setTeams] = useKVWithFallback<TeamInfo[]>('teams', [])
  const [teamProjects, setTeamProjects] = useKVWithFallback<TeamProject[]>('teamProjects', [])

  useEffect(() => {
    // Only initialize sample data if no users exist
    if (allUsers.length === 0) {
      setAllUsers(SAMPLE_USERS)
    }
    
    // Initialize templates with collaborative features
    if (templates.length === 0) {
      setTemplates(COLLABORATIVE_TEMPLATES)
    }
    
    // Initialize repositories if none exist  
    if (repositories.length === 0) {
      setRepositories(SAMPLE_REPOSITORIES)
    }
    
    // Initialize teams if none exist
    if (teams.length === 0) {
      setTeams(SAMPLE_TEAMS)
    }
    
    // Initialize team projects if none exist
    if (teamProjects.length === 0) {
      setTeamProjects(SAMPLE_TEAM_PROJECTS)
    }
  }, [
    allUsers.length, 
    templates.length, 
    repositories.length, 
    teams.length, 
    teamProjects.length,
    setAllUsers, 
    setTemplates, 
    setRepositories,
    setTeams,
    setTeamProjects
  ])
}