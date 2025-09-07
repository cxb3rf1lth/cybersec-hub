import { useState } from 'react';
import { useKVWithFallback } from '@/lib/kv-fallback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { X, Users, Shield, Eye } from '@/lib/phosphor-icons-wrapper';
import { toast } from 'sonner';
import { TeamInfo, User } from '@/types';

interface CreateTeamModalProps {
  currentUser: User
  onClose: () => void
  onTeamCreated: (team: TeamInfo) => void
}

export function CreateTeamModal({ currentUser, onClose, onTeamCreated }: CreateTeamModalProps) {
  const [teams] = useKVWithFallback<TeamInfo[]>('teams', []);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Team name is required');
      return;
    }

    const newTeam: TeamInfo = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      members: [{
        id: currentUser.id,
        username: currentUser.username,
        avatar: currentUser.avatar,
        role: 'owner',
        joinedAt: new Date(),
        lastActive: new Date(),
        permissions: {
          canEdit: true,
          canDelete: true,
          canInvite: true,
          canManagePermissions: true,
          canCreateBranches: true,
          canMergeBranches: true,
          canPublish: true
        }
      }],
      createdAt: new Date(),
      isPublic: formData.isPublic
    };

    try {
      await spark.kv.set('teams', [...teams, newTeam]);
      toast.success('Team created successfully!');
      onTeamCreated(newTeam);
      onClose();
    } catch (error) {
      toast.error('Failed to create team');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Create Team</h2>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="team-name">Team Name</Label>
            <Input
              id="team-name"
              placeholder="Enter team name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-description">Description</Label>
            <Textarea
              id="team-description"
              placeholder="Describe your team's focus and goals"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full min-h-20"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              {formData.isPublic ? (
                <Eye className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Shield className="w-4 h-4 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {formData.isPublic ? 'Public Team' : 'Private Team'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formData.isPublic 
                    ? 'Anyone can discover and request to join'
                    : 'Only invited members can join'
                  }
                </p>
              </div>
            </div>
            <Switch
              checked={formData.isPublic}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Team
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}