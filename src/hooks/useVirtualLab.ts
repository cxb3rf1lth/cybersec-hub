import { useEffect, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { v4 as uuidv4 } from 'uuid'
import type { VM, VMProvisionRequest, VirtualLabState } from '@/types/virtual-lab'

const STORAGE_KEY = 'virtualLabState'

export function useVirtualLab(currentUserId: string) {
  const [stateRaw, setState] = useKV<VirtualLabState>(STORAGE_KEY, { vms: [] })
  const state: VirtualLabState = stateRaw ?? { vms: [] }

  // Auto-migrate old shapes if any
  useEffect(() => {
    if (!state || !Array.isArray(state.vms)) {
      setState({ vms: [] })
    }
  }, [state, setState])

  const myVMs = useMemo(() => state.vms.filter(v => v.ownerId === currentUserId), [state.vms, currentUserId])

  function provision(req: VMProvisionRequest): VM {
    const now = new Date().toISOString()
    const id = uuidv4()
    const vm: VM = {
      id,
      name: req.name,
      ownerId: currentUserId,
      distro: req.distro,
      status: 'starting',
      createdAt: now,
      updatedAt: now,
      notes: req.notes,
      network: { protocol: 'vnc' },
      resources: req.resources || { cpu: 2, memory: 4096, storage: 40 },
      templateId: req.templateId,
      category: req.templateId ? getTemplateCategory(req.templateId) : 'penetration-testing'
    }
    setState({ ...state, vms: [vm, ...state.vms], lastSync: now })
    
    // Simulate startup and console URL assignment
    setTimeout(() => {
      setState((prev0 => {
        const prev = prev0 ?? { vms: [] }
        const updated: VM[] = prev.vms.map(v =>
          v.id === id
            ? {
                ...v,
                status: 'running',
                updatedAt: new Date().toISOString(),
                network: { ...v.network, ip: '127.0.0.1', port: 6080, protocol: 'vnc' },
                consoleUrl: `/novnc.html?vm=${id}`,
              }
            : v,
        )
        const result: VirtualLabState = { ...prev, vms: updated, lastSync: new Date().toISOString() }
        return result
      }) as any)
    }, 1200)
    return vm
  }
    if (templateId.includes('blue-team')) return 'blue-team'
    if (templateId.includes('malware')) return 'malware-analysis'
    if (templateId.includes('forensics')) return 'forensics'
    return 'penetration-testing'
  }

  function start(id: string) {
    transition(id, 'starting', 'running')
  }

  function start(id: string) {
    transition(id, 'starting', 'running')
  }

  function stop(id: string) {
    transition(id, 'stopping', 'stopped')
  }

  function destroy(id: string) {
    const now = new Date().toISOString()
    setState({ ...state, vms: state.vms.filter(v => v.id !== id), lastSync: now })
  }

  function updateNotes(id: string, notes: string) {
    const now = new Date().toISOString()
    setState({
      ...state,
      vms: state.vms.map(v => (v.id === id ? { ...v, notes, updatedAt: now } : v)),
      lastSync: now,
    })
  }

  function transition(id: string, interim: VM['status'], finalState: VM['status']) {
    const now = new Date().toISOString()
    setState({
      ...state,
      vms: state.vms.map(v => (v.id === id ? { ...v, status: interim, updatedAt: now } : v)),
      lastSync: now,
    })
    setTimeout(() => {
      setState((prev0 => {
        const prev = prev0 ?? { vms: [] }
        const updated: VM[] = prev.vms.map(v => (v.id === id ? { ...v, status: finalState, updatedAt: new Date().toISOString() } : v))
        const result: VirtualLabState = { ...prev, vms: updated, lastSync: new Date().toISOString() }
        return result
      }) as any)
    }, 800)
  }

  return {
    vms: myVMs,
  all: state.vms,
    provision,
    start,
    stop,
    destroy,
    updateNotes,
  }
}
