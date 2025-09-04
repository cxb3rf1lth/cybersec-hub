import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { apiKeyManager, API_SERVICES, type ApiServiceKey } from '@/lib/api-keys';
import { toast } from 'sonner';

export interface ApiKeyManagerProps {
  visible: boolean;
  onClose: () => void;
  onApply: (service: ApiServiceKey, key: string) => void;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ visible, onClose, onApply }) => {
  const [apiKey, setApiKey] = useState('');
  const [service, setService] = useState<ApiServiceKey>('SHODAN');
  const services = useMemo(() => Object.keys(API_SERVICES) as ApiServiceKey[], []);

  const handleApply = () => {
    if (apiKey.trim()) {
      const key = apiKey.trim();
      onApply(service, key);
      // Persist via ApiKeyManager
      apiKeyManager.saveApiKey(service, key)
        .then(() => {
          toast.success(`${API_SERVICES[service].name} key saved`);
          setApiKey('');
          onClose();
        })
        .catch((err) => {
          toast.error(`Failed to save key: ${err instanceof Error ? err.message : 'Unknown error'}`);
        });
    }
  };

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="api-key-dialog glass-effect dark-theme">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-red-500 glitch">Enter API Key</DialogTitle>
          <DialogDescription>Keys are saved locally and validated against the selected provider.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground min-w-24">Service</label>
            <Select value={service} onValueChange={(v) => setService(v as ApiServiceKey)}>
              <SelectTrigger className="min-w-[220px]">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s} value={s}>
                    {API_SERVICES[s].name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input
            type="text"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="Paste your API key here"
            className="bg-black bg-opacity-60 text-white border-red-500 focus:ring-red-500 rounded shadow-lg"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="default" onClick={handleApply} className="glitch-effect">Apply</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
