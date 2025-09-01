import { useState } from 'react'
import type { Distro, VMProvisionRequest } from '@/types/virtual-lab'

interface Props {
  onCreate: (req: VMProvisionRequest) => void
}

export function CreateVMForm({ onCreate }: Props) {
  const [name, setName] = useState('Lab VM')
  const [distro, setDistro] = useState<Distro>('kali')
  const [notes, setNotes] = useState('')

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        onCreate({ name, distro, notes })
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-3 py-2 rounded-md bg-secondary text-secondary-foreground border border-border"
            placeholder="Ex: Red Team Box"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Distribution</label>
          <select
            value={distro}
            onChange={(e) => setDistro(e.target.value as Distro)}
            className="px-3 py-2 rounded-md bg-secondary text-secondary-foreground border border-border"
          >
            <option value="kali">Kali Linux</option>
            <option value="arch">Arch Linux</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-muted-foreground">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="px-3 py-2 rounded-md bg-secondary text-secondary-foreground border border-border min-h-20"
          placeholder="Purpose, tools to install, etc."
        />
      </div>
      <button type="submit" className="glass-button px-4 py-2 rounded-md hover-red-glow">Create VM</button>
    </form>
  )
}
