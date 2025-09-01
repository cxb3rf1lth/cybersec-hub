export type Distro = 'kali' | 'arch'

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
}

export interface VMProvisionRequest {
  name: string
  distro: Distro
  notes?: string
}

export interface VirtualLabState {
  vms: VM[]
  lastSync?: string
}
