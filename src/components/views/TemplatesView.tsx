import { useState } from 'react'
import { useKVWithFallback } from '@/lib/kv-fallback'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { MagnifyingGlass, Plus, Star, Download, Code, FolderOpen, Filter, Users } from '@/lib/phosphor-icons-wrapper'
import { Template, ToolRepository, TemplateSearchFilters, RepositorySearchFilters } from '@/types/templates'
import { User } from '@/types/user'
import { TemplateCard } from '@/components/templates/TemplateCard'
import { RepositoryCard } from '@/components/templates/RepositoryCard'
import { CreateTemplateModal } from '@/components/templates/CreateTemplateModal'
import { CreateRepositoryModal } from '@/components/templates/CreateRepositoryModal'
import { TeamDashboard } from '@/components/templates/TeamDashboard'

interface TemplatesViewProps {
  currentUser: User
}

export function TemplatesView({ currentUser }: TemplatesViewProps) {
  const [templates] = useKVWithFallback<Template[]>('templates', [])
  const [repositories] = useKVWithFallback<ToolRepository[]>('toolRepositories', [])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'templates' | 'repositories' | 'teams'>('templates')
  const [showCreateTemplate, setShowCreateTemplate] = useState(false)
  const [showCreateRepository, setShowCreateRepository] = useState(false)
  const [templateFilters, setTemplateFilters] = useState<TemplateSearchFilters>({
    sortBy: 'stars',
    sortOrder: 'desc'
  })
  const [repositoryFilters, setRepositoryFilters] = useState<RepositorySearchFilters>({
    sortBy: 'stars',
    sortOrder: 'desc'
  })

  // Filter and search templates
  const filteredTemplates = (templates ?? [])
    .filter(template => {
      if (!template.isPublic && template.author.id !== currentUser.id) return false
      
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCategory = !templateFilters.category || template.category === templateFilters.category
      const matchesDifficulty = !templateFilters.difficulty || template.difficulty === templateFilters.difficulty
      const matchesFramework = !templateFilters.framework || template.framework === templateFilters.framework
      
      return matchesSearch && matchesCategory && matchesDifficulty && matchesFramework
    })
    .sort((a, b) => {
      const { sortBy, sortOrder } = templateFilters
      let comparison = 0
      
      switch (sortBy) {
        case 'stars':
          comparison = a.stars - b.stars
          break
        case 'downloads':
          comparison = a.downloads - b.downloads
          break
        case 'recent':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
      }
      
      return sortOrder === 'desc' ? -comparison : comparison
    })

  // Filter and search repositories
  const filteredRepositories = (repositories ?? [])
    .filter(repo => {
      if (!repo.isPublic && repo.author.id !== currentUser.id) return false
      
      const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           repo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           repo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCategory = !repositoryFilters.category || repo.category === repositoryFilters.category
      
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      const { sortBy, sortOrder } = repositoryFilters
      let comparison = 0
      
      switch (sortBy) {
        case 'stars':
          comparison = a.stars - b.stars
          break
        case 'forks':
          comparison = a.forks - b.forks
          break
        case 'recent':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
      }
      
      return sortOrder === 'desc' ? -comparison : comparison
    })

  const templateCategories = [
    { value: 'web-app', label: 'Web Applications' },
    { value: 'cli-tool', label: 'CLI Tools' },
    { value: 'exploitation', label: 'Exploitation' },
    { value: 'analysis', label: 'Analysis' },
    { value: 'networking', label: 'Networking' },
    { value: 'forensics', label: 'Forensics' },
    { value: 'automation', label: 'Automation' }
  ]

  const repositoryCategories = [
    { value: 'reconnaissance', label: 'Reconnaissance' },
    { value: 'exploitation', label: 'Exploitation' },
    { value: 'post-exploitation', label: 'Post-Exploitation' },
    { value: 'defense', label: 'Defense' },
    { value: 'analysis', label: 'Analysis' },
    { value: 'automation', label: 'Automation' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Templates & Tools</h1>
          <p className="text-muted-foreground">
            Cybersecurity project templates and curated tool repositories
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowCreateTemplate(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
          <Button
            onClick={() => setShowCreateRepository(true)}
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Repository
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search templates and repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'templates' | 'repositories' | 'teams')}>
          <div className="flex items-center justify-between">
            <TabsList className="grid w-fit grid-cols-3">
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Templates ({filteredTemplates.length})
              </TabsTrigger>
              <TabsTrigger value="repositories" className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Repositories ({filteredRepositories.length})
              </TabsTrigger>
              <TabsTrigger value="teams" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Teams
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              {activeTab === 'templates' ? (
                <div className="flex gap-2">
                  <Select
                    value={templateFilters.category || 'all'}
                    onValueChange={(value) => setTemplateFilters(prev => ({
                      ...prev,
                      category: value === 'all' ? undefined : value
                    }))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {templateCategories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={templateFilters.sortBy || 'stars'}
                    onValueChange={(value) => setTemplateFilters(prev => ({
                      ...prev,
                      sortBy: value as any
                    }))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stars">Stars</SelectItem>
                      <SelectItem value="downloads">Downloads</SelectItem>
                      <SelectItem value="recent">Recent</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Select
                    value={repositoryFilters.category || 'all'}
                    onValueChange={(value) => setRepositoryFilters(prev => ({
                      ...prev,
                      category: value === 'all' ? undefined : value
                    }))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {repositoryCategories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={repositoryFilters.sortBy || 'stars'}
                    onValueChange={(value) => setRepositoryFilters(prev => ({
                      ...prev,
                      sortBy: value as any
                    }))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stars">Stars</SelectItem>
                      <SelectItem value="forks">Forks</SelectItem>
                      <SelectItem value="recent">Recent</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <TabsContent value="templates" className="mt-6">
            {filteredTemplates.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Code className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? 'Try adjusting your search or filters' : 'Be the first to create a template!'}
                  </p>
                  <Button onClick={() => setShowCreateTemplate(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map(template => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    currentUser={currentUser}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="repositories" className="mt-6">
            {filteredRepositories.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No repositories found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? 'Try adjusting your search or filters' : 'Be the first to create a repository!'}
                  </p>
                  <Button onClick={() => setShowCreateRepository(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Repository
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredRepositories.map(repository => (
                  <RepositoryCard
                    key={repository.id}
                    repository={repository}
                    currentUser={currentUser}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="teams" className="mt-6">
            <TeamDashboard currentUser={currentUser} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {showCreateTemplate && (
        <CreateTemplateModal
          currentUser={currentUser}
          onClose={() => setShowCreateTemplate(false)}
        />
      )}
      
      {showCreateRepository && (
        <CreateRepositoryModal
          currentUser={currentUser}
          onClose={() => setShowCreateRepository(false)}
        />
      )}
    </div>
  )
}