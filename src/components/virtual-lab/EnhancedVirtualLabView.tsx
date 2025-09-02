import { useState, useEffect } from 'react'
import { Plus, Play, Stop, Trash, Settings, Terminal, Network, Shield, DesktopTower, Code, Database, Eye, Target, Users, Clock, HardDrives, Cpu, Activity, Binoculars } from '@phosphor-icons/react'
import { useVirtualLab } from '@/hooks/useVirtualLab'
import { useKV } from '@github/spark/hooks'
import type { User } from '@/types/user'
import type { VM } from '@/types/virtual-lab'
import { CreateVMForm } from '@/components/virtual-lab/CreateVMForm'
import { VMConsole } from '@/components/virtual-lab/VMConsole'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { BinaryRain } from '@/components/ui/loading-animations'

interface VMTemplate {
  id: string
  name: string
  description: string
  distro: 'kali' | 'arch' | 'ubuntu' | 'centos' | 'windows-10' | 'windows-server'
  category: 'penetration-testing' | 'malware-analysis' | 'forensics' | 'red-team' | 'blue-team' | 'research' | 'reconnaissance'
  preInstalledTools: string[]
  resources: {
    cpu: number
    memory: number
    storage: number
  }
  networkConfig: 'isolated' | 'nat' | 'bridged' | 'custom'
  isSecure: boolean
}

interface NetworkTopology {
  id: string
  name: string
  description: string
  vms: string[]
  subnets: {
    name: string
    cidr: string
    purpose: string
  }[]
  rules: {
    source: string
    destination: string
    ports: string
    protocol: string
    action: 'allow' | 'deny'
  }[]
}

interface Props {
  currentUser: User
}

export function EnhancedVirtualLabView({ currentUser }: Props) {
  const { vms, provision, start, stop, destroy } = useVirtualLab(currentUser.id)
  const [templates, setTemplates] = useKV<VMTemplate[]>('vm-templates', [])
  const [topologies, setTopologies] = useKV<NetworkTopology[]>('network-topologies', [])
  const [showCreate, setShowCreate] = useState(vms.length === 0)
  const [selected, setSelected] = useState<VM | null>(vms[0] ?? null)
  const [activeTab, setActiveTab] = useState('lab')
  const [isProvisioning, setIsProvisioning] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<VMTemplate | null>(null)

  // Initialize templates
  useEffect(() => {
    if (templates.length === 0) {
      const sampleTemplates: VMTemplate[] = [
        {
          id: 'template-1',
          name: 'Kali Linux - Red Team Elite',
          description: 'Ultimate red team platform with advanced C2 frameworks and custom toolsets',
          distro: 'kali',
          category: 'red-team',
          preInstalledTools: [
            'Cobalt Strike',
            'Sliver C2 Framework',
            'Havoc Framework', 
            'Covenant C2',
            'Empire Framework',
            'BloodHound CE',
            'Mimikatz',
            'Rubeus',
            'SharpHound',
            'PowerView',
            'Impacket Suite',
            'CrackMapExec',
            'Responder',
            'Chisel Tunneling',
            'Ligolo Proxy',
            'Custom Payload Generators',
            'OPSEC Tools Suite',
            'Advanced Persistence Modules'
          ],
          resources: { cpu: 6, memory: 16384, storage: 120 },
          networkConfig: 'nat',
          isSecure: true
        },
        {
          id: 'template-2',
          name: 'Windows Domain Controller - Target',
          description: 'Vulnerable Windows Server 2019 DC with realistic enterprise misconfigurations',
          distro: 'windows-server',
          category: 'penetration-testing',
          preInstalledTools: [
            'Active Directory Domain Services',
            'DNS Server',
            'DHCP Server',
            'File Share Services',
            'Intentional Misconfigurations',
            'Weak GPO Settings',
            'Legacy Protocols Enabled',
            'Vulnerable Service Accounts',
            'Unpatched Components',
            'Simulation Monitoring Tools'
          ],
          resources: { cpu: 4, memory: 8192, storage: 80 },
          networkConfig: 'isolated',
          isSecure: false
        },
        {
          id: 'template-3',
          name: 'Windows 11 - Corporate Workstation',
          description: 'Enterprise Windows 11 workstation with common business applications',
          distro: 'windows-10',
          category: 'penetration-testing',
          preInstalledTools: [
            'Microsoft Office Suite',
            'Adobe Creative Suite',
            'Chrome Browser',
            'Teams Application',
            'Outlook Client',
            'Corporate VPN Client',
            'Weak Endpoint Protection',
            'Scheduled Tasks',
            'Local Admin Accounts',
            'Cached Credentials'
          ],
          resources: { cpu: 4, memory: 8192, storage: 100 },
          networkConfig: 'nat',
          isSecure: false
        },
        {
          id: 'template-4',
          name: 'Ubuntu Server - Web Application Target',
          description: 'Vulnerable LAMP stack with intentional web application vulnerabilities',
          distro: 'ubuntu',
          category: 'penetration-testing',
          preInstalledTools: [
            'Apache Web Server',
            'MySQL Database',
            'PHP Runtime',
            'Vulnerable Web Apps (DVWA, WebGoat)',
            'Weak Database Configurations',
            'Exposed Admin Panels',
            'OWASP Top 10 Vulnerabilities',
            'File Upload Vulnerabilities',
            'SQL Injection Points',
            'XSS Vulnerabilities'
          ],
          resources: { cpu: 2, memory: 4096, storage: 60 },
          networkConfig: 'nat',
          isSecure: false
        },
        {
          id: 'template-5',
          name: 'Parrot Security - OSINT Specialist',
          description: 'Specialized distribution for open source intelligence gathering',
          distro: 'kali',
          category: 'reconnaissance',
          preInstalledTools: [
            'Maltego',
            'theHarvester',
            'Recon-ng',
            'SpiderFoot',
            'Shodan Tools',
            'Google Dorking Scripts',
            'Social Media Intelligence',
            'DNS Enumeration Tools',
            'Subdomain Discovery',
            'Email Harvesting',
            'Image Metadata Analysis',
            'Geolocation Tools'
          ],
          resources: { cpu: 4, memory: 8192, storage: 100 },
          networkConfig: 'nat',
          isSecure: true
        },
        {
          id: 'template-6',
          name: 'RedTeam Infrastructure - C2 Server',
          description: 'Dedicated C2 infrastructure server with multiple frameworks',
          distro: 'ubuntu',
          category: 'red-team',
          preInstalledTools: [
            'Cobalt Strike Team Server',
            'Metasploit Framework',
            'Empire C2 Server',
            'Sliver Server',
            'Mythic C2 Framework',
            'Apache Redirectors',
            'Domain Fronting Setup',
            'SSL Certificate Management',
            'Traffic Obfuscation',
            'Payload Hosting',
            'Custom Malleable Profiles',
            'OPSEC Monitoring'
          ],
          resources: { cpu: 8, memory: 32768, storage: 200 },
          networkConfig: 'bridged',
          isSecure: true
        }
      ]
      setTemplates(sampleTemplates)
    }

    if (topologies.length === 0) {
      const sampleTopologies: NetworkTopology[] = [
        {
          id: 'topology-1',
          name: 'Advanced Persistent Threat Simulation',
          description: 'Complex enterprise network for full-scale APT simulation exercises',
          vms: [],
          subnets: [
            { name: 'Internet-DMZ', cidr: '203.0.113.0/24', purpose: 'External-facing services and web servers' },
            { name: 'Corporate-DMZ', cidr: '192.168.100.0/24', purpose: 'Email servers and external access' },
            { name: 'Workstation-VLAN', cidr: '10.1.0.0/16', purpose: 'Employee workstations and laptops' },
            { name: 'Server-VLAN', cidr: '10.2.0.0/16', purpose: 'Internal application and database servers' },
            { name: 'Admin-VLAN', cidr: '10.3.0.0/24', purpose: 'IT administration and domain controllers' },
            { name: 'C2-Infrastructure', cidr: '172.16.0.0/24', purpose: 'Red team command and control servers' }
          ],
          rules: [
            { source: 'Internet-DMZ', destination: 'Corporate-DMZ', ports: '80,443,25', protocol: 'TCP', action: 'allow' },
            { source: 'Corporate-DMZ', destination: 'Admin-VLAN', ports: '389,636,88', protocol: 'TCP', action: 'allow' },
            { source: 'Workstation-VLAN', destination: 'Server-VLAN', ports: '1433,3306,5432', protocol: 'TCP', action: 'allow' },
            { source: 'Admin-VLAN', destination: '*', ports: '*', protocol: '*', action: 'allow' },
            { source: 'C2-Infrastructure', destination: 'Workstation-VLAN', ports: '80,443,53', protocol: 'TCP', action: 'allow' }
          ]
        },
        {
          id: 'topology-2',
          name: 'Red Team Training Range',
          description: 'Isolated training environment for red team skill development',
          vms: [],
          subnets: [
            { name: 'Attacker-Network', cidr: '192.168.1.0/24', purpose: 'Red team operator workstations' },
            { name: 'Target-Network', cidr: '192.168.2.0/24', purpose: 'Vulnerable target systems' },
            { name: 'C2-Network', cidr: '192.168.3.0/24', purpose: 'Command and control infrastructure' },
            { name: 'Monitoring-Network', cidr: '192.168.4.0/24', purpose: 'Exercise monitoring and logging' }
          ],
          rules: [
            { source: 'Attacker-Network', destination: 'Target-Network', ports: '*', protocol: '*', action: 'allow' },
            { source: 'C2-Network', destination: 'Target-Network', ports: '80,443,53,8080', protocol: 'TCP', action: 'allow' },
            { source: 'Monitoring-Network', destination: '*', ports: '514,161,6514', protocol: 'UDP', action: 'allow' },
            { source: 'Target-Network', destination: 'Attacker-Network', ports: '*', protocol: '*', action: 'deny' }
          ]
        },
        {
          id: 'topology-3',
          name: 'Purple Team Collaborative Lab',
          description: 'Integrated red and blue team exercise environment',
          vms: [],
          subnets: [
            { name: 'Red-Team-Ops', cidr: '10.100.1.0/24', purpose: 'Red team attack infrastructure' },
            { name: 'Blue-Team-SOC', cidr: '10.100.2.0/24', purpose: 'Blue team monitoring and analysis' },
            { name: 'Corporate-Sim', cidr: '10.100.10.0/24', purpose: 'Simulated corporate environment' },
            { name: 'Shared-Range', cidr: '10.100.99.0/24', purpose: 'Shared exercise coordination' }
          ],
          rules: [
            { source: 'Red-Team-Ops', destination: 'Corporate-Sim', ports: '*', protocol: '*', action: 'allow' },
            { source: 'Blue-Team-SOC', destination: 'Corporate-Sim', ports: '514,161,162', protocol: 'UDP', action: 'allow' },
            { source: 'Shared-Range', destination: '*', ports: '22,3389,5985', protocol: 'TCP', action: 'allow' },
            { source: '*', destination: 'Blue-Team-SOC', ports: '9200,5601', protocol: 'TCP', action: 'allow' }
          ]
        }
      ]
      setTopologies(sampleTopologies)
    }
  }, [templates.length, topologies.length, setTemplates, setTopologies])

  async function handleCreateFromTemplate(template: VMTemplate, customConfig?: { name: string; notes?: string }) {
    setIsProvisioning(true)
    
    try {
      const vmData = {
        name: customConfig?.name || `${template.name} Instance`,
        distro: template.distro,
        notes: customConfig?.notes || `Created from ${template.name} template. Pre-installed tools: ${template.preInstalledTools.join(', ')}`,
        templateId: template.id,
        resources: template.resources
      }
      
      const vm = provision(vmData)
      setShowCreate(false)
      setSelected(vm)
      
      // Simulate template-specific provisioning
      await new Promise(resolve => setTimeout(resolve, 3000))
    } finally {
      setIsProvisioning(false)
    }
  }

  function handleCreate(data: { name: string; distro: 'kali' | 'arch' | 'ubuntu' | 'centos' | 'windows-10' | 'windows-server'; notes?: string }) {
    const vm = provision(data)
    setShowCreate(false)
    setSelected(vm)
  }

  const getStatusColor = (status: VM['status']) => {
    switch (status) {
      case 'running': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'stopped': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'starting': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'stopping': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getCategoryIcon = (category: VMTemplate['category']) => {
    switch (category) {
      case 'red-team': return <Target className="w-5 h-5 text-red-400" />
      case 'blue-team': return <Shield className="w-5 h-5 text-blue-400" />
      case 'penetration-testing': return <Eye className="w-5 h-5 text-purple-400" />
      case 'malware-analysis': return <Code className="w-5 h-5 text-orange-400" />
      case 'forensics': return <Database className="w-5 h-5 text-green-400" />
      case 'research': return <Activity className="w-5 h-5 text-indigo-400" />
      case 'reconnaissance': return <Binoculars className="w-5 h-5 text-yellow-400" />
      default: return <DesktopTower className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <div className="p-6 space-y-6 relative">
      {isProvisioning && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-80 h-80">
              <BinaryRain />
            </div>
            <div className="text-lg font-semibold">Provisioning Virtual Machine...</div>
            <div className="text-sm text-muted-foreground">Configuring tools and security settings</div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <DesktopTower className="w-8 h-8 text-accent" />
            Enhanced Virtual Lab
          </h2>
          <p className="text-muted-foreground mt-1">
            Advanced VM provisioning with red team templates and network topologies
          </p>
        </div>
        <Button 
          className="glass-button hover-red-glow flex items-center gap-2" 
          onClick={() => setShowCreate(v => !v)}
        >
          <Plus className="w-4 h-4" />
          New VM
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 glass-card">
          <TabsTrigger value="lab" className="flex items-center gap-2">
            <DesktopTower className="w-4 h-4" />
            Lab
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="topology" className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            Network
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Monitoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lab" className="space-y-6">
          {showCreate && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Create New Virtual Machine</CardTitle>
              </CardHeader>
              <CardContent>
                <CreateVMForm onCreate={handleCreate} />
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DesktopTower className="w-5 h-5" />
                  My Virtual Machines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {vms.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No VMs yet. Create one to get started.</p>
                ) : (
                  <div className="space-y-2">
                    {vms.map(vm => (
                      <div 
                        key={vm.id} 
                        className={`p-3 rounded-lg border border-border hover-red-glow cursor-pointer transition-all ${
                          selected?.id === vm.id ? 'bg-accent/10 border-accent' : ''
                        }`} 
                        onClick={() => setSelected(vm)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">{vm.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {vm.distro.toUpperCase()}
                            </div>
                          </div>
                          <Badge className={getStatusColor(vm.status)}>
                            {vm.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {vm.status !== 'running' ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="flex-1 glass-button" 
                              onClick={(e) => { e.stopPropagation(); start(vm.id) }}
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Start
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="flex-1 glass-button" 
                              onClick={(e) => { e.stopPropagation(); stop(vm.id) }}
                            >
                              <Stop className="w-3 h-3 mr-1" />
                              Stop
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="destructive"
                            className="glass-button" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              destroy(vm.id); 
                              if (selected?.id === vm.id) setSelected(null) 
                            }}
                          >
                            <Trash className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-4">
              {!selected ? (
                <Card className="glass-card">
                  <CardContent className="p-8 text-center">
                    <DesktopTower className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">No VM Selected</p>
                    <p className="text-sm text-muted-foreground">
                      Select a virtual machine from the list to view details and access the console
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card className="glass-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <DesktopTower className="w-5 h-5" />
                            {selected.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Status: {selected.status} • Distro: {selected.distro.toUpperCase()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {selected.status !== 'running' ? (
                            <Button 
                              className="glass-button hover-red-glow"
                              onClick={() => start(selected.id)}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Start VM
                            </Button>
                          ) : (
                            <Button 
                              variant="outline"
                              className="glass-button"
                              onClick={() => stop(selected.id)}
                            >
                              <Stop className="w-4 h-4 mr-2" />
                              Stop VM
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-muted-foreground" />
                          <span>4 vCPUs</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <HardDrives className="w-4 h-4 text-muted-foreground" />
                          <span>8 GB RAM</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-muted-foreground" />
                          <span>80 GB Storage</span>
                        </div>
                      </div>
                      
                      {selected.notes && (
                        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                          <span className="text-sm font-medium text-muted-foreground">Notes:</span>
                          <p className="text-sm mt-1">{selected.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <VMConsole vm={selected} />
                </>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map(template => (
              <Card key={template.id} className="glass-card hover:bg-card/60 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(template.category)}
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                    <Badge 
                      variant={template.isSecure ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {template.isSecure ? 'Secure' : 'Vulnerable'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <div className="font-medium">{template.resources.cpu}</div>
                      <div className="text-muted-foreground">CPU</div>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <div className="font-medium">{template.resources.memory}MB</div>
                      <div className="text-muted-foreground">RAM</div>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <div className="font-medium">{template.resources.storage}GB</div>
                      <div className="text-muted-foreground">Storage</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Pre-installed Tools:</span>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.preInstalledTools.slice(0, 4).map((tool, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                      {template.preInstalledTools.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.preInstalledTools.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button 
                    className="w-full glass-button hover-red-glow"
                    onClick={() => handleCreateFromTemplate(template)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Deploy Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="topology" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5" />
                Network Topologies
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topologies.map(topology => (
                <div key={topology.id} className="space-y-4 p-4 border border-border rounded-lg">
                  <div>
                    <h3 className="text-lg font-semibold">{topology.name}</h3>
                    <p className="text-sm text-muted-foreground">{topology.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Subnets:</span>
                      <div className="space-y-2 mt-2">
                        {topology.subnets.map((subnet, index) => (
                          <div key={index} className="p-2 bg-muted/30 rounded text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium">{subnet.name}</span>
                              <code className="text-xs">{subnet.cidr}</code>
                            </div>
                            <p className="text-xs text-muted-foreground">{subnet.purpose}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Firewall Rules:</span>
                      <div className="space-y-2 mt-2">
                        {topology.rules.map((rule, index) => (
                          <div key={index} className="p-2 bg-muted/30 rounded text-xs font-mono">
                            {rule.source} → {rule.destination} : {rule.ports} ({rule.protocol}) - {rule.action}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <DesktopTower className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold">{vms.length}</p>
                    <p className="text-sm text-muted-foreground">Active VMs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Activity className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold">
                      {vms.filter(vm => vm.status === 'running').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Running</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Code className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-2xl font-bold">{templates.length}</p>
                    <p className="text-sm text-muted-foreground">Templates</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Network className="w-8 h-8 text-orange-400" />
                  <div>
                    <p className="text-2xl font-bold">{topologies.length}</p>
                    <p className="text-sm text-muted-foreground">Topologies</p>
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