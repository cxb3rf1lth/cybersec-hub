import { X } from '@/lib/phosphor-icons-wrapper';
import { Button } from '@/components/ui/button';
import { Project, User } from '@/types';

interface ProjectDetailsModalProps {
  project: Project
  currentUser: User
  onClose: () => void
  onUpdateProject: (project: Project) => void
}

export function ProjectDetailsModal({ project, currentUser, onClose, onUpdateProject }: ProjectDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">{project.name}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="p-6">
          <p className="text-muted-foreground mb-4">{project.description}</p>
          <p className="text-sm text-muted-foreground">
            Project details modal - implementation coming soon
          </p>
        </div>
      </div>
    </div>
  );
}