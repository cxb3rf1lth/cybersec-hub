export type Distro = 'kali' | 'arch' | 'ubuntu' | 'centos' | 'windows-10' | 'windows-server'

export type VMStatus = 'stopped' | 'starting' | 'running' | 'stopping' | 'error'

export interface VMNetwork {
  ip?: string
  port?: number
  protocol?: 'vnc' | 'ssh' | 'rdp'
}

export interface VM {
  id: string
  name: string
  ownerId: string
  distro: Distro
  status: VMStatus
  createdAt: string
  updatedAt: string
  notes?: string
  network?: VMNetwork
  consoleUrl?: string // URL for embedded console (ex: noVNC gateway)
  resources?: {
    cpu: number
    memory: number
    storage: number
  }
  templateId?: string
  category?: 'penetration-testing' | 'malware-analysis' | 'forensics' | 'red-team' | 'blue-team' | 'research'
}

export interface VMProvisionRequest {
  name: string
  distro: Distro
  notes?: string
  templateId?: string
  resources?: {
    cpu: number
    memory: number
    storage: number
  }
}

export interface VirtualLabState {
  vms: VM[]
  lastSync?: string
}
