export interface Template {
  id: string
  name: string
  description: string
  category: 'web-app' | 'cli-tool' | 'exploitation' | 'analysis' | 'networking' | 'forensics' | 'automation'
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  files: TemplateFile[]
  dependencies: string[]
  setupInstructions: string
  usageExample: string
  author: {
    id: string
    username: string
    avatar: string
  }
  stars: number
  downloads: number
  createdAt: Date
  updatedAt: Date
  isPublic: boolean
  license: string
  framework?: 'python' | 'javascript' | 'bash' | 'powershell' | 'go' | 'rust' | 'c' | 'cpp'
}

export interface TemplateFile {
  id: string
  name: string
  path: string
  content: string
  language: string
  isEntryPoint?: boolean
}

export interface ToolRepository {
  id: string
  name: string
  description: string
  category: 'reconnaissance' | 'exploitation' | 'post-exploitation' | 'defense' | 'analysis' | 'automation'
  tools: Tool[]
  author: {
    id: string
    username: string
    avatar: string
  }
  isPublic: boolean
  stars: number
  forks: number
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

export interface Tool {
  id: string
  name: string
  description: string
  version: string
  installCommand: string
  usageExample: string
  documentation: string
  platform: ('linux' | 'windows' | 'macos' | 'web')[]
  dependencies: string[]
  category: 'scanner' | 'exploit' | 'payload' | 'encoder' | 'decoder' | 'analyzer' | 'monitor'
  complexity: 'simple' | 'moderate' | 'complex'
}

export interface TemplateSearchFilters {
  category?: string
  difficulty?: string
  framework?: string
  tags?: string[]
  sortBy?: 'stars' | 'downloads' | 'recent' | 'name'
  sortOrder?: 'asc' | 'desc'
}

export interface RepositorySearchFilters {
  category?: string
  tags?: string[]
  sortBy?: 'stars' | 'forks' | 'recent' | 'name'
  sortOrder?: 'asc' | 'desc'
}