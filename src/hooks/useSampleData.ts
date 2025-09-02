import { useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
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
    username: 'cxb3rf1lth',
    displayName: 'CyberSec Admin',
    email: 'admin@cyberconnect.com',
    bio: 'Cybersecurity professional and platform administrator',
    specializations: ['Platform Administration', 'Cybersecurity', 'Full Stack Development'],
    followers: ['user_sample_2', 'user_sample_3'],
    following: ['user_sample_2'],
    joinedAt: '2023-01-15T10:00:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    reputation: 225,
    successfulFindings: 15
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
    successfulFindings: 3
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
    successfulFindings: 5
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
    successfulFindings: 12
  }
]

const SAMPLE_TEMPLATES: Template[] = [
  {
    id: 'template_cybersec_hub',
    name: 'CyberSec Hub Template',
    description: 'Professional cybersecurity networking platform template based on the main cxb3rf1lth repository',
    category: 'web-app',
    tags: ['react', 'typescript', 'cybersecurity', 'networking', 'platform'],
    difficulty: 'intermediate',
    files: [
      {
        id: 'file_1',
        name: 'app.tsx',
        path: 'src/App.tsx',
        content: `import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Sidebar } from '@/components/layout/Sidebar'
import { MainContent } from '@/components/layout/MainContent'
import { User } from '@/types/user'

function App() {
  const [currentUser, setCurrentUser] = useKV<User | null>('currentUser', null)
  const [activeTab, setActiveTab] = useState<string>('feed')

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar
          currentUser={currentUser}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <MainContent
          currentUser={currentUser}
          activeTab={activeTab}
        />
      </div>
    </div>
  )
}

export default App`,
        language: 'typescript',
        isEntryPoint: true
      },
      {
        id: 'file_2',
        name: 'package.json',
        path: 'package.json',
        content: `{
  "name": "cybersec-hub",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "~5.6.2",
    "vite": "^6.0.1"
  }
}`,
        language: 'json'
      }
    ],
    dependencies: ['react>=18.3.1', 'typescript>=5.6.0'],
    setupInstructions: `1. Clone the cxb3rf1lth/cybersec-hub repository
2. Install dependencies: npm install
3. Run development server: npm run dev`,
    usageExample: 'npm run dev',
    author: {
      id: 'user_sample_1',
      username: 'cxb3rf1lth',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    stars: 89,
    downloads: 45,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-01'),
    isPublic: true,
    license: 'MIT',
    framework: 'react'
  }
]

const SAMPLE_REPOSITORIES: ToolRepository[] = [
  {
    id: 'repo_cxb3rf1lth',
    name: 'cxb3rf1lth',
    description: 'Main display repository for cybersecurity tools and resources',
    category: 'automation',
    tools: [
      {
        id: 'tool_main_1',
        name: 'CyberSec Hub',
        description: 'Cybersecurity professional networking platform',
        version: '1.0.0',
        installCommand: 'npm install',
        usageExample: 'npm run dev',
        documentation: 'https://github.com/cxb3rf1lth/cybersec-hub',
        platform: ['linux', 'windows', 'macos'],
        dependencies: ['node', 'npm'],
        category: 'platform',
        complexity: 'moderate'
      }
    ],
    author: {
      id: 'user_sample_1',
      username: 'cxb3rf1lth',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    isPublic: true,
    stars: 150,
    forks: 25,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-02-15'),
    tags: ['cybersecurity', 'networking', 'platform', 'community']
  },
  {
    id: 'repo_cyber_hub',
    name: 'cyber-hub',
    description: 'Cybersecurity resource hub with tools and educational content',
    category: 'reconnaissance',
    tools: [
      {
        id: 'tool_hub_1',
        name: 'Security Scanner',
        description: 'Comprehensive security scanning toolkit',
        version: '2.1.0',
        installCommand: 'pip install -r requirements.txt',
        usageExample: 'python scanner.py --target example.com',
        documentation: 'https://github.com/cxb3rf1lth/cyber-hub',
        platform: ['linux', 'windows', 'macos'],
        dependencies: ['python3', 'nmap'],
        category: 'scanner',
        complexity: 'moderate'
      }
    ],
    author: {
      id: 'user_sample_1',
      username: 'cxb3rf1lth',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    isPublic: true,
    stars: 89,
    forks: 12,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-10'),
    tags: ['cybersecurity', 'tools', 'scanning', 'education']
  },
  {
    id: 'repo_hoaxshell_cheatsheet',
    name: 'hoaxshell-cheatsheet',
    description: 'Comprehensive cheatsheet for HoaxShell reverse shell toolkit',
    category: 'exploitation',
    tools: [
      {
        id: 'tool_hoax_1',
        name: 'HoaxShell',
        description: 'Windows reverse shell payload generator and handler',
        version: '1.5.0',
        installCommand: 'git clone https://github.com/t3l3machus/hoaxshell',
        usageExample: 'python3 hoaxshell.py -s <your_ip>',
        documentation: 'https://github.com/t3l3machus/hoaxshell',
        platform: ['linux', 'windows'],
        dependencies: ['python3'],
        category: 'exploit',
        complexity: 'complex'
      }
    ],
    author: {
      id: 'user_sample_1',
      username: 'cxb3rf1lth',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    isPublic: true,
    stars: 67,
    forks: 8,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-05'),
    tags: ['reverse-shell', 'windows', 'exploitation', 'cheatsheet']
  }
]

// Sample Teams
const SAMPLE_TEAMS: TeamInfo[] = [
  {
    id: 'team_1',
    name: 'CyberSec Hub Team',
    description: 'Core team maintaining cybersecurity tools and platform',
    members: [
      {
        id: 'user_sample_1',
        username: 'cxb3rf1lth',
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
  collaboration: {
    isCollaborative: true,
    allowedUsers: SAMPLE_TEAMS[0].members.map(m => m.id),
    permissions: SAMPLE_TEAMS[0].members.reduce((acc, member) => ({
      ...acc,
      [member.id]: member.role === 'owner' || member.role === 'admin' ? 'admin' : 'write'
    }), {}),
    requireApproval: true,
    maxCollaborators: 10
  },
  team: SAMPLE_TEAMS[0],
  branches: [
    {
      id: 'branch_main',
      name: 'main',
      description: 'Main development branch',
      createdBy: {
        id: 'user_sample_1',
        username: 'cxb3rf1lth',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      createdAt: new Date('2023-12-01'),
      lastModified: new Date('2024-01-15'),
      isMain: true,
      commits: [
        {
          id: 'commit_1',
          message: 'Update cybersec hub platform with latest features',
          author: {
            id: 'user_sample_1',
            username: 'cxb3rf1lth',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
          },
          timestamp: new Date('2024-01-15'),
          changes: [
            {
              type: 'modified',
              filePath: 'src/App.tsx',
              linesAdded: 25,
              linesRemoved: 8
            }
          ]
        }
      ],
      status: 'active'
    }
  ]
}))

export function useSampleData() {
  const [allUsers, setAllUsers] = useKV<User[]>('allUsers', [])
  const [templates, setTemplates] = useKV<Template[]>('templates', [])
  const [repositories, setRepositories] = useKV<ToolRepository[]>('toolRepositories', [])
  const [teams, setTeams] = useKV<TeamInfo[]>('teams', [])
  const [teamProjects, setTeamProjects] = useKV<TeamProject[]>('teamProjects', [])

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