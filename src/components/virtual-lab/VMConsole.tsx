import type { VM } from '@/types/virtual-lab'

interface Props {
  vm: VM
}

export function VMConsole({ vm }: Props) {
  const url = vm.consoleUrl || '#'
  const isRunning = vm.status === 'running'

  return (
    <div className="flex flex-col gap-2 w-full h-[420px] border border-border rounded-md overflow-hidden glass-card">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-secondary/50">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <strong>{vm.name}</strong>
          <span className="text-xs text-muted-foreground">{vm.distro.toUpperCase()}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {isRunning ? 'Connected' : vm.status}
        </div>
      </div>
      {isRunning ? (
        <iframe
          src={url}
          title={`Console ${vm.name}`}
          className="w-full flex-1 bg-black"
          allow="clipboard-read; clipboard-write"
        />
      ) : (
        <div className="flex-1 grid place-items-center text-sm text-muted-foreground">
          Console available when VM is running.
        </div>
      )}
    </div>
  )
}
