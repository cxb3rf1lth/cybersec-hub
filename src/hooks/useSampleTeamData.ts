import { useKV } from '@github/spark/hooks'
import { useEffect } from 'react'
import { Team, TeamRole, Permission, TeamType } from '@/types/teams'

export function useSampleTeamData() {
  const [teams, setTeams] = useKV<Team[]>('teams', [])
  const [teamRoles, setTeamRoles] = useKV<TeamRole[]>('teamRoles', [])
  const [permissions, setPermissions] = useKV<Permission[]>('permissions', [])

  useEffect(() => {
    if (permissions.length === 0) {
      const samplePermissions: Permission[] = [
        // Project permissions
        { id: 'create-project', name: 'Create Projects', description: 'Create new projects and contracts', category: 'project' },
        { id: 'edit-project', name: 'Edit Projects', description: 'Modify project details and requirements', category: 'project' },
        { id: 'delete-project', name: 'Delete Projects', description: 'Remove projects from the team', category: 'project' },
        { id: 'assign-tasks', name: 'Assign Tasks', description: 'Assign tasks to team members', category: 'project' },
        { id: 'review-work', name: 'Review Work', description: 'Review and approve team member submissions', category: 'project' },
        
        // Team permissions
        { id: 'invite-members', name: 'Invite Members', description: 'Send invitations to new team members', category: 'team' },
        { id: 'remove-members', name: 'Remove Members', description: 'Remove members from the team', category: 'team' },
        { id: 'manage-roles', name: 'Manage Roles', description: 'Assign and modify member roles', category: 'team' },
        { id: 'view-applications', name: 'View Applications', description: 'View and process team applications', category: 'team' },
        { id: 'approve-applications', name: 'Approve Applications', description: 'Accept or reject team applications', category: 'team' },
        
        // Earnings permissions
        { id: 'view-earnings', name: 'View Earnings', description: 'View team earnings and distribution', category: 'earnings' },
        { id: 'manage-distribution', name: 'Manage Distribution', description: 'Configure earnings distribution rules', category: 'earnings' },
        { id: 'process-payments', name: 'Process Payments', description: 'Initiate and manage payment distributions', category: 'earnings' },
        { id: 'view-contracts', name: 'View Contracts', description: 'View active and completed contracts', category: 'earnings' },
        
        // Admin permissions
        { id: 'team-settings', name: 'Team Settings', description: 'Modify team settings and configuration', category: 'admin' },
        { id: 'delete-team', name: 'Delete Team', description: 'Permanently delete the team', category: 'admin' },
        { id: 'transfer-ownership', name: 'Transfer Ownership', description: 'Transfer team ownership to another member', category: 'admin' },
        { id: 'view-analytics', name: 'View Analytics', description: 'Access team performance analytics', category: 'admin' }
      ]
      setPermissions(samplePermissions)
    }

    if (teamRoles.length === 0) {
      const sampleRoles: TeamRole[] = [
        {
          id: 'team-leader',
          name: 'Team Leader',
          description: 'Overall team leadership and strategic direction',
          permissions: [
            'create-project', 'edit-project', 'delete-project', 'assign-tasks', 'review-work',
            'invite-members', 'remove-members', 'manage-roles', 'view-applications', 'approve-applications',
            'view-earnings', 'manage-distribution', 'process-payments', 'view-contracts',
            'team-settings', 'delete-team', 'transfer-ownership', 'view-analytics'
          ],
          defaultEarningsPercentage: 25,
          priority: 100,
          color: '#FFD700'
        },
        {
          id: 'senior-security-engineer',
          name: 'Senior Security Engineer',
          description: 'Advanced technical expertise and mentorship',
          permissions: [
            'create-project', 'edit-project', 'assign-tasks', 'review-work',
            'invite-members', 'view-applications',
            'view-earnings', 'view-contracts',
            'view-analytics'
          ],
          defaultEarningsPercentage: 20,
          priority: 80,
          color: '#9B59B6'
        },
        {
          id: 'security-engineer',
          name: 'Security Engineer',
          description: 'Core security implementation and analysis',
          permissions: [
            'edit-project', 'assign-tasks',
            'view-earnings', 'view-contracts'
          ],
          defaultEarningsPercentage: 15,
          priority: 60,
          color: '#3498DB'
        },
        {
          id: 'penetration-tester',
          name: 'Penetration Tester',
          description: 'Specialized in offensive security testing',
          permissions: [
            'edit-project',
            'view-earnings', 'view-contracts'
          ],
          defaultEarningsPercentage: 15,
          priority: 60,
          color: '#E74C3C'
        },
        {
          id: 'security-analyst',
          name: 'Security Analyst',
          description: 'Analysis and investigation of security issues',
          permissions: [
            'view-earnings', 'view-contracts'
          ],
          defaultEarningsPercentage: 12,
          priority: 40,
          color: '#27AE60'
        },
        {
          id: 'junior-security-engineer',
          name: 'Junior Security Engineer',
          description: 'Entry-level security engineer role',
          permissions: [
            'view-earnings', 'view-contracts'
          ],
          defaultEarningsPercentage: 8,
          priority: 20,
          color: '#F39C12'
        },
        {
          id: 'security-researcher',
          name: 'Security Researcher',
          description: 'Research-focused security specialist',
          permissions: [
            'view-earnings', 'view-contracts'
          ],
          defaultEarningsPercentage: 10,
          priority: 50,
          color: '#8E44AD'
        }
      ]
      setTeamRoles(sampleRoles)
    }

    if (teams.length === 0) {
      const sampleTeams: Team[] = [
        {
          id: 'cyber-hawks',
          name: 'Cyber Hawks',
          description: 'Elite red team specializing in advanced persistent threat simulation and enterprise penetration testing.',
          type: 'red-team',
          specialization: ['penetration-testing', 'social-engineering', 'malware-analysis', 'exploit-development'],
          status: 'active',
          privacy: 'public',
          members: [
            {
              id: 'member-1',
              userId: 'user-1',
              username: 'alex_hunter',
              avatar: '/src/assets/images/avatars/avatar-1.jpg',
              role: { ...teamRoles.find(r => r.id === 'team-leader')! },
              permissions: teamRoles.find(r => r.id === 'team-leader')!.permissions,
              earningsPercentage: 30,
              joinedAt: '2024-01-15',
              status: 'active',
              specializations: ['penetration-testing', 'exploit-development'],
              contribution: 95
            },
            {
              id: 'member-2',
              userId: 'user-2',
              username: 'sarah_davis',
              avatar: '/src/assets/images/avatars/avatar-2.jpg',
              role: { ...teamRoles.find(r => r.id === 'senior-security-engineer')! },
              permissions: teamRoles.find(r => r.id === 'senior-security-engineer')!.permissions,
              earningsPercentage: 25,
              joinedAt: '2024-01-20',
              status: 'active',
              specializations: ['malware-analysis', 'reverse-engineering'],
              contribution: 88
            },
            {
              id: 'member-3',
              userId: 'user-3',
              username: 'mike_chen',
              avatar: '/src/assets/images/avatars/avatar-3.jpg',
              role: { ...teamRoles.find(r => r.id === 'penetration-tester')! },
              permissions: teamRoles.find(r => r.id === 'penetration-tester')!.permissions,
              earningsPercentage: 20,
              joinedAt: '2024-02-01',
              status: 'active',
              specializations: ['web-application-security', 'network-security'],
              contribution: 82
            }
          ],
          maxMembers: 8,
          requiredRoles: ['team-leader', 'senior-security-engineer'],
          leaderId: 'user-1',
          moderators: ['user-2'],
          totalEarnings: 125000,
          activeContracts: 3,
          completedBounties: 47,
          averageRating: 4.8,
          createdAt: '2024-01-15',
          lastActive: '2024-12-16',
          verified: true,
          tags: ['elite', 'enterprise', 'advanced-threats'],
          location: 'Remote',
          minExperience: 3,
          requiredCertifications: ['OSCP', 'CEH'],
          applicationRequired: true
        },
        {
          id: 'defense-matrix',
          name: 'Defense Matrix',
          description: 'Blue team specialists focused on threat detection, incident response, and security monitoring.',
          type: 'blue-team',
          specialization: ['incident-response', 'threat-hunting', 'forensics', 'security-monitoring'],
          status: 'recruiting',
          privacy: 'public',
          members: [
            {
              id: 'member-4',
              userId: 'user-4',
              username: 'lisa_wong',
              avatar: '/src/assets/images/avatars/avatar-4.jpg',
              role: { ...teamRoles.find(r => r.id === 'team-leader')! },
              permissions: teamRoles.find(r => r.id === 'team-leader')!.permissions,
              earningsPercentage: 28,
              joinedAt: '2024-02-10',
              status: 'active',
              specializations: ['incident-response', 'digital-forensics'],
              contribution: 92
            },
            {
              id: 'member-5',
              userId: 'user-5',
              username: 'david_kim',
              avatar: '/src/assets/images/avatars/avatar-5.jpg',
              role: { ...teamRoles.find(r => r.id === 'security-analyst')! },
              permissions: teamRoles.find(r => r.id === 'security-analyst')!.permissions,
              earningsPercentage: 18,
              joinedAt: '2024-02-15',
              status: 'active',
              specializations: ['threat-hunting', 'log-analysis'],
              contribution: 79
            }
          ],
          maxMembers: 6,
          requiredRoles: ['team-leader', 'security-analyst'],
          leaderId: 'user-4',
          moderators: [],
          totalEarnings: 78000,
          activeContracts: 2,
          completedBounties: 23,
          averageRating: 4.6,
          createdAt: '2024-02-10',
          lastActive: '2024-12-16',
          verified: true,
          tags: ['defense', 'monitoring', 'response'],
          location: 'Remote',
          minExperience: 2,
          requiredCertifications: ['GCIH', 'SANS'],
          applicationRequired: false
        },
        {
          id: 'bug-bounty-collective',
          name: 'Bug Bounty Collective',
          description: 'Collaborative bug bounty hunters specializing in web applications and mobile security.',
          type: 'bug-bounty',
          specialization: ['web-security', 'mobile-security', 'api-security', 'bug-bounty'],
          status: 'active',
          privacy: 'invite-only',
          members: [
            {
              id: 'member-6',
              userId: 'user-6',
              username: 'emma_rodriguez',
              avatar: '/src/assets/images/avatars/avatar-6.jpg',
              role: { ...teamRoles.find(r => r.id === 'team-leader')! },
              permissions: teamRoles.find(r => r.id === 'team-leader')!.permissions,
              earningsPercentage: 22,
              joinedAt: '2024-03-01',
              status: 'active',
              specializations: ['web-security', 'api-security'],
              contribution: 89
            },
            {
              id: 'member-7',
              userId: 'user-7',
              username: 'james_taylor',
              avatar: '/src/assets/images/avatars/avatar-7.jpg',
              role: { ...teamRoles.find(r => r.id === 'security-engineer')! },
              permissions: teamRoles.find(r => r.id === 'security-engineer')!.permissions,
              earningsPercentage: 20,
              joinedAt: '2024-03-05',
              status: 'active',
              specializations: ['mobile-security', 'reverse-engineering'],
              contribution: 85
            },
            {
              id: 'member-8',
              userId: 'user-8',
              username: 'nina_patel',
              avatar: '/src/assets/images/avatars/avatar-8.jpg',
              role: { ...teamRoles.find(r => r.id === 'security-engineer')! },
              permissions: teamRoles.find(r => r.id === 'security-engineer')!.permissions,
              earningsPercentage: 18,
              joinedAt: '2024-03-10',
              status: 'active',
              specializations: ['web-security', 'cryptography'],
              contribution: 81
            }
          ],
          maxMembers: 5,
          requiredRoles: ['team-leader'],
          leaderId: 'user-6',
          moderators: ['user-7'],
          totalEarnings: 95000,
          activeContracts: 0,
          completedBounties: 156,
          averageRating: 4.9,
          createdAt: '2024-03-01',
          lastActive: '2024-12-16',
          verified: true,
          tags: ['bug-bounty', 'web-security', 'mobile'],
          location: 'Global',
          minExperience: 1,
          requiredCertifications: [],
          applicationRequired: true
        }
      ]
      setTeams(sampleTeams)
    }
  }, [teams, teamRoles, permissions, setTeams, setTeamRoles, setPermissions])

  return { teams, teamRoles, permissions }
}