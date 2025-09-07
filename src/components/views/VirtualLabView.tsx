import { useState } from 'react';
import { Plus, Play, Stop, Trash } from '@/lib/phosphor-icons-wrapper';
import { useVirtualLab } from '@/hooks/useVirtualLab';
import type { User } from '@/types/user';
import type { VM } from '@/types/virtual-lab';
import { CreateVMForm } from '@/components/virtual-lab/CreateVMForm';
import { VMConsole } from '@/components/virtual-lab/VMConsole';

interface Props {
  currentUser: User
}

export function VirtualLabView({ currentUser }: Props) {
  const { vms, provision, start, stop, destroy } = useVirtualLab(currentUser.id);
  const [showCreate, setShowCreate] = useState(vms.length === 0);
  const [selected, setSelected] = useState<VM | null>(vms[0] ?? null);

  function handleCreate(data: { name: string; distro: 'kali' | 'arch'; notes?: string }) {
    const vm = provision(data);
    setShowCreate(false);
    setSelected(vm);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Virtual Lab</h2>
          <p className="text-sm text-muted-foreground">Provision Kali or Arch VMs and access a web console.</p>
        </div>
        <button className="glass-button px-3 py-2 rounded-md flex items-center gap-2" onClick={() => setShowCreate(v => !v)}>
          <Plus /> New VM
        </button>
      </div>

      {showCreate && (
        <div className="glass-card p-4">
          <CreateVMForm onCreate={handleCreate} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 glass-card p-3 space-y-2">
          <h3 className="font-medium">My VMs</h3>
          {vms.length === 0 && (
            <p className="text-sm text-muted-foreground">No VMs yet. Create one to get started.</p>
          )}
          <ul className="space-y-2">
            {vms.map(vm => (
              <li key={vm.id} className={`p-2 rounded-md border border-border hover-red-glow cursor-pointer ${selected?.id === vm.id ? 'bg-accent/10 border-accent' : ''}`} onClick={() => setSelected(vm)}>
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{vm.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{vm.distro.toUpperCase()} • {vm.status}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {vm.status !== 'running' ? (
                      <button className="px-2 py-1 text-xs rounded-md glass-button" onClick={(e) => { e.stopPropagation(); start(vm.id); }}>
                        <Play />
                      </button>
                    ) : (
                      <button className="px-2 py-1 text-xs rounded-md glass-button" onClick={(e) => { e.stopPropagation(); stop(vm.id); }}>
                        <Stop />
                      </button>
                    )}
                    <button className="px-2 py-1 text-xs rounded-md glass-button" onClick={(e) => { e.stopPropagation(); destroy(vm.id); if (selected?.id === vm.id) {setSelected(null);} }}>
                      <Trash />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2 space-y-3">
          {!selected ? (
            <div className="glass-card p-6 text-sm text-muted-foreground">Select a VM to view details and open the console.</div>
          ) : (
            <>
              <div className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{selected.name}</h3>
                    <p className="text-xs text-muted-foreground">Status: {selected.status} • Distro: {selected.distro.toUpperCase()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selected.status !== 'running' ? (
                      <button className="px-3 py-2 text-sm rounded-md glass-button" onClick={() => start(selected.id)}>
                        <Play /> Start
                      </button>
                    ) : (
                      <button className="px-3 py-2 text-sm rounded-md glass-button" onClick={() => stop(selected.id)}>
                        <Stop /> Stop
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <VMConsole vm={selected} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
