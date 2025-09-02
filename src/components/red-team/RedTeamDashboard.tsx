import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
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
  SkipForward
} from '@phosphor-icons/react'
import type { User } from '@/types/user'

interface RedTeamCampaign {
  id: string
  name: string
  target: string
  status: 'planning' | 'reconnaissance' | 'initial-access' | 'persistence' | 'privilege-escalation' | 'defense-evasion' | 'credential-access' | 'discovery' | 'lateral-movement' | 'collection' | 'exfiltration' | 'impact' | 'completed' | 'failed'
  type: 'phishing' | 'web-app' | 'network' | 'physical' | 'social-engineering' | 'mobile' | 'iot' | 'cloud'
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
  const [campaigns, setCampaigns] = useKV<RedTeamCampaign[]>('redteam-campaigns', [])
  const [findings, setFindings] = useKV<RedTeamFinding[]>('redteam-findings', [])
  const [tools, setTools] = useKV<RedTeamTool[]>('redteam-tools', [])
  const [activeTab, setActiveTab] = useState('campaigns')
  const [selectedCampaign, setSelectedCampaign] = useState<RedTeamCampaign | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize sample data
  useEffect(() => {
    if (campaigns.length === 0) {
      const sampleCampaigns: RedTeamCampaign[] = [
        {
          id: 'campaign-1',
          name: 'Operation Shadow Strike',
          target: 'Corporate Network Infrastructure',
          status: 'lateral-movement',
          type: 'network',
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
          tools: ['Nmap', 'Metasploit', 'Cobalt Strike', 'BloodHound', 'Mimikatz'],
          techniques: ['T1190', 'T1078', 'T1055', 'T1003', 'T1021'],
          mitreTactics: ['Initial Access', 'Persistence', 'Privilege Escalation', 'Lateral Movement', 'Collection']
        },
        {
          id: 'campaign-2',
          name: 'Web App Penetration Test',
          target: 'E-commerce Platform',
          status: 'discovery',
          type: 'web-app',
          phase: 'reconnaissance',
          progress: 25,
          findings: 5,
          criticalFindings: 1,
          teamMembers: [currentUser.id, 'user-4'],
          startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedCompletion: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          objectives: [
            'Identify OWASP Top 10 vulnerabilities',
            'Test authentication and authorization',
            'Assess input validation controls',
            'Check for business logic flaws'
          ],
          scope: ['https://shop.target.com', 'https://api.target.com'],
          rules: [
            'Use test accounts only',
            'No real transactions',
            'Report findings immediately'
          ],
          tools: ['Burp Suite', 'OWASP ZAP', 'SQLMap', 'Nikto', 'Gobuster'],
          techniques: ['T1190', 'T1110', 'T1059'],
          mitreTactics: ['Initial Access', 'Execution', 'Discovery']
        }
      ]
      setCampaigns(sampleCampaigns)
    }

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
          title: 'SQL Injection in Product Search',
          severity: 'high',
          category: 'vulnerability',
          description: 'Union-based SQL injection vulnerability in product search functionality allows database enumeration',
          impact: 'Unauthorized access to customer data, potential for data exfiltration and privilege escalation',
          remediation: 'Implement parameterized queries and input validation. Conduct code review.',
          evidence: ['burp-request-response.txt', 'sqlmap-output.log', 'database-dump.sql'],
          cvss: 8.1,
          cwe: 'CWE-89',
          owasp: 'A03:2021',
          discoveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'new'
        }
      ]
      setFindings(sampleFindings)
    }

    if (tools.length === 0) {
      const sampleTools: RedTeamTool[] = [
        {
          id: 'tool-1',
          name: 'Nmap',
          category: 'reconnaissance',
          description: 'Network discovery and security auditing tool',
          usage: 'Port scanning, service detection, OS fingerprinting',
          commands: [
            'nmap -sS -sV -O target',
            'nmap --script vuln target',
            'nmap -sU --top-ports 1000 target'
          ],
          isInstalled: true,
          version: '7.94',
          lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'tool-2',
          name: 'Metasploit',
          category: 'exploitation',
          description: 'Penetration testing framework',
          usage: 'Exploit development and execution, payload generation',
          commands: [
            'msfconsole',
            'use exploit/windows/smb/ms17_010_eternalblue',
            'set RHOSTS target && exploit'
          ],
          isInstalled: true,
          version: '6.3.31',
          lastUsed: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'tool-3',
          name: 'BloodHound',
          category: 'reconnaissance',
          description: 'Active Directory attack path analysis',
          usage: 'Domain enumeration, privilege escalation path discovery',
          commands: [
            'SharpHound.exe -c All',
            'bloodhound-python -d domain.com -u user -p pass -gc dc01',
            'neo4j console'
          ],
          isInstalled: true,
          version: '4.3.1'
        }
      ]
      setTools(sampleTools)
    }
  }, [campaigns.length, findings.length, tools.length, setCampaigns, setFindings, setTools, currentUser.id])

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
        <TabsList className="grid w-full grid-cols-4 glass-card">
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="findings" className="flex items-center gap-2">
            <Bug className="w-4 h-4" />
            Findings
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            Arsenal
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Metrics
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

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Bug className="w-4 h-4 text-muted-foreground" />
                      <span>{campaign.findings} findings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span>{campaign.criticalFindings} critical</span>
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

        <TabsContent value="tools" className="space-y-6">
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

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold">{campaigns.length}</p>
                    <p className="text-sm text-muted-foreground">Active Campaigns</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Bug className="w-8 h-8 text-yellow-400" />
                  <div>
                    <p className="text-2xl font-bold">{findings.length}</p>
                    <p className="text-sm text-muted-foreground">Total Findings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                  <div>
                    <p className="text-2xl font-bold">
                      {findings.filter(f => f.severity === 'critical').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Critical Issues</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Terminal className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold">{tools.filter(t => t.isInstalled).length}</p>
                    <p className="text-sm text-muted-foreground">Tools Ready</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}