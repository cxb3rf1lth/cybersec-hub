import { useState } from 'react';
import { useKVWithFallback } from '@/lib/kv-fallback';
import { X, DollarSign, Calendar, FileText, Upload } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MarketplaceListing, MarketplaceProposal } from '@/types/marketplace';
import { Team } from '@/types/teams';
import { User } from '@/types/user';

interface CreateProposalModalProps {
  listing: MarketplaceListing
  team?: Team
  currentUser: User
  isOpen: boolean
  onClose: () => void
}

export function CreateProposalModal({ listing, team, currentUser, isOpen, onClose }: CreateProposalModalProps) {
  const [proposals, setProposals] = useKVWithFallback<MarketplaceProposal[]>('marketplaceProposals', []);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const [timeline, setTimeline] = useState('');
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddRequirement = () => {
    setRequirements([...requirements, '']);
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleRequirementChange = (index: number, value: string) => {
    const updated = [...requirements];
    updated[index] = value;
    setRequirements(updated);
  };

  const handleSubmit = async () => {
    if (!projectTitle.trim() || !projectDescription.trim() || !budget || !timeline.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const budgetNum = parseFloat(budget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      toast.error('Please enter a valid budget amount');
      return;
    }

    setIsSubmitting(true);

    try {
      const newProposal: MarketplaceProposal = {
        id: `proposal-${Date.now()}`,
        listingId: listing.id,
        clientId: currentUser.id,
        teamId: listing.teamId,
        projectTitle: projectTitle.trim(),
        projectDescription: projectDescription.trim(),
        budget: {
          amount: budgetNum,
          currency
        },
        timeline: timeline.trim(),
        requirements: requirements.filter(req => req.trim() !== ''),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      };

      setProposals(current => [...current, newProposal]);
      
      toast.success('Proposal submitted successfully!');
      onClose();
      
      // Reset form
      setProjectTitle('');
      setProjectDescription('');
      setBudget('');
      setCurrency('USD');
      setTimeline('');
      setRequirements(['']);
    } catch (error) {
      toast.error('Failed to submit proposal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Submit Proposal
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Send a project proposal to {team?.name || 'this team'}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service Info */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <h3 className="font-semibold text-foreground">{listing.title}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Price Range: ${listing.priceRange.min.toLocaleString()} - ${listing.priceRange.max.toLocaleString()}</span>
              <span>Duration: {listing.duration}</span>
              <span>Rating: {listing.rating}★</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {listing.skills.slice(0, 5).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Project Title */}
          <div className="space-y-2">
            <Label htmlFor="project-title">Project Title *</Label>
            <Input
              id="project-title"
              placeholder="e.g., E-commerce Platform Security Assessment"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
            />
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <Label htmlFor="project-description">Project Description *</Label>
            <Textarea
              id="project-description"
              placeholder="Describe your project requirements, scope, and objectives..."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* Budget */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="budget">Budget *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="budget"
                  type="number"
                  placeholder="15000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={(value: any) => setCurrency(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <Label htmlFor="timeline">Project Timeline *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="timeline"
                placeholder="e.g., 4-6 weeks"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <Label>Project Requirements</Label>
            <div className="space-y-2">
              {requirements.map((requirement, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="e.g., OWASP Top 10 testing"
                    value={requirement}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                  />
                  {requirements.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRequirement(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddRequirement}
                className="w-full"
              >
                Add Requirement
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}