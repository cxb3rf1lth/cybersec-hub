import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useThreatSources } from '@/hooks/useThreatSources'
import { ThreatSource, SourceTemplate } from '@/types/threat-sources'
import { ThreatSourceDashboard } from '@/components/feeds/ThreatSourceDashboard'
import { useState } from 'react'
import { 
  Plus, 
  Settings, 
  Trash, 
  Play, 
  Pause, 
  RefreshCw, 
  ExternalLink,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  Database,
  Globe,
  Key,
  Code,
  Activity,
  TrendingUp,
  Zap,
  BarChart
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

interface ThreatSourceManagerProps {
  onClose?: () => void
}

export function ThreatSourceManager({ onClose }: ThreatSourceManagerProps) {
  const { 
    sources, 
    sourceTemplates, 
    createSource, 
    updateSource, 
    deleteSource, 
    testSource, 
    getSourceStats, 
    getSourceLogs,
    isLoading 
  } = useThreatSources()
  
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedSource, setSelectedSource] = useState<ThreatSource | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<SourceTemplate | null>(null)

  // Create source form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'rss' as const,
    url: '',
    category: 'vulnerability' as const,
    refreshInterval: 60,
    apiKey: '',
    headers: '',
    params: '',
    authType: 'none' as const,
    includeKeywords: '',
    excludeKeywords: '',
    severityFilter: [] as string[]
  })

  const handleCreateSource = async () => {
    if (!formData.name || !formData.url) {
      toast.error('Name and URL are required')
      return
    }

    try {
      const sourceData = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        url: formData.url,
        category: formData.category,
        refreshInterval: formData.refreshInterval,
        isActive: true,
        createdBy: 'current-user',
        apiKey: formData.apiKey || undefined,
        headers: formData.headers ? JSON.parse(formData.headers) : undefined,
        params: formData.params ? JSON.parse(formData.params) : undefined,
        authentication: {
          type: formData.authType,
          credentials: formData.apiKey ? { apiKey: formData.apiKey } : undefined
        },
        parser: {
          type: formData.type === 'rss' ? 'rss' : 'json',
          mapping: {
            title: 'title',
            description: 'description', 
            timestamp: 'pubDate',
            source: formData.name
          }
        },
        filters: {
          includeKeywords: formData.includeKeywords ? formData.includeKeywords.split(',').map(k => k.trim()) : undefined,
          excludeKeywords: formData.excludeKeywords ? formData.excludeKeywords.split(',').map(k => k.trim()) : undefined,
          severityFilter: formData.severityFilter.length > 0 ? formData.severityFilter : undefined
        }
      }

      await createSource(sourceData)
      setShowCreateDialog(false)
      resetForm()
    } catch (error) {
      toast.error('Failed to create source')
    }
  }

  const handleCreateFromTemplate = async (template: SourceTemplate) => {
    setFormData({
      name: template.name,
      description: template.description,
      type: template.type,
      url: template.defaultUrl,
      category: template.category as any,
      refreshInterval: 60,
      apiKey: '',
      headers: '',
      params: '',
      authType: template.authentication?.type || 'none',
      includeKeywords: '',
      excludeKeywords: '',
      severityFilter: []
    })
    setSelectedTemplate(template)
    setShowTemplateDialog(false)
    setShowCreateDialog(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'rss',
      url: '',
      category: 'vulnerability',
      refreshInterval: 60,
      apiKey: '',
      headers: '',
      params: '',
      authType: 'none',
      includeKeywords: '',
      excludeKeywords: '',
      severityFilter: []
    })
    setSelectedTemplate(null)
  }

  const handleToggleSource = async (sourceId: string, isActive: boolean) => {
    await updateSource(sourceId, { isActive })
  }

  const handleTestSource = async (source: ThreatSource) => {
    const result = await testSource(source)
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  const handleDeleteSource = async (sourceId: string) => {
    if (confirm('Are you sure you want to delete this source?')) {
      await deleteSource(sourceId)
    }
  }

  const getStatusColor = (source: ThreatSource) => {
    if (!source.isActive) return 'bg-gray-500'
    if (source.lastError) return 'bg-red-500'
    if (source.lastUpdate) return 'bg-green-500'
    return 'bg-yellow-500'
  }

  const getStatusText = (source: ThreatSource) => {
    if (!source.isActive) return 'Inactive'
    if (source.lastError) return 'Error'
    if (source.lastUpdate) return 'Active'
    return 'Pending'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Threat Intelligence Sources</h2>
          <p className="text-muted-foreground">Manage custom threat intelligence integrations and data sources</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="hover-red-glow">
                <Database className="w-4 h-4 mr-2" />
                Browse Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Source Templates</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 mt-4">
                {sourceTemplates.map((template) => (
                  <Card key={template.id} className="hover-border-flow transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{template.type.toUpperCase()}</Badge>
                            <Badge variant="outline">{template.category}</Badge>
                            {template.isPopular && <Badge className="bg-primary">Popular</Badge>}
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleCreateFromTemplate(template)}
                          className="hover-red-glow"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Use Template
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {template.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                      {template.authentication?.required && (
                        <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <div className="flex items-center gap-2 text-yellow-600">
                            <Key className="w-4 h-4" />
                            <span className="text-sm font-medium">Authentication Required</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {template.authentication.instructions}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="hover-red-glow">
                <Plus className="w-4 h-4 mr-2" />
                Add Source
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedTemplate ? `Create from ${selectedTemplate.name}` : 'Add Custom Source'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); handleCreateSource(); }} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Source Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Custom CVE Feed"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Source Type</Label>
                    <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rss">RSS Feed</SelectItem>
                        <SelectItem value="api">REST API</SelectItem>
                        <SelectItem value="webhook">Webhook</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com/feed.xml"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this source provides..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vulnerability">Vulnerability</SelectItem>
                        <SelectItem value="malware">Malware</SelectItem>
                        <SelectItem value="threat-intel">Threat Intelligence</SelectItem>
                        <SelectItem value="bug-bounty">Bug Bounty</SelectItem>
                        <SelectItem value="news">News</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="interval">Refresh Interval (minutes)</Label>
                    <Input
                      id="interval"
                      type="number"
                      value={formData.refreshInterval}
                      onChange={(e) => setFormData({ ...formData, refreshInterval: parseInt(e.target.value) })}
                      min={5}
                      max={1440}
                    />
                  </div>
                </div>

                {formData.type === 'api' && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h4 className="font-semibold">Authentication</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="authType">Authentication Type</Label>
                          <Select value={formData.authType} onValueChange={(value: any) => setFormData({ ...formData, authType: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="api-key">API Key</SelectItem>
                              <SelectItem value="bearer">Bearer Token</SelectItem>
                              <SelectItem value="basic">Basic Auth</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {formData.authType !== 'none' && (
                          <div>
                            <Label htmlFor="apiKey">API Key/Token</Label>
                            <Input
                              id="apiKey"
                              type="password"
                              value={formData.apiKey}
                              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                              placeholder="Enter your API key..."
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="headers">Custom Headers (JSON)</Label>
                          <Textarea
                            id="headers"
                            value={formData.headers}
                            onChange={(e) => setFormData({ ...formData, headers: e.target.value })}
                            placeholder='{"User-Agent": "MyApp/1.0"}'
                            className="font-mono text-sm"
                          />
                        </div>
                        <div>
                          <Label htmlFor="params">Query Parameters (JSON)</Label>
                          <Textarea
                            id="params"
                            value={formData.params}
                            onChange={(e) => setFormData({ ...formData, params: e.target.value })}
                            placeholder='{"limit": 100}'
                            className="font-mono text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <Separator />
                <div className="space-y-4">
                  <h4 className="font-semibold">Content Filters</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="includeKeywords">Include Keywords (comma-separated)</Label>
                      <Input
                        id="includeKeywords"
                        value={formData.includeKeywords}
                        onChange={(e) => setFormData({ ...formData, includeKeywords: e.target.value })}
                        placeholder="vulnerability, exploit, security"
                      />
                    </div>
                    <div>
                      <Label htmlFor="excludeKeywords">Exclude Keywords (comma-separated)</Label>
                      <Input
                        id="excludeKeywords"
                        value={formData.excludeKeywords}
                        onChange={(e) => setFormData({ ...formData, excludeKeywords: e.target.value })}
                        placeholder="spam, advertisement"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="hover-red-glow">
                    Create Source
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="dashboard">
            <BarChart className="w-4 h-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4 mt-6">
          <ThreatSourceDashboard />
        </TabsContent>

        <TabsContent value="sources" className="space-y-4 mt-6">
          {sources.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Database className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Sources Configured</h3>
                <p className="text-muted-foreground mb-6">
                  Start by adding threat intelligence sources to aggregate security data
                </p>
                <div className="flex justify-center gap-2">
                  <Button onClick={() => setShowTemplateDialog(true)} variant="outline" className="hover-red-glow">
                    <Database className="w-4 h-4 mr-2" />
                    Browse Templates
                  </Button>
                  <Button onClick={() => setShowCreateDialog(true)} className="hover-red-glow">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Custom Source
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sources.map((source) => {
                const stats = getSourceStats(source.id)
                return (
                  <Card key={source.id} className="hover-border-flow transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <CardTitle className="text-lg">{source.name}</CardTitle>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(source)}`}></div>
                              <span className="text-sm text-muted-foreground">{getStatusText(source)}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{source.description}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{source.type.toUpperCase()}</Badge>
                            <Badge variant="outline">{source.category}</Badge>
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                              {source.refreshInterval}m
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={source.isActive}
                            onCheckedChange={(checked) => handleToggleSource(source.id, checked)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTestSource(source)}
                            disabled={isLoading}
                            className="hover-red-glow"
                          >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSource(source)}
                            className="hover-red-glow"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSource(source.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total Items:</span>
                          <span className="ml-2 font-semibold">{source.totalItems || 0}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Success Rate:</span>
                          <span className="ml-2 font-semibold text-green-500">
                            {stats ? Math.round((stats.successfulRequests / stats.totalRequests) * 100) || 0 : 0}%
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Update:</span>
                          <span className="ml-2 font-semibold">
                            {source.lastUpdate ? formatDistanceToNow(new Date(source.lastUpdate), { addSuffix: true }) : 'Never'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Avg Response:</span>
                          <span className="ml-2 font-semibold">
                            {stats?.averageResponseTime ? `${stats.averageResponseTime}ms` : 'N/A'}
                          </span>
                        </div>
                      </div>
                      
                      {source.lastError && (
                        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <div className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-sm font-medium">Last Error</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{source.lastError}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sources.length}</div>
                <p className="text-xs text-muted-foreground">
                  {sources.filter(s => s.isActive).length} active
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Items Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {sources.reduce((sum, source) => sum + (source.totalItems || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  All time total
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {sources.length > 0 ? Math.round(
                    sources.reduce((sum, source) => sum + (source.successfulFetches || 0), 0) /
                    Math.max(sources.reduce((sum, source) => sum + (source.successfulFetches || 0) + (source.failedFetches || 0), 0), 1) * 100
                  ) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  <Activity className="w-3 h-3 inline mr-1" />
                  Overall reliability
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Source Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Source Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sources.map((source) => {
                  const stats = getSourceStats(source.id)
                  const successRate = stats 
                    ? Math.round((stats.successfulRequests / Math.max(stats.totalRequests, 1)) * 100)
                    : 0
                  
                  return (
                    <div key={source.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{source.name}</span>
                        <span className="text-muted-foreground">{successRate}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${successRate}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4 mt-6">
          <div className="space-y-4">
            {sources.map((source) => {
              const logs = getSourceLogs(source.id, 10)
              if (logs.length === 0) return null

              return (
                <Card key={source.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{source.name} Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {logs.map((log) => (
                        <div key={log.id} className="flex items-center gap-3 p-2 rounded-lg border">
                          <div className="flex-shrink-0">
                            {log.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                            {log.status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                            {log.status === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{log.message}</p>
                            {log.errorDetails && (
                              <p className="text-xs text-muted-foreground mt-1">{log.errorDetails}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {log.itemsProcessed !== undefined && (
                              <span>{log.itemsProcessed} items</span>
                            )}
                            {log.duration && (
                              <span>{log.duration}ms</span>
                            )}
                            <span>{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}