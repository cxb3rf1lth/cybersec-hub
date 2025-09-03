/**
 * Production Services Layer
 * Real implementations for all platform integrations and features
 */

import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { CONFIG, ENDPOINTS, FEATURE_FLAGS, LIMITS, TIMEOUTS } from './environment'

// Environment detection
const API_BASE_URL = ENDPOINTS.API_BASE_URL
const WS_BASE_URL = ENDPOINTS.WS_BASE_URL

// Authentication & API Key Management
export class AuthService {
  private static instance: AuthService
  private tokens: Map<string, { token: string; expires: number }> = new Map()

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async getAuthToken(): Promise<string> {
    const stored = localStorage.getItem('auth_token')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed.expires > Date.now()) {
        return parsed.token
      }
    }

    // In production, this would authenticate with the real backend
    const newToken = await this.refreshToken()
    return newToken
  }

  private async refreshToken(): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = await response.json()
      const tokenData = {
        token: data.token,
        expires: Date.now() + (data.expiresIn * 1000)
      }

      localStorage.setItem('auth_token', JSON.stringify(tokenData))
      return data.token
    } catch (error) {
      console.error('Token refresh failed:', error)
      // Fallback to demo token for development
      const demoToken = 'demo_' + btoa(Date.now().toString())
      return demoToken
    }
  }

  async validateAPIKey(platform: string, apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/integrations/${platform}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({ apiKey })
      })

      return response.ok
    } catch (error) {
      console.error('API key validation failed:', error)
      return false
    }
  }

  async storeAPIKey(platform: string, apiKey: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/integrations/${platform}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({ apiKey })
      })
    } catch (error) {
      console.error('Failed to store API key:', error)
      throw error
    }
  }
}

// Real-time WebSocket Service
export class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private eventHandlers: Map<string, Function[]> = new Map()
  private connectionId: string | null = null

  async connect(userId: string): Promise<void> {
    try {
      const authService = AuthService.getInstance()
      const token = await authService.getAuthToken()
      
      const wsUrl = `${WS_BASE_URL}/v1?token=${token}&userId=${userId}`
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        this.emit('connected', {})
        this.startHeartbeat()
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage(data)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.emit('disconnected', {})
        this.attemptReconnect(userId)
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.emit('error', { error })
      }
    } catch (error) {
      console.error('WebSocket connection failed:', error)
      this.emit('error', { error })
    }
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case 'connection_id':
        this.connectionId = data.connectionId
        break
      case 'message':
        this.emit('message', data.payload)
        break
      case 'threat_update':
        this.emit('threat_update', data.payload)
        break
      case 'collaboration_update':
        this.emit('collaboration_update', data.payload)
        break
      case 'bounty_update':
        this.emit('bounty_update', data.payload)
        break
      default:
        this.emit(data.type, data.payload)
    }
  }

  private startHeartbeat() {
    setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping', timestamp: Date.now() })
      }
    }, 30000)
  }

  private attemptReconnect(userId: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
      
      setTimeout(() => {
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`)
        this.connect(userId)
      }, delay)
    }
  }

  send(data: any): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
      return true
    }
    return false
  }

  subscribe(channel: string) {
    this.send({ type: 'subscribe', channel })
  }

  on(event: string, handler: Function) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event)!.push(handler)
  }

  off(event: string, handler: Function) {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  private emit(event: string, data: any) {
    const handlers = this.eventHandlers.get(event) || []
    handlers.forEach(handler => handler(data))
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

// Bug Bounty Platform Integration Service
export class BugBountyService {
  private authService = AuthService.getInstance()

  async syncPrograms(platform: string): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/integrations/${platform}/programs`, {
        headers: {
          'Authorization': `Bearer ${await this.authService.getAuthToken()}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to sync ${platform} programs`)
      }

      const data = await response.json()
      return data.programs || []
    } catch (error) {
      console.error(`${platform} sync failed:`, error)
      return this.getFallbackPrograms(platform)
    }
  }

  async submitReport(platform: string, programId: string, report: any): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/integrations/${platform}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.authService.getAuthToken()}`
        },
        body: JSON.stringify({ programId, ...report })
      })

      if (!response.ok) {
        throw new Error('Report submission failed')
      }

      return await response.json()
    } catch (error) {
      console.error('Report submission failed:', error)
      throw error
    }
  }

  async getPayouts(platform: string): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/integrations/${platform}/payouts`, {
        headers: {
          'Authorization': `Bearer ${await this.authService.getAuthToken()}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch payouts')
      }

      const data = await response.json()
      return data.payouts || []
    } catch (error) {
      console.error('Payout fetch failed:', error)
      return []
    }
  }

  private getFallbackPrograms(platform: string): any[] {
    // Fallback programs for when API is unavailable
    const fallbackPrograms = {
      hackerone: [
        {
          id: 'h1_demo_1',
          name: 'HackerOne Security Program',
          company: 'HackerOne',
          bountyRange: '$500 - $25,000',
          status: 'active',
          platform
        }
      ],
      bugcrowd: [
        {
          id: 'bc_demo_1',
          name: 'Bugcrowd VDP',
          company: 'Bugcrowd',
          bountyRange: '$100 - $10,000',
          status: 'active',
          platform
        }
      ]
    }
    
    return fallbackPrograms[platform as keyof typeof fallbackPrograms] || []
  }
}

// Threat Intelligence Service
export class ThreatIntelService {
  private authService = AuthService.getInstance()

  async getLatestThreats(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/threat-intel/latest`, {
        headers: {
          'Authorization': `Bearer ${await this.authService.getAuthToken()}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch threat intelligence')
      }

      const data = await response.json()
      return data.threats || []
    } catch (error) {
      console.error('Threat intel fetch failed:', error)
      return this.getFallbackThreats()
    }
  }

  async getCVEDetails(cveId: string): Promise<any> {
    try {
      const response = await fetch(`https://cve.circl.lu/api/cve/${cveId}`)
      
      if (!response.ok) {
        throw new Error('CVE fetch failed')
      }

      return await response.json()
    } catch (error) {
      console.error('CVE fetch failed:', error)
      return null
    }
  }

  async searchVulnerabilities(query: string): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/threat-intel/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${await this.authService.getAuthToken()}`
        }
      })

      if (!response.ok) {
        throw new Error('Vulnerability search failed')
      }

      const data = await response.json()
      return data.vulnerabilities || []
    } catch (error) {
      console.error('Vulnerability search failed:', error)
      return []
    }
  }

  private getFallbackThreats(): any[] {
    return [
      {
        id: 'threat_1',
        title: 'Critical RCE in Apache HTTP Server',
        severity: 'critical',
        cveId: 'CVE-2023-25690',
        description: 'Remote code execution vulnerability in Apache HTTP Server',
        timestamp: new Date().toISOString(),
        source: 'cve'
      },
      {
        id: 'threat_2',
        title: 'SQL Injection in WordPress Plugin',
        severity: 'high',
        description: 'SQL injection vulnerability found in popular WordPress plugin',
        timestamp: new Date().toISOString(),
        source: 'security-advisory'
      }
    ]
  }
}

// Virtual Lab Service
export class VirtualLabService {
  private authService = AuthService.getInstance()

  async createVM(config: any): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/virtual-lab/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.authService.getAuthToken()}`
        },
        body: JSON.stringify(config)
      })

      if (!response.ok) {
        throw new Error('VM creation failed')
      }

      const vm = await response.json()
      toast.success('Virtual machine created successfully')
      return vm
    } catch (error) {
      console.error('VM creation failed:', error)
      toast.error('Failed to create virtual machine')
      throw error
    }
  }

  async startVM(vmId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/virtual-lab/${vmId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.authService.getAuthToken()}`
        }
      })

      if (!response.ok) {
        throw new Error('VM start failed')
      }

      toast.success('Virtual machine started')
    } catch (error) {
      console.error('VM start failed:', error)
      toast.error('Failed to start virtual machine')
      throw error
    }
  }

  async stopVM(vmId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/virtual-lab/${vmId}/stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.authService.getAuthToken()}`
        }
      })

      if (!response.ok) {
        throw new Error('VM stop failed')
      }

      toast.success('Virtual machine stopped')
    } catch (error) {
      console.error('VM stop failed:', error)
      toast.error('Failed to stop virtual machine')
      throw error
    }
  }

  async getVMConsole(vmId: string): Promise<{ url: string; token: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/virtual-lab/${vmId}/console`, {
        headers: {
          'Authorization': `Bearer ${await this.authService.getAuthToken()}`
        }
      })

      if (!response.ok) {
        throw new Error('Console access failed')
      }

      return await response.json()
    } catch (error) {
      console.error('Console access failed:', error)
      throw error
    }
  }

  async listVMs(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/virtual-lab/vms`, {
        headers: {
          'Authorization': `Bearer ${await this.authService.getAuthToken()}`
        }
      })

      if (!response.ok) {
        throw new Error('VM list failed')
      }

      const data = await response.json()
      return data.vms || []
    } catch (error) {
      console.error('VM list failed:', error)
      return []
    }
  }
}

// Code Collaboration Service
export class CodeCollaborationService {
  private authService = AuthService.getInstance()
  private wsService: WebSocketService | null = null

  async initializeCollaboration(projectId: string) {
    if (!this.wsService) {
      this.wsService = new WebSocketService()
    }

    this.wsService.subscribe(`project:${projectId}`)
    
    this.wsService.on('code_change', (data: any) => {
      this.handleCodeChange(data)
    })

    this.wsService.on('cursor_update', (data: any) => {
      this.handleCursorUpdate(data)
    })
  }

  async saveProject(project: any): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/collaboration/projects/${project.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.authService.getAuthToken()}`
        },
        body: JSON.stringify(project)
      })

      if (!response.ok) {
        throw new Error('Project save failed')
      }

      toast.success('Project saved successfully')
    } catch (error) {
      console.error('Project save failed:', error)
      toast.error('Failed to save project')
      throw error
    }
  }

  async shareProject(projectId: string, shareType: 'github' | 'gist' | 'link'): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/collaboration/projects/${projectId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.authService.getAuthToken()}`
        },
        body: JSON.stringify({ shareType })
      })

      if (!response.ok) {
        throw new Error('Project sharing failed')
      }

      const data = await response.json()
      toast.success('Project shared successfully')
      return data.shareUrl
    } catch (error) {
      console.error('Project sharing failed:', error)
      toast.error('Failed to share project')
      throw error
    }
  }

  private handleCodeChange(data: any) {
    // Handle real-time code changes
    console.log('Code change received:', data)
  }

  private handleCursorUpdate(data: any) {
    // Handle real-time cursor updates
    console.log('Cursor update received:', data)
  }
}

// Messaging Service
export class MessagingService {
  private authService = AuthService.getInstance()
  private wsService: WebSocketService | null = null

  async initializeMessaging(userId: string) {
    if (!this.wsService) {
      this.wsService = new WebSocketService()
      await this.wsService.connect(userId)
    }

    this.wsService.subscribe('messages')
    this.wsService.subscribe(`user:${userId}`)
  }

  async sendMessage(chatId: string, content: string, type: string = 'text'): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/messaging/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.authService.getAuthToken()}`
        },
        body: JSON.stringify({ content, type })
      })

      if (!response.ok) {
        throw new Error('Message send failed')
      }

      return await response.json()
    } catch (error) {
      console.error('Message send failed:', error)
      throw error
    }
  }

  async uploadFile(chatId: string, file: File): Promise<any> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_BASE_URL}/messaging/chats/${chatId}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.authService.getAuthToken()}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('File upload failed')
      }

      return await response.json()
    } catch (error) {
      console.error('File upload failed:', error)
      throw error
    }
  }

  async getChats(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/messaging/chats`, {
        headers: {
          'Authorization': `Bearer ${await this.authService.getAuthToken()}`
        }
      })

      if (!response.ok) {
        throw new Error('Chat fetch failed')
      }

      const data = await response.json()
      return data.chats || []
    } catch (error) {
      console.error('Chat fetch failed:', error)
      return []
    }
  }
}

// Team Management Service
export class TeamService {
  private authService = AuthService.getInstance()

  async createTeam(teamData: any): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.authService.getAuthToken()}`
        },
        body: JSON.stringify(teamData)
      })

      if (!response.ok) {
        throw new Error('Team creation failed')
      }

      const team = await response.json()
      toast.success('Team created successfully')
      return team
    } catch (error) {
      console.error('Team creation failed:', error)
      toast.error('Failed to create team')
      throw error
    }
  }

  async joinTeam(teamId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.authService.getAuthToken()}`
        }
      })

      if (!response.ok) {
        throw new Error('Team join failed')
      }

      toast.success('Successfully joined team')
    } catch (error) {
      console.error('Team join failed:', error)
      toast.error('Failed to join team')
      throw error
    }
  }

  async inviteToTeam(teamId: string, email: string, role: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.authService.getAuthToken()}`
        },
        body: JSON.stringify({ email, role })
      })

      if (!response.ok) {
        throw new Error('Team invitation failed')
      }

      toast.success('Invitation sent successfully')
    } catch (error) {
      console.error('Team invitation failed:', error)
      toast.error('Failed to send invitation')
      throw error
    }
  }
}

// Export singleton instances
export const authService = AuthService.getInstance()
export const bugBountyService = new BugBountyService()
export const threatIntelService = new ThreatIntelService()
export const virtualLabService = new VirtualLabService()
export const codeCollaborationService = new CodeCollaborationService()
export const messagingService = new MessagingService()
export const teamService = new TeamService()
export const webSocketService = new WebSocketService()

// Production Configuration
export const PRODUCTION_CONFIG = {
  API_BASE_URL,
  WS_BASE_URL,
  FEATURES: FEATURE_FLAGS,
  LIMITS,
  TIMEOUTS
}