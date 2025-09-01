import { useEffect, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { v4 as uuidv4 } from 'uuid'
import type { VM, VMProvisionRequest, VirtualLabState } from '@/types/virtual-lab'

const STORAGE_KEY = 'virtualLabState'

export function useVirtualLab(currentUserId: string) {
  const [state, setState] = useKV<VirtualLabState>(STORAGE_KEY, { vms: [] })

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
    }
    setState({ ...state, vms: [vm, ...state.vms], lastSync: now })
    // Simulate startup and console URL assignment
    setTimeout(() => {
      setState(prev => {
        const updated = prev.vms.map(v =>
          v.id === id
            ? {
                ...v,
                status: 'running',
                updatedAt: new Date().toISOString(),
                network: { ...v.network, ip: '127.0.0.1', port: 6080, protocol: 'vnc' },
                consoleUrl: `/novnc?vm=${id}`,
              }
            : v,
        )
        return { ...prev, vms: updated, lastSync: new Date().toISOString() }
      })
    }, 1200)
    return vm
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

  function updateNotes(id: string, notes?: string) {
    const now = new Date().toISOString()
    if (!state || !Array.isArray(state.vms)) {
      setState({ vms: [], lastSync: now })
      return
    }
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
      setState(prev => ({
        ...prev,
        vms: prev.vms.map(v => (v.id === id ? { ...v, status: finalState, updatedAt: new Date().toISOString() } : v)),
        lastSync: new Date().toISOString(),
      }))
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
