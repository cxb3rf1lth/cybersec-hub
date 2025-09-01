import { BinaryRain } from '@/components/ui/loading-animations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useThreatFeeds } from '@/hooks/useThreatFeeds'
import { ThreatFeed, BugBountyProgram, ThreatIntelligence, CyberSecNews, FeedFilter } from '@/types/threat-feeds'
import { ThreatSourceManager } from '@/components/feeds/ThreatSourceManager'
import { ProductionThreatIntegration } from '@/components/threats/ProductionThreatIntegration'
import { toast } from 'sonner'
import { 
  RefreshCw, 
  AlertTriangle, 
  Shield, 
  Bug, 
  Eye, 
  Clock,
  ExternalLink,
  Filter,
  Search,
  DollarSign,
  Users,
  TrendingUp,
  Zap,
  Settings,
  Database
} from '@phosphor-icons/react'
import { useState, useMemo, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'

interface ThreatIntelligenceFeedProps {
  onClose?: () => void
}

export function ThreatIntelligenceFeed({ onClose }: ThreatIntelligenceFeedProps) {
  const { 
    threatFeeds, 
    bugBountyPrograms, 
    threatIntel, 
    cyberNews, 
    lastUpdate, 
    isUpdating, 
    refreshFeeds 
  } = useThreatFeeds()

  const [activeTab, setActiveTab] = useState('feeds')
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  
  const handleRefresh = async () => {
    toast.info('Refreshing threat intelligence feeds...', {
      description: 'Experience the immersive binary rain animations while data updates',
      duration: 3000
    })
    await refreshFeeds()
    toast.success('Threat intelligence feeds updated successfully', {
      description: 'Latest cybersecurity data has been synchronized'
    })
  }

  // Add keyboard shortcut for easy testing (Ctrl+R or F5)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if ((event.ctrlKey && event.key === 'r') || event.key === 'F5') {
        event.preventDefault()
        handleRefresh()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Combine and filter all feeds
  const allFeeds = useMemo(() => {
    let combined: any[] = []
    
    if (activeTab === 'feeds' || activeTab === 'threats') {
      combined = [...combined, ...threatFeeds.map(item => ({ 
        ...item, 
        type: 'threat',
        tags: Array.isArray(item.tags) ? item.tags : []
      }))]
    }
    if (activeTab === 'feeds' || activeTab === 'bounties') {
      combined = [...combined, ...bugBountyPrograms.map(item => ({ 
        ...item, 
        type: 'bounty',
        scope: Array.isArray(item.scope) ? item.scope : []
      }))]
    }
    if (activeTab === 'feeds' || activeTab === 'intel') {
      combined = [...combined, ...threatIntel.map(item => ({ 
        ...item, 
        type: 'intel',
        indicators: Array.isArray(item.indicators) ? item.indicators : []
      }))]
    }
    if (activeTab === 'feeds' || activeTab === 'news') {
      combined = [...combined, ...cyberNews.map(item => ({ 
        ...item, 
        type: 'news',
        tags: Array.isArray(item.tags) ? item.tags : []
      }))]
    }

    // Apply filters
    if (searchQuery) {
      combined = combined.filter(item => 
        (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.company || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (severityFilter !== 'all') {
      combined = combined.filter(item => 
        item.severity === severityFilter || 
        item.confidence === severityFilter ||
        item.difficulty === severityFilter
      )
    }

    // Sort by timestamp/lastUpdated/publishedAt
    combined.sort((a, b) => {
      const timeA = new Date(a.timestamp || a.lastUpdated || a.publishedAt || 0).getTime()
      const timeB = new Date(b.timestamp || b.lastUpdated || b.publishedAt || 0).getTime()
      return timeB - timeA
    })

    return combined
  }, [threatFeeds, bugBountyPrograms, threatIntel, cyberNews, activeTab, searchQuery, severityFilter])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-black'
      case 'low': return 'bg-blue-500 text-white'
      case 'expert': return 'bg-purple-500 text-white'
      case 'advanced': return 'bg-red-500 text-white'
      case 'intermediate': return 'bg-orange-500 text-white'
      case 'beginner': return 'bg-green-500 text-white'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'threat': return <AlertTriangle className="w-4 h-4" />
      case 'bounty': return <Bug className="w-4 h-4" />
      case 'intel': return <Eye className="w-4 h-4" />
      case 'news': return <TrendingUp className="w-4 h-4" />
      default: return <Shield className="w-4 h-4" />
    }
  }

  const renderFeedItem = (item: any) => {
    const timeAgo = formatDistanceToNow(new Date(item.timestamp || item.lastUpdated || item.publishedAt), { addSuffix: true })
    
    return (
      <Card key={item.id} className={`hover-border-flow transition-all duration-300 ${item.isPinned ? 'border-primary' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {getTypeIcon(item.type)}
              <CardTitle className="text-sm font-semibold truncate">{item.title}</CardTitle>
              {item.isPinned && <Zap className="w-4 h-4 text-primary flex-shrink-0" />}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {(item.severity || item.confidence || item.difficulty) && (
                <Badge className={getSeverityColor(item.severity || item.confidence || item.difficulty)}>
                  {item.severity || item.confidence || item.difficulty}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {item.source || item.platform || 'Unknown'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {item.description || item.summary || 'No description available'}
          </p>
          
          {/* Type-specific content */}
          {item.type === 'threat' && (
            <div className="flex flex-wrap gap-2 mb-3">
              {item.cve && <Badge variant="secondary">CVE: {item.cve}</Badge>}
              {item.cvss && <Badge variant="secondary">CVSS: {item.cvss}</Badge>}
              {Array.isArray(item.tags) && item.tags.slice(0, 3).map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}

          {item.type === 'bounty' && (
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span>${item.minReward?.toLocaleString()} - ${item.maxReward?.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>{item.participants} participants</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {Array.isArray(item.scope) && item.scope.slice(0, 2).map((scope: string) => (
                  <Badge key={scope} variant="outline" className="text-xs">{scope}</Badge>
                ))}
                {Array.isArray(item.scope) && item.scope.length > 2 && (
                  <Badge variant="outline" className="text-xs">+{item.scope.length - 2} more</Badge>
                )}
              </div>
            </div>
          )}

          {item.type === 'intel' && (
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2">
                <Badge className={`text-xs ${item.tlpLevel === 'red' ? 'bg-red-500' : item.tlpLevel === 'amber' ? 'bg-orange-500' : 'bg-green-500'}`}>
                  TLP:{item.tlpLevel?.toUpperCase()}
                </Badge>
                <Badge variant="secondary" className="text-xs">{item.type?.toUpperCase()}</Badge>
              </div>
              {Array.isArray(item.indicators) && (
                <div className="text-xs text-muted-foreground">
                  {item.indicators.length} indicators available
                </div>
              )}
            </div>
          )}

          {item.type === 'news' && (
            <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
              <span>By {item.author}</span>
              <span>{item.readTime} min read</span>
              <Badge variant="outline" className="text-xs">{item.category}</Badge>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{timeAgo}</span>
            </div>
            {item.url && (
              <Button variant="ghost" size="sm" className="h-7 text-xs hover-red-glow">
                <ExternalLink className="w-3 h-3 mr-1" />
                View Details
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderFeedContent = () => (
    <>
      {isUpdating && (
        <Card className="border-primary/20 bg-background/50 backdrop-blur-sm">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <BinaryRain columns={5} speed="fast" density="dense" variant="cyber" />
              </div>
              <div className="text-center space-y-2">
                <span className="text-primary font-medium terminal-cursor">Synchronizing threat intelligence feeds</span>
                <p className="text-sm text-muted-foreground max-w-md">
                  Processing real-time cybersecurity data from multiple sources including CVE databases, 
                  threat intelligence feeds, and bug bounty platforms...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {allFeeds.length > 0 ? (
          allFeeds.map(renderFeedItem)
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No feeds available</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || severityFilter !== 'all' 
                  ? 'No feeds match your current filters' 
                  : 'Threat intelligence feeds will appear here when available'
                }
              </p>
              <Button onClick={handleRefresh} variant="outline" className="hover-red-glow">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Feeds
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )

  return (
    <div className="space-y-6 relative">
      {/* Immersive Background Binary Rain Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Main cascading columns */}
        <div className="absolute inset-0 opacity-12">
          <div className="grid grid-cols-24 gap-1 h-full w-full">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={`main-${i}`} className="relative h-full">
                <BinaryRain 
                  columns={1} 
                  speed={i % 3 === 0 ? 'fast' : i % 3 === 1 ? 'normal' : 'slow'} 
                  density="normal" 
                  variant="matrix"
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Slower background layer for depth */}
        <div className="absolute inset-0 opacity-6">
          <div className="grid grid-cols-16 gap-3 h-full w-full">
            {Array.from({ length: 16 }).map((_, i) => (
              <div 
                key={`bg-${i}`} 
                className="relative h-full"
              >
                <BinaryRain 
                  columns={1} 
                  speed="slow" 
                  density="sparse" 
                  variant="minimal"
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Edge accent streams */}
        <div className="absolute left-0 top-0 h-full w-12 opacity-25">
          <BinaryRain 
            columns={3} 
            speed="fast" 
            density="dense" 
            variant="cyber"
          />
        </div>
        <div className="absolute right-0 top-0 h-full w-12 opacity-25">
          <BinaryRain 
            columns={3} 
            speed="fast" 
            density="dense" 
            variant="cyber"
          />
        </div>
      </div>
      
      {/* Content layer */}
      <div className="relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Threat Intelligence Feed</h2>
          <p className="text-muted-foreground">
            Real-time cybersecurity threat intelligence and bug bounty data
            <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-md font-mono">
              Press Ctrl+R or F5 to test binary rain animations
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="hover-red-glow"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isUpdating}
            className="hover-red-glow"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
            {isUpdating ? 'Updating...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <Card className="border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Live Feed Active</span>
              </div>
              {lastUpdate && (
                <div className="text-sm text-muted-foreground">
                  Last updated: {formatDistanceToNow(new Date(lastUpdate), { addSuffix: true })}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-primary">{threatFeeds.length} Threats</span>
              <span className="text-blue-500">{bugBountyPrograms.length} Bounties</span>
              <span className="text-purple-500">{threatIntel.length} Intel</span>
              <span className="text-orange-500">{cyberNews.length} News</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search feeds..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="feeds">Live Feeds</TabsTrigger>
          <TabsTrigger value="threats">Threats</TabsTrigger>
          <TabsTrigger value="bounties">Bug Bounties</TabsTrigger>
          <TabsTrigger value="intel">Intel</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
        </TabsList>

        <TabsContent value="feeds" className="space-y-4 mt-6">{renderFeedContent()}</TabsContent>
        <TabsContent value="threats" className="space-y-4 mt-6">{renderFeedContent()}</TabsContent>
        <TabsContent value="bounties" className="space-y-4 mt-6">{renderFeedContent()}</TabsContent>
        <TabsContent value="intel" className="space-y-4 mt-6">{renderFeedContent()}</TabsContent>
        <TabsContent value="news" className="space-y-4 mt-6">{renderFeedContent()}</TabsContent>
        <TabsContent value="sources" className="space-y-4 mt-6">
          <ThreatSourceManager />
        </TabsContent>
        <TabsContent value="production" className="space-y-4 mt-6">
          <ProductionThreatIntegration />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}