import { useEffect, useMemo, useState } from 'react'
import { useKVWithFallback } from '@/lib/kv-fallback'
import { v4 as uuidv4 } from 'uuid'
import { virtualLabService, webSocketService } from '@/lib/production-services'
import { toast } from 'sonner'
import type { VM, VMProvisionRequest, VirtualLabState } from '@/types/virtual-lab'

const STORAGE_KEY = 'virtualLabState'

export function useVirtualLab(currentUserId: string) {
  const [stateRaw, setState] = useKVWithFallback<VirtualLabState>(STORAGE_KEY, { vms: [] })
  const [isProvisioning, setIsProvisioning] = useState(false)
  const state: VirtualLabState = stateRaw ?? { vms: [] }

  // Auto-migrate old shapes if any
  useEffect(() => {
    if (!state || !Array.isArray(state.vms)) {
      setState({ vms: [] })
    }
  }, [state, setState])

  // Initialize real-time VM updates
  useEffect(() => {
    if (currentUserId) {
      webSocketService.on('vm_status_update', handleVMStatusUpdate)
      webSocketService.subscribe(`user:${currentUserId}:vms`)
      
      // Load existing VMs from production service
      loadVMsFromProduction()
    }

    return () => {
      webSocketService.off('vm_status_update', handleVMStatusUpdate)
    }
  }, [currentUserId])

  const handleVMStatusUpdate = (data: any) => {
    setState(prev => {
      const current = prev ?? { vms: [] }
      const updatedVMs = current.vms.map(vm => 
        vm.id === data.vmId 
          ? { ...vm, status: data.status, updatedAt: new Date().toISOString() }
          : vm
      )
      return { ...current, vms: updatedVMs }
    })
  }

  const loadVMsFromProduction = async () => {
    try {
      const productionVMs = await virtualLabService.listVMs()
      
      // Convert production VM format to local format
      const localVMs: VM[] = productionVMs.map(pvm => ({
        id: pvm.id,
        name: pvm.name,
        ownerId: currentUserId,
        distro: pvm.type || 'kali',
        status: pvm.status as VM['status'],
        createdAt: pvm.createdAt,
        updatedAt: pvm.lastAccessed,
        notes: pvm.description || '',
        network: {
          protocol: 'vnc',
          ip: pvm.network?.publicIP,
          port: pvm.network?.ports?.[0]?.host
        },
        resources: {
          cpu: pvm.resources?.cpu || 2,
          memory: pvm.resources?.memory * 1024 || 4096,
          storage: pvm.resources?.storage || 40
        },
        templateId: pvm.type,
        category: 'penetration-testing'
      }))

      setState(prev => ({ ...prev, vms: localVMs }))
    } catch (error) {
      console.error('Failed to load VMs from production:', error)
      // Continue with local state
    }
  }

  const myVMs = useMemo(() => state.vms.filter(v => v.ownerId === currentUserId), [state.vms, currentUserId])

  async function provision(req: VMProvisionRequest): Promise<VM> {
    setIsProvisioning(true)
    
    try {
      // Create VM using production service
      const productionVM = await virtualLabService.createVM({
        name: req.name,
        type: req.distro,
        resources: {
          cpu: req.resources?.cpu || 2,
          memory: Math.floor((req.resources?.memory || 4096) / 1024),
          storage: req.resources?.storage || 40,
          gpu: false
        },
        config: {
          desktop: true,
          persistence: true,
          timeLimit: 480, // 8 hours
          autoDestroy: false
        }
      })

      // Convert to local VM format
      const vm: VM = {
        id: productionVM.id,
        name: productionVM.name,
        ownerId: currentUserId,
        distro: req.distro,
        status: 'starting',
        createdAt: productionVM.createdAt,
        updatedAt: productionVM.createdAt,
        notes: req.notes,
        network: { protocol: 'vnc' },
        resources: req.resources || { cpu: 2, memory: 4096, storage: 40 },
        templateId: req.templateId,
        category: req.templateId ? getTemplateCategory(req.templateId) : 'penetration-testing'
      }

      setState({ ...state, vms: [vm, ...state.vms], lastSync: new Date().toISOString() })
      
      toast.success('Virtual machine is being created...')
      return vm
    } catch (error) {
      console.error('VM provisioning failed:', error)
      toast.error('Failed to create virtual machine')
      
      // Fallback to local simulation
      return provisionLocal(req)
    } finally {
      setIsProvisioning(false)
    }
  }

  function provisionLocal(req: VMProvisionRequest): VM {
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

  function getTemplateCategory(templateId: string): VM['category'] {
    if (templateId.includes('blue-team')) return 'blue-team'
    if (templateId.includes('malware')) return 'malware-analysis'
    if (templateId.includes('forensics')) return 'forensics'
    return 'penetration-testing'
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
