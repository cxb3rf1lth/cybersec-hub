import { useEffect } from 'react'
import { useKVWithFallback } from '@/lib/kv-fallback'
import { TeamInvitation } from '@/types/teams'
import { User } from '@/types/user'

export function useUserInvitations(currentUser: User | null) {
  const [invitations, setInvitations] = useKVWithFallback<TeamInvitation[]>('teamInvitations', [])

  useEffect(() => {
    if (!currentUser) return

    // Check if this user already has invitations
    const userInvitations = invitations.filter(inv => inv.targetUserId === currentUser.id)
    
    // If no invitations exist for this user, create some sample ones
    if (userInvitations.length === 0) {
      const sampleInvitations: TeamInvitation[] = [
        {
          id: `invitation-${currentUser.id}-1`,
          teamId: 'cyber-hawks',
          teamName: 'Cyber Hawks',
          inviterId: 'user-1',
          inviterUsername: 'alex_hunter',
          targetUserId: currentUser.id,
          targetUsername: currentUser.username,
          role: 'penetration-tester',
          message: `Hi ${currentUser.username}! We've been following your work and would love to have you join our elite red team. Your expertise would be invaluable to our upcoming enterprise projects.`,
          status: 'pending',
          sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days from now
        },
        {
          id: `invitation-${currentUser.id}-2`,
          teamId: 'defense-matrix',
          teamName: 'Defense Matrix',
          inviterId: 'user-4',
          inviterUsername: 'lisa_wong',
          targetUserId: currentUser.id,
          targetUsername: currentUser.username,
          role: 'security-analyst',
          message: `Hi ${currentUser.username}! We need a skilled analyst to join our incident response team. Your background makes you a perfect fit for our blue team operations.`,
          status: 'pending',
          sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString() // 6 days from now
        }
      ]

      // Only add invitations if the user has appropriate specializations
      const filteredInvitations = sampleInvitations.filter(invitation => {
        // Add red team invitation if user has relevant specializations
        if (invitation.teamId === 'cyber-hawks') {
          return currentUser.specializations.some(spec => 
            ['Penetration Testing', 'Red Team', 'Ethical Hacking', 'Bug Bounty'].includes(spec)
          )
        }
        
        // Add blue team invitation if user has relevant specializations
        if (invitation.teamId === 'defense-matrix') {
          return currentUser.specializations.some(spec => 
            ['Blue Team', 'Incident Response', 'Threat Hunting', 'Security Research'].includes(spec)
          )
        }
        
        return false
      })

      if (filteredInvitations.length > 0) {
        setInvitations(current => [...current, ...filteredInvitations])
      }
    }
  }, [currentUser, invitations, setInvitations])

  return { invitations }
}