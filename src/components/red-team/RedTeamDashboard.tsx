import { useState, useEffect } from 'react'
import { useKVWithFallback } from '@/lib/kv-fallback'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BinaryRain } from '@/components/ui/loading-animations'
import { 
  Target, 
  Shield, 
  Bug, 
  Crosshair, 
  Clock, 
  Users, 
  Activity,
  Zap,
  Eye,
  Terminal,
  Database,
  Network,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  SkipForward,
  Plus,
  FileCode,
  Lightning,
  Skull,
  Strategy,
  Sword,
  Globe,
  Graph,
  Gauge,
  Fire,
  Binoculars,
  Code,
  Robot,
  Crown
} from '@phosphor-icons/react'
import type { User } from '@/types/user'

interface RedTeamCampaign {
  id: string
  name: string
  target: string
  status: 'planning' | 'reconnaissance' | 'initial-access' | 'persistence' | 'privilege-escalation' | 'defense-evasion' | 'credential-access' | 'discovery' | 'lateral-movement' | 'collection' | 'exfiltration' | 'impact' | 'completed' | 'failed'
  type: 'phishing' | 'web-app' | 'network' | 'physical' | 'social-engineering' | 'mobile' | 'iot' | 'cloud' | 'apt-simulation' | 'purple-team'
  phase: 'reconnaissance' | 'weaponization' | 'delivery' | 'exploitation' | 'installation' | 'command-control' | 'actions-objectives'
  progress: number
  findings: number
  criticalFindings: number
  teamMembers: string[]
  startDate: string
  estimatedCompletion: string
  objectives: string[]
  scope: string[]
  rules: string[]
  tools: string[]
  techniques: string[]
  mitreTactics: string[]
  c2Infrastructure: {
    active: number
    total: number
    domains: string[]
    redirectors: number
  }
  payloads: {
    generated: number
    deployed: number
    detected: number
  }
  stealth: {
    score: number
    detectionsTriggered: number
    alertsGenerated: number
  }
}

interface C2Framework {
  id: string
  name: string
  type: 'http' | 'https' | 'dns' | 'tcp' | 'custom'
  status: 'active' | 'inactive' | 'compromised' | 'maintenance'
  endpoints: string[]
  agents: number
  lastBeacon: string
  stealthLevel: 'low' | 'medium' | 'high' | 'stealth'
  encryption: boolean
  malleable: boolean
}

interface Payload {
  id: string
  name: string
  type: 'exe' | 'dll' | 'ps1' | 'hta' | 'macro' | 'iso' | 'lnk' | 'jar'
  platform: 'windows' | 'linux' | 'macos' | 'android' | 'ios'
  evasionTechniques: string[]
  size: number
  detectionRate: number
  deployments: number
  createdAt: string
}

interface RedTeamTechnique {
  id: string
  mitreId: string
  name: string
  tactic: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  detection: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high' | 'critical'
  prerequisites: string[]
  tools: string[]
  procedures: string[]
  countermeasures: string[]
  examples: {
    command: string
    description: string
  }[]
}

interface RedTeamFinding {
  id: string
  campaignId: string
  title: string
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  category: 'vulnerability' | 'misconfiguration' | 'weak-credential' | 'social-engineering' | 'physical-security' | 'data-exposure' | 'privilege-escalation'
  description: string
  impact: string
  remediation: string
  evidence: string[]
  cvss: number
  cwe?: string
  owasp?: string
  mitreAttack?: string
  discoveredAt: string
  reportedAt?: string
  status: 'new' | 'verified' | 'reported' | 'fixed' | 'wont-fix' | 'duplicate'
}

interface RedTeamTool {
  id: string
  name: string
  category: 'reconnaissance' | 'exploitation' | 'post-exploitation' | 'persistence' | 'defense-evasion' | 'lateral-movement' | 'data-collection'
  description: string
  usage: string
  commands: string[]
  isInstalled: boolean
  version?: string
  lastUsed?: string
}

interface Props {
  currentUser: User
}

export function RedTeamDashboard({ currentUser }: Props) {
  const [campaigns, setCampaigns] = useKVWithFallback<RedTeamCampaign[]>('redteam-campaigns', [])
  const [findings, setFindings] = useKVWithFallback<RedTeamFinding[]>('redteam-findings', [])
  const [tools, setTools] = useKVWithFallback<RedTeamTool[]>('redteam-tools', [])
  const [c2Frameworks, setC2Frameworks] = useKVWithFallback<C2Framework[]>('redteam-c2', [])
  const [payloads, setPayloads] = useKVWithFallback<Payload[]>('redteam-payloads', [])
  const [techniques, setTechniques] = useKVWithFallback<RedTeamTechnique[]>('redteam-techniques', [])
  const [activeTab, setActiveTab] = useState('campaigns')
  const [selectedCampaign, setSelectedCampaign] = useState<RedTeamCampaign | null>(null)
  const [selectedTechnique, setSelectedTechnique] = useState<RedTeamTechnique | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showNewCampaign, setShowNewCampaign] = useState(false)
  const [showNewPayload, setShowNewPayload] = useState(false)

  // Initialize sample data
  useEffect(() => {
    if (campaigns.length === 0) {
      const sampleCampaigns: RedTeamCampaign[] = [
        {
          id: 'campaign-1',
          name: 'Operation Shadow Strike',
          target: 'Corporate Network Infrastructure',
          status: 'lateral-movement',
          type: 'apt-simulation',
          phase: 'exploitation',
          progress: 65,
          findings: 12,
          criticalFindings: 3,
          teamMembers: [currentUser.id, 'user-2', 'user-3'],
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedCompletion: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          objectives: [
            'Gain initial access to internal network',
            'Escalate privileges to domain admin',
            'Establish persistent backdoors',
            'Exfiltrate sensitive data',
            'Test incident response capabilities'
          ],
          scope: ['10.0.0.0/8', 'corp.example.com', 'External web applications'],
          rules: [
            'No denial of service attacks',
            'No data destruction',
            'Report critical findings within 4 hours',
            'Maintain stealth and avoid detection'
          ],
          tools: ['Cobalt Strike', 'Metasploit', 'BloodHound', 'Mimikatz', 'PowerShell Empire'],
          techniques: ['T1190', 'T1078', 'T1055', 'T1003', 'T1021'],
          mitreTactics: ['Initial Access', 'Persistence', 'Privilege Escalation', 'Lateral Movement', 'Collection'],
          c2Infrastructure: {
            active: 3,
            total: 5,
            domains: ['cdn-updates.com', 'secure-patch.net', 'system-health.org'],
            redirectors: 2
          },
          payloads: {
            generated: 15,
            deployed: 8,
            detected: 2
          },
          stealth: {
            score: 78,
            detectionsTriggered: 3,
            alertsGenerated: 7
          }
        },
        {
          id: 'campaign-2',
          name: 'Purple Team Exercise',
          target: 'SOC Detection Capabilities',
          status: 'privilege-escalation',
          type: 'purple-team',
          phase: 'exploitation',
          progress: 45,
          findings: 8,
          criticalFindings: 2,
          teamMembers: [currentUser.id, 'user-4', 'user-5'],
          startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          objectives: [
            'Test SIEM detection rules',
            'Evaluate incident response procedures',
            'Identify gaps in monitoring coverage',
            'Validate threat hunting capabilities'
          ],
          scope: ['Internal network segments', 'Employee workstations', 'Critical servers'],
          rules: [
            'Coordinate with blue team',
            'Document all TTPs used',
            'Provide real-time feedback'
          ],
          tools: ['Atomic Red Team', 'Caldera', 'HELK', 'Sigma Rules'],
          techniques: ['T1055', 'T1003', 'T1082', 'T1057'],
          mitreTactics: ['Defense Evasion', 'Credential Access', 'Discovery', 'Persistence'],
          c2Infrastructure: {
            active: 2,
            total: 3,
            domains: ['health-monitor.io', 'update-service.net'],
            redirectors: 1
          },
          payloads: {
            generated: 8,
            deployed: 6,
            detected: 4
          },
          stealth: {
            score: 65,
            detectionsTriggered: 8,
            alertsGenerated: 15
          }
        }
      ]
      setCampaigns(sampleCampaigns)
    }

    if (c2Frameworks.length === 0) {
      const sampleC2: C2Framework[] = [
        {
          id: 'c2-1',
          name: 'Cobalt Strike Team Server',
          type: 'https',
          status: 'active',
          endpoints: ['https://cdn-updates.com/api', 'https://secure-patch.net/health'],
          agents: 12,
          lastBeacon: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          stealthLevel: 'high',
          encryption: true,
          malleable: true
        },
        {
          id: 'c2-2',
          name: 'Sliver C2',
          type: 'tcp',
          status: 'active',
          endpoints: ['tcp://192.168.1.100:8080'],
          agents: 5,
          lastBeacon: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          stealthLevel: 'medium',
          encryption: true,
          malleable: false
        },
        {
          id: 'c2-3',
          name: 'Empire Framework',
          type: 'http',
          status: 'maintenance',
          endpoints: ['http://system-health.org/status'],
          agents: 0,
          lastBeacon: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          stealthLevel: 'low',
          encryption: false,
          malleable: true
        }
      ]
      setC2Frameworks(sampleC2)
    }

    if (payloads.length === 0) {
      const samplePayloads: Payload[] = [
        {
          id: 'payload-1',
          name: 'Stealth Beacon v2.1',
          type: 'exe',
          platform: 'windows',
          evasionTechniques: ['Process Hollowing', 'AMSI Bypass', 'ETW Patching', 'Reflective DLL Loading'],
          size: 245760,
          detectionRate: 2,
          deployments: 8,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'payload-2',
          name: 'PowerShell Dropper',
          type: 'ps1',
          platform: 'windows',
          evasionTechniques: ['Obfuscation', 'Base64 Encoding', 'PowerShell Logging Bypass'],
          size: 8192,
          detectionRate: 5,
          deployments: 15,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'payload-3',
          name: 'HTA Launcher',
          type: 'hta',
          platform: 'windows',
          evasionTechniques: ['VBScript Obfuscation', 'Download Cradle', 'Living off the Land'],
          size: 4096,
          detectionRate: 8,
          deployments: 6,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
      setPayloads(samplePayloads)
    }

    if (techniques.length === 0) {
      const sampleTechniques: RedTeamTechnique[] = [
        {
          id: 'tech-1',
          mitreId: 'T1055',
          name: 'Process Injection',
          tactic: 'Defense Evasion',
          description: 'Adversaries may inject code into processes in order to evade process-based defenses',
          difficulty: 'intermediate',
          detection: 'medium',
          impact: 'high',
          prerequisites: ['Local access', 'Process privileges'],
          tools: ['Metasploit', 'Cobalt Strike', 'PowerShell Empire'],
          procedures: [
            'Identify target process with appropriate privileges',
            'Allocate memory in target process',
            'Write shellcode to allocated memory',
            'Execute injected code'
          ],
          countermeasures: ['Process monitoring', 'API hooking', 'Behavioral analysis'],
          examples: [
            {
              command: 'Invoke-DllInjection -ProcessId 1234 -Dll payload.dll',
              description: 'PowerShell DLL injection into process ID 1234'
            },
            {
              command: 'python inject.py --pid 5678 --shellcode beacon.bin',
              description: 'Python script for shellcode injection'
            }
          ]
        },
        {
          id: 'tech-2',
          mitreId: 'T1003',
          name: 'OS Credential Dumping',
          tactic: 'Credential Access',
          description: 'Adversaries may attempt to dump credentials to obtain account login information',
          difficulty: 'intermediate',
          detection: 'high',
          impact: 'critical',
          prerequisites: ['Administrative privileges', 'LSASS access'],
          tools: ['Mimikatz', 'ProcDump', 'Impacket', 'LaZagne'],
          procedures: [
            'Obtain administrative privileges',
            'Access LSASS process memory',
            'Extract credential material',
            'Parse and decode credentials'
          ],
          countermeasures: ['LSA Protection', 'Credential Guard', 'Process monitoring'],
          examples: [
            {
              command: 'sekurlsa::logonpasswords',
              description: 'Mimikatz command to dump logon passwords'
            },
            {
              command: 'procdump64.exe -ma lsass.exe lsass.dmp',
              description: 'Create LSASS memory dump for offline analysis'
            }
          ]
        }
      ]
      setTechniques(sampleTechniques)
    }

    // Existing initialization code...
    if (findings.length === 0) {
      const sampleFindings: RedTeamFinding[] = [
        {
          id: 'finding-1',
          campaignId: 'campaign-1',
          title: 'Unpatched SMB Service Vulnerable to EternalBlue',
          severity: 'critical',
          category: 'vulnerability',
          description: 'Multiple Windows systems running unpatched SMB services vulnerable to MS17-010 (EternalBlue)',
          impact: 'Remote code execution with SYSTEM privileges, potential for worm-like propagation across network',
          remediation: 'Apply Microsoft Security Bulletin MS17-010 patches immediately. Disable SMBv1 protocol.',
          evidence: ['nmap-scan-results.txt', 'metasploit-exploit-output.log', 'system-screenshots.png'],
          cvss: 9.3,
          cwe: 'CWE-20',
          mitreAttack: 'T1210',
          discoveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'verified'
        },
        {
          id: 'finding-2',
          campaignId: 'campaign-2',
          title: 'Weak Domain Password Policy Enables Brute Force',
          severity: 'high',
          category: 'misconfiguration',
          description: 'Domain password policy allows passwords as short as 6 characters with no complexity requirements',
          impact: 'Credential compromise through brute force attacks, lateral movement opportunities',
          remediation: 'Implement strong password policy: minimum 12 characters, complexity requirements, account lockout',
          evidence: ['bloodhound-analysis.json', 'password-policy-dump.txt', 'crack-results.txt'],
          cvss: 7.5,
          cwe: 'CWE-521',
          mitreAttack: 'T1110',
          discoveredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'new'
        }
      ]
      setFindings(sampleFindings)
    }

    if (tools.length === 0) {
      const sampleTools: RedTeamTool[] = [
        {
          id: 'tool-1',
          name: 'Cobalt Strike',
          category: 'post-exploitation',
          description: 'Advanced threat emulation and red team operations platform',
          usage: 'Command and control, lateral movement, payload generation',
          commands: [
            'beacon> shell whoami',
            'beacon> powershell-import PowerView.ps1',
            'beacon> mimikatz sekurlsa::logonpasswords'
          ],
          isInstalled: true,
          version: '4.8',
          lastUsed: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'tool-2',
          name: 'BloodHound',
          category: 'reconnaissance',
          description: 'Active Directory attack path analysis and visualization',
          usage: 'Domain enumeration, privilege escalation path discovery, relationship mapping',
          commands: [
            'SharpHound.exe -c All --zipfilename bloodhound.zip',
            'bloodhound-python -d domain.com -u user -p pass -gc dc01',
            'MATCH (u:User {admincount:true}) RETURN u'
          ],
          isInstalled: true,
          version: '4.3.1',
          lastUsed: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'tool-3',
          name: 'Sliver',
          category: 'post-exploitation',
          description: 'Modern cross-platform implant framework',
          usage: 'Command and control, cross-platform implants, OPSEC-focused operations',
          commands: [
            'generate --mtls example.com --save /tmp/implant',
            'sessions -i session-id',
            'execute-shellcode --pid 1234 /path/to/shellcode.bin'
          ],
          isInstalled: true,
          version: '1.5.41'
        }
      ]
      setTools(sampleTools)
    }
  }, [campaigns.length, findings.length, tools.length, c2Frameworks.length, payloads.length, techniques.length, setCampaigns, setFindings, setTools, setC2Frameworks, setPayloads, setTechniques, currentUser.id])

  const getStatusColor = (status: RedTeamCampaign['status']) => {
    switch (status) {
      case 'planning': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'reconnaissance': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'initial-access': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'persistence': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'privilege-escalation': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'lateral-movement': return 'bg-pink-500/20 text-pink-400 border-pink-500/30'
      case 'collection': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
      case 'exfiltration': return 'bg-violet-500/20 text-violet-400 border-violet-500/30'
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'failed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getSeverityColor = (severity: RedTeamFinding['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white'
      case 'high': return 'bg-red-500 text-white'
      case 'medium': return 'bg-yellow-500 text-black'
      case 'low': return 'bg-blue-500 text-white'
      case 'info': return 'bg-gray-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getPhaseIcon = (phase: RedTeamCampaign['phase']) => {
    switch (phase) {
      case 'reconnaissance': return <Eye className="w-4 h-4" />
      case 'weaponization': return <Zap className="w-4 h-4" />
      case 'delivery': return <Target className="w-4 h-4" />
      case 'exploitation': return <Bug className="w-4 h-4" />
      case 'installation': return <Database className="w-4 h-4" />
      case 'command-control': return <Network className="w-4 h-4" />
      case 'actions-objectives': return <Crosshair className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const simulateProgress = async (campaignId: string) => {
    setIsLoading(true)
    setCampaigns(current => 
      current.map(campaign => 
        campaign.id === campaignId 
          ? { ...campaign, progress: Math.min(campaign.progress + 10, 100) }
          : campaign
      )
    )
    
    // Simulate some delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
  }

  const getStealthLevelColor = (level: C2Framework['stealthLevel']) => {
    switch (level) {
      case 'stealth': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'high': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getDifficultyColor = (difficulty: RedTeamTechnique['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'advanced': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'expert': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const createPayload = async (data: { name: string; type: Payload['type']; platform: Payload['platform']; evasionTechniques: string[] }) => {
    setIsLoading(true)
    
    try {
      const newPayload: Payload = {
        id: `payload-${Date.now()}`,
        name: data.name,
        type: data.type,
        platform: data.platform,
        evasionTechniques: data.evasionTechniques,
        size: Math.floor(Math.random() * 500000) + 10000,
        detectionRate: Math.floor(Math.random() * 20),
        deployments: 0,
        createdAt: new Date().toISOString()
      }
      
      setPayloads(current => [...current, newPayload])
      setShowNewPayload(false)
      
      // Simulate payload generation
      await new Promise(resolve => setTimeout(resolve, 3000))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6 relative">
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="w-80 h-80">
            <BinaryRain />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Target className="w-8 h-8 text-accent" />
            Red Team Operations
          </h1>
          <p className="text-muted-foreground mt-1">
            Advanced persistent threat simulation and security assessment platform
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6 glass-card">
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="c2-infrastructure" className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            C2 Infrastructure
          </TabsTrigger>
          <TabsTrigger value="payloads" className="flex items-center gap-2">
            <Skull className="w-4 h-4" />
            Payloads
          </TabsTrigger>
          <TabsTrigger value="techniques" className="flex items-center gap-2">
            <Strategy className="w-4 h-4" />
            Techniques
          </TabsTrigger>
          <TabsTrigger value="findings" className="flex items-center gap-2">
            <Bug className="w-4 h-4" />
            Findings
          </TabsTrigger>
          <TabsTrigger value="arsenal" className="flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            Arsenal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {campaigns.map(campaign => (
              <Card key={campaign.id} className="glass-card hover:bg-card/60 transition-all cursor-pointer" onClick={() => setSelectedCampaign(campaign)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{campaign.target}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    {getPhaseIcon(campaign.phase)}
                    <span className="text-sm font-medium">{campaign.phase.replace('-', ' ')}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{campaign.progress}%</span>
                    </div>
                    <Progress value={campaign.progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Bug className="w-4 h-4 text-muted-foreground" />
                      <span>{campaign.findings} findings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span>{campaign.criticalFindings} critical</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4 text-blue-400" />
                      <span>{campaign.c2Infrastructure.active}/{campaign.c2Infrastructure.total} C2 active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-purple-400" />
                      <span>Stealth: {campaign.stealth.score}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 glass-button hover-red-glow"
                      onClick={(e) => {
                        e.stopPropagation()
                        simulateProgress(campaign.id)
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="c2-infrastructure" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Command & Control Infrastructure</h3>
              <p className="text-sm text-muted-foreground">Manage C2 frameworks and monitor agent activity</p>
            </div>
            <Button className="glass-button hover-red-glow">
              <Plus className="w-4 h-4 mr-2" />
              Deploy C2
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {c2Frameworks.map(c2 => (
              <Card key={c2.id} className="glass-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{c2.name}</CardTitle>
                    <Badge className={getStatusColor(c2.status as any)}>
                      {c2.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{c2.type.toUpperCase()}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Robot className="w-4 h-4 text-muted-foreground" />
                      <span>{c2.agents} agents</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{new Date(c2.lastBeacon).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Stealth Level</span>
                      <Badge className={getStealthLevelColor(c2.stealthLevel)}>
                        {c2.stealthLevel}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className={`p-2 rounded text-center ${c2.encryption ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {c2.encryption ? 'Encrypted' : 'Plain Text'}
                      </div>
                      <div className={`p-2 rounded text-center ${c2.malleable ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {c2.malleable ? 'Malleable' : 'Static'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">Endpoints:</span>
                    {c2.endpoints.slice(0, 2).map((endpoint, index) => (
                      <code key={index} className="block text-xs bg-muted p-2 rounded font-mono truncate">
                        {endpoint}
                      </code>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payloads" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Payload Arsenal</h3>
              <p className="text-sm text-muted-foreground">Generate and manage custom payloads with evasion techniques</p>
            </div>
            <Button className="glass-button hover-red-glow" onClick={() => setShowNewPayload(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Generate Payload
            </Button>
          </div>

          {showNewPayload && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Generate New Payload</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Payload Name</label>
                    <Input placeholder="Stealth Beacon v3.0" className="glass-button" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select>
                      <SelectTrigger className="glass-button">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exe">Executable (.exe)</SelectItem>
                        <SelectItem value="dll">DLL (.dll)</SelectItem>
                        <SelectItem value="ps1">PowerShell (.ps1)</SelectItem>
                        <SelectItem value="hta">HTA Application (.hta)</SelectItem>
                        <SelectItem value="macro">Office Macro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Platform</label>
                    <Select>
                      <SelectTrigger className="glass-button">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="windows">Windows</SelectItem>
                        <SelectItem value="linux">Linux</SelectItem>
                        <SelectItem value="macos">macOS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Evasion Techniques</label>
                    <Textarea 
                      placeholder="Process Hollowing, AMSI Bypass, ETW Patching..."
                      className="glass-button"
                      rows={2}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="glass-button hover-red-glow">
                    <Lightning className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                  <Button variant="outline" className="glass-button" onClick={() => setShowNewPayload(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {payloads.map(payload => (
              <Card key={payload.id} className="glass-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{payload.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {payload.type.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground capitalize">{payload.platform}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-muted-foreground" />
                      <span>{(payload.size / 1024).toFixed(1)} KB</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <span>{payload.detectionRate}% detection</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">Evasion Techniques:</span>
                    <div className="flex flex-wrap gap-1">
                      {payload.evasionTechniques.slice(0, 3).map((technique, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {technique}
                        </Badge>
                      ))}
                      {payload.evasionTechniques.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{payload.evasionTechniques.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Deployments:</span>
                    <span className="font-medium">{payload.deployments}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 glass-button">
                      <Play className="w-3 h-3 mr-1" />
                      Deploy
                    </Button>
                    <Button size="sm" variant="outline" className="glass-button">
                      <Code className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="techniques" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">MITRE ATT&CK Techniques</h3>
              <p className="text-sm text-muted-foreground">Browse and execute adversarial techniques</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {techniques.map(technique => (
                <Card 
                  key={technique.id} 
                  className={`glass-card cursor-pointer transition-all ${
                    selectedTechnique?.id === technique.id ? 'border-accent bg-accent/5' : 'hover:bg-card/60'
                  }`}
                  onClick={() => setSelectedTechnique(technique)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{technique.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {technique.mitreId}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{technique.tactic}</p>
                      </div>
                      <Badge className={getDifficultyColor(technique.difficulty)}>
                        {technique.difficulty}
                      </Badge>
                    </div>
                    
                    <p className="text-sm mb-3">{technique.description}</p>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-muted/30 rounded">
                        <div className="font-medium capitalize">{technique.detection}</div>
                        <div className="text-muted-foreground">Detection</div>
                      </div>
                      <div className="text-center p-2 bg-muted/30 rounded">
                        <div className="font-medium capitalize">{technique.impact}</div>
                        <div className="text-muted-foreground">Impact</div>
                      </div>
                      <div className="text-center p-2 bg-muted/30 rounded">
                        <div className="font-medium">{technique.tools.length}</div>
                        <div className="text-muted-foreground">Tools</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              {selectedTechnique ? (
                <Card className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-accent" />
                        {selectedTechnique.name}
                      </CardTitle>
                      <Badge variant="outline">{selectedTechnique.mitreId}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h5 className="font-medium mb-2">Prerequisites:</h5>
                      <ul className="text-sm space-y-1">
                        {selectedTechnique.prerequisites.map((prereq, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            {prereq}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Procedures:</h5>
                      <ol className="text-sm space-y-1">
                        {selectedTechnique.procedures.map((procedure, index) => (
                          <li key={index} className="flex gap-2">
                            <span className="text-accent font-medium">{index + 1}.</span>
                            {procedure}
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Example Commands:</h5>
                      <div className="space-y-2">
                        {selectedTechnique.examples.map((example, index) => (
                          <div key={index}>
                            <code className="block text-xs bg-muted p-2 rounded font-mono mb-1">
                              {example.command}
                            </code>
                            <p className="text-xs text-muted-foreground">{example.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Countermeasures:</h5>
                      <ul className="text-sm space-y-1">
                        {selectedTechnique.countermeasures.map((countermeasure, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Shield className="w-3 h-3 text-blue-400" />
                            {countermeasure}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button className="w-full glass-button hover-red-glow">
                      <Sword className="w-4 h-4 mr-2" />
                      Execute Technique
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="glass-card">
                  <CardContent className="p-8 text-center">
                    <Strategy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Select a Technique</p>
                    <p className="text-sm text-muted-foreground">
                      Choose a MITRE ATT&CK technique to view detailed information and execution procedures
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="findings" className="space-y-6">
          <div className="space-y-4">
            {findings.map(finding => (
              <Card key={finding.id} className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{finding.title}</h3>
                        <Badge className={getSeverityColor(finding.severity)}>
                          {finding.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          CVSS {finding.cvss}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{finding.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">Impact:</span>
                          <p className="mt-1">{finding.impact}</p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Remediation:</span>
                          <p className="mt-1">{finding.remediation}</p>
                        </div>
                      </div>

                      {finding.mitreAttack && (
                        <div className="mt-3">
                          <Badge variant="outline" className="text-xs">
                            MITRE ATT&CK: {finding.mitreAttack}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {finding.status === 'new' ? (
                        <XCircle className="w-5 h-5 text-red-400" />
                      ) : finding.status === 'verified' ? (
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="arsenal" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map(tool => (
              <Card key={tool.id} className="glass-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                    <Badge variant={tool.isInstalled ? 'default' : 'outline'}>
                      {tool.isInstalled ? 'Installed' : 'Available'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm">
                    <span className="font-medium text-muted-foreground">Category:</span>
                    <span className="ml-2 capitalize">{tool.category.replace('-', ' ')}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium text-muted-foreground">Usage:</span>
                    <p className="mt-1">{tool.usage}</p>
                  </div>

                  {tool.version && (
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground">Version:</span>
                      <span className="ml-2">{tool.version}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">Common Commands:</span>
                    {tool.commands.slice(0, 2).map((command, index) => (
                      <code key={index} className="block text-xs bg-muted p-2 rounded font-mono">
                        {command}
                      </code>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}