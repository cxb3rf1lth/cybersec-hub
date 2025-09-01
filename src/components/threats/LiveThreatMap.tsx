import { useState, useEffect, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Globe, Activity, Shield, Target, Filter, AlertTriangle, TrendingUp, MapPin } from '@phosphor-icons/react'

interface ThreatAlert {
  id: string
  type: 'malware' | 'phishing' | 'ddos' | 'apt' | 'vulnerability' | 'breach'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  location: {
    country: string
    lat: number
    lng: number
  }
  source: string
  timestamp: string
  affected: number
  iocs: string[]
  tags: string[]
}

interface CountryStats {
  country: string
  code: string
  threats: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  lat: number
  lng: number
}

export function LiveThreatMap() {
  const [threats, setThreats] = useKV<ThreatAlert[]>('live-threats', [])
  const [selectedThreat, setSelectedThreat] = useState<ThreatAlert | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [autoUpdate, setAutoUpdate] = useState(true)

  // Generate realistic threat data
  useEffect(() => {
    const generateThreat = (): ThreatAlert => {
      const types: ThreatAlert['type'][] = ['malware', 'phishing', 'ddos', 'apt', 'vulnerability', 'breach']
      const severities: ThreatAlert['severity'][] = ['low', 'medium', 'high', 'critical']
      const countries = [
        { name: 'United States', lat: 39.8283, lng: -98.5795 },
        { name: 'China', lat: 35.8617, lng: 104.1954 },
        { name: 'Russia', lat: 61.5240, lng: 105.3188 },
        { name: 'Germany', lat: 51.1657, lng: 10.4515 },
        { name: 'United Kingdom', lat: 55.3781, lng: -3.4360 },
        { name: 'Japan', lat: 36.2048, lng: 138.2529 },
        { name: 'South Korea', lat: 35.9078, lng: 127.7669 },
        { name: 'India', lat: 20.5937, lng: 78.9629 },
        { name: 'Brazil', lat: -14.2350, lng: -51.9253 },
        { name: 'Australia', lat: -25.2744, lng: 133.7751 }
      ]
      
      const type = types[Math.floor(Math.random() * types.length)]
      const severity = severities[Math.floor(Math.random() * severities.length)]
      const location = countries[Math.floor(Math.random() * countries.length)]
      
      const threatTemplates = {
        malware: [
          'New Banking Trojan Variant Detected',
          'Ransomware Campaign Targeting Healthcare',
          'Cryptocurrency Miner Spreading via Email',
          'Advanced Persistent Threat Group Activity'
        ],
        phishing: [
          'Large-Scale Phishing Campaign Detected',
          'CEO Fraud Attempts Increasing',
          'COVID-19 Themed Phishing Emails',
          'Credential Harvesting Campaign Active'
        ],
        ddos: [
          'Massive DDoS Attack in Progress',
          'IoT Botnet Launching Attacks',
          'DNS Amplification Attack Detected',
          'Gaming Platform Under Attack'
        ],
        apt: [
          'State-Sponsored Group Activity',
          'Zero-Day Exploit in the Wild',
          'Supply Chain Attack Detected',
          'Critical Infrastructure Targeted'
        ],
        vulnerability: [
          'Critical RCE Vulnerability Disclosed',
          'Zero-Day Exploitation Detected',
          'Widespread Software Flaw Found',
          'IoT Device Vulnerability Active'
        ],
        breach: [
          'Data Breach Affects Millions',
          'Customer Database Compromised',
          'Financial Records Exposed',
          'Healthcare System Breached'
        ]
      }

      const title = threatTemplates[type][Math.floor(Math.random() * threatTemplates[type].length)]
      
      return {
        id: `threat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        severity,
        title,
        description: `Active ${type} threat detected in ${location.name}. Monitoring systems have identified suspicious activity requiring immediate attention.`,
        location: {
          country: location.name,
          lat: location.lat + (Math.random() - 0.5) * 10,
          lng: location.lng + (Math.random() - 0.5) * 10
        },
        source: ['Shodan', 'VirusTotal', 'ThreatFox', 'URLhaus', 'Emerging Threats', 'MISP'][Math.floor(Math.random() * 6)],
        timestamp: new Date().toISOString(),
        affected: Math.floor(Math.random() * 10000) + 100,
        iocs: [
          `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          `${Math.random().toString(36).substr(2, 8)}.${['com', 'net', 'org', 'ru', 'cn'][Math.floor(Math.random() * 5)]}`,
          Math.random().toString(36).substr(2, 32)
        ],
        tags: type === 'apt' ? ['apt', 'advanced', 'targeted'] : 
              type === 'malware' ? ['malware', 'trojan', 'banking'] :
              type === 'phishing' ? ['phishing', 'social-engineering', 'credentials'] :
              [type, 'active', 'monitoring']
      }
    }

    // Initialize with some threats
    if (threats.length === 0) {
      const initialThreats = Array.from({ length: 15 }, () => generateThreat())
      setThreats(initialThreats)
    }

    // Auto-generate new threats
    if (autoUpdate) {
      const interval = setInterval(() => {
        setThreats(current => {
          const newThreat = generateThreat()
          // Keep only last 50 threats
          const updated = [newThreat, ...current].slice(0, 50)
          return updated
        })
      }, 8000) // New threat every 8 seconds

      return () => clearInterval(interval)
    }
  }, [threats.length, autoUpdate, setThreats])

  const filteredThreats = useMemo(() => {
    return threats.filter(threat => {
      if (filterType !== 'all' && threat.type !== filterType) return false
      if (filterSeverity !== 'all' && threat.severity !== filterSeverity) return false
      return true
    })
  }, [threats, filterType, filterSeverity])

  const countryStats = useMemo(() => {
    const stats = new Map<string, CountryStats>()
    
    filteredThreats.forEach(threat => {
      const country = threat.location.country
      if (!stats.has(country)) {
        stats.set(country, {
          country,
          code: country.substring(0, 2).toUpperCase(),
          threats: 0,
          severity: 'low',
          lat: threat.location.lat,
          lng: threat.location.lng
        })
      }
      
      const stat = stats.get(country)!
      stat.threats++
      
      // Update severity to highest found
      const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 }
      if (severityOrder[threat.severity] > severityOrder[stat.severity]) {
        stat.severity = threat.severity
      }
    })
    
    return Array.from(stats.values()).sort((a, b) => b.threats - a.threats)
  }, [filteredThreats])

  const getSeverityColor = (severity: ThreatAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white'
      case 'high': return 'bg-red-500 text-white'
      case 'medium': return 'bg-yellow-500 text-black'
      case 'low': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getTypeIcon = (type: ThreatAlert['type']) => {
    switch (type) {
      case 'malware': return '🦠'
      case 'phishing': return '🎣'
      case 'ddos': return '💥'
      case 'apt': return '🎯'
      case 'vulnerability': return '🔓'
      case 'breach': return '🚨'
      default: return '⚠️'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            Live Threat Intelligence Map
          </h1>
          <p className="text-muted-foreground">
            Real-time global cybersecurity threats and incidents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoUpdate ? "default" : "outline"}
            onClick={() => setAutoUpdate(!autoUpdate)}
            className="hover-red-glow"
          >
            <Activity className={`w-4 h-4 mr-2 ${autoUpdate ? 'animate-pulse' : ''}`} />
            {autoUpdate ? 'Live' : 'Paused'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="malware">Malware</SelectItem>
                <SelectItem value="phishing">Phishing</SelectItem>
                <SelectItem value="ddos">DDoS</SelectItem>
                <SelectItem value="apt">APT</SelectItem>
                <SelectItem value="vulnerability">Vulnerability</SelectItem>
                <SelectItem value="breach">Breach</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground">
              {filteredThreats.length} active threats
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* World Map Visualization */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Global Threat Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-muted rounded-lg p-6 min-h-[400px] overflow-hidden">
                {/* Simplified world map representation */}
                <div className="absolute inset-0 opacity-20">
                  <svg viewBox="0 0 1000 500" className="w-full h-full">
                    {/* Simplified continents */}
                    <path d="M150,200 Q200,150 300,180 Q400,160 450,200 Q500,240 400,280 Q300,260 150,200Z" fill="currentColor" opacity="0.3" />
                    <path d="M500,180 Q600,160 700,180 Q800,200 750,240 Q650,260 500,180Z" fill="currentColor" opacity="0.3" />
                    <path d="M200,300 Q300,280 400,300 Q350,350 250,340 Q150,330 200,300Z" fill="currentColor" opacity="0.3" />
                  </svg>
                </div>
                
                {/* Threat indicators */}
                <div className="relative z-10">
                  {countryStats.slice(0, 10).map((stat, index) => (
                    <div
                      key={stat.country}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                      style={{
                        left: `${((stat.lng + 180) / 360) * 100}%`,
                        top: `${((90 - stat.lat) / 180) * 100}%`
                      }}
                      title={`${stat.country}: ${stat.threats} threats`}
                    >
                      <div className={`w-3 h-3 rounded-full animate-pulse ${
                        stat.severity === 'critical' ? 'bg-red-600' :
                        stat.severity === 'high' ? 'bg-red-500' :
                        stat.severity === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}>
                        <div className={`absolute inset-0 rounded-full animate-ping ${
                          stat.severity === 'critical' ? 'bg-red-600' :
                          stat.severity === 'high' ? 'bg-red-500' :
                          stat.severity === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`} />
                      </div>
                      {stat.threats > 5 && (
                        <div className="absolute -top-6 -left-2 text-xs font-bold text-primary">
                          {stat.threats}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Country Rankings */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Top Affected Regions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {countryStats.slice(0, 8).map((stat, index) => (
                <div key={stat.country} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-muted-foreground">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{stat.country}</div>
                      <div className="text-sm text-muted-foreground">
                        {stat.threats} active threats
                      </div>
                    </div>
                  </div>
                  <Badge className={getSeverityColor(stat.severity)}>
                    {stat.severity}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Threats Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Live Threat Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {filteredThreats.slice(0, 20).map((threat) => (
              <div
                key={threat.id}
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => setSelectedThreat(threat)}
              >
                <div className="text-2xl">{getTypeIcon(threat.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{threat.title}</h4>
                    <Badge className={getSeverityColor(threat.severity)}>
                      {threat.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {threat.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{threat.location.country}</span>
                    <span>{threat.source}</span>
                    <span>{new Date(threat.timestamp).toLocaleTimeString()}</span>
                    <span>{threat.affected.toLocaleString()} affected</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Threat Details Modal would go here */}
      {selectedThreat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{getTypeIcon(selectedThreat.type)}</span>
                  {selectedThreat.title}
                </CardTitle>
                <Button variant="ghost" onClick={() => setSelectedThreat(null)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <div className="font-medium capitalize">{selectedThreat.type}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Severity:</span>
                  <Badge className={getSeverityColor(selectedThreat.severity)}>
                    {selectedThreat.severity}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Location:</span>
                  <div className="font-medium">{selectedThreat.location.country}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Source:</span>
                  <div className="font-medium">{selectedThreat.source}</div>
                </div>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Description:</span>
                <p className="mt-1">{selectedThreat.description}</p>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Indicators of Compromise:</span>
                <div className="mt-1 space-y-1">
                  {selectedThreat.iocs.map((ioc, index) => (
                    <code key={index} className="block text-xs bg-muted p-2 rounded font-mono">
                      {ioc}
                    </code>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Tags:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Array.isArray(selectedThreat.tags) && selectedThreat.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}