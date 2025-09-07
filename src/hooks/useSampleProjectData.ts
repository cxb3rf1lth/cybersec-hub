import { useEffect } from 'react'
import { useKVWithFallback } from '@/lib/kv-fallback'
import { Project, Team, Task } from '@/types'

export function useSampleProjectData() {
  const [projects, setProjects] = useKVWithFallback<Project[]>('projects', [])
  const [teams, setTeams] = useKVWithFallback<Team[]>('teams', [])

  useEffect(() => {
    // Only initialize if no projects exist
    if (projects.length === 0) {
      const sampleTeam: Team = {
        id: 'team-sample',
        name: 'Elite Security Hunters',
        description: 'A specialized bug bounty team focused on web application security and mobile penetration testing.',
        type: 'bug-bounty',
        ownerId: 'user-1',
        members: [
          {
            userId: 'user-1',
            role: 'owner',
            permissions: [
              { resource: 'projects', actions: ['create', 'read', 'update', 'delete', 'assign'] },
              { resource: 'tasks', actions: ['create', 'read', 'update', 'delete', 'assign'] },
              { resource: 'members', actions: ['create', 'read', 'update', 'delete'] },
              { resource: 'settings', actions: ['create', 'read', 'update', 'delete'] },
              { resource: 'repositories', actions: ['create', 'read', 'update', 'delete', 'assign'] }
            ],
            joinedAt: '2024-01-15T10:00:00Z',
            contribution: 40,
            isActive: true
          },
          {
            userId: 'user-2',
            role: 'admin',
            permissions: [
              { resource: 'projects', actions: ['create', 'read', 'update', 'assign'] },
              { resource: 'tasks', actions: ['create', 'read', 'update', 'delete', 'assign'] },
              { resource: 'members', actions: ['read', 'update'] }
            ],
            joinedAt: '2024-01-20T14:30:00Z',
            contribution: 35,
            isActive: true
          }
        ],
        projects: ['project-1'],
        requiredSkills: ['Web Application Security', 'Mobile Security', 'OWASP Top 10', 'Bug Bounty'],
        maxMembers: 5,
        isPublic: true,
        reputation: 450,
        totalEarnings: 25000,
        successfulProjects: 8,
        createdAt: '2024-01-15T10:00:00Z',
        settings: {
          autoAcceptMembers: false,
          requireSkillVerification: true,
          earningsDistribution: 'contribution-based',
          projectApprovalRequired: true,
          maxProjectsPerMember: 3
        }
      }

      const sampleTasks: Task[] = [
        {
          id: 'task-1',
          title: 'Reconnaissance and Asset Discovery',
          description: 'Perform comprehensive reconnaissance to identify all subdomains, endpoints, and potential attack vectors.',
          assigneeId: 'user-1',
          status: 'completed',
          priority: 'high',
          dueDate: '2024-12-20T00:00:00Z',
          createdAt: '2024-12-10T09:00:00Z',
          updatedAt: '2024-12-18T16:30:00Z',
          comments: [],
          labels: ['reconnaissance', 'OSINT'],
          estimatedHours: 8,
          actualHours: 6
        },
        {
          id: 'task-2',
          title: 'Web Application Security Testing',
          description: 'Conduct thorough testing for common web vulnerabilities including OWASP Top 10.',
          assigneeId: 'user-2',
          status: 'in-progress',
          priority: 'critical',
          dueDate: '2024-12-25T00:00:00Z',
          createdAt: '2024-12-12T11:00:00Z',
          updatedAt: '2024-12-20T14:15:00Z',
          comments: [
            {
              id: 'comment-1',
              authorId: 'user-2',
              content: 'Found potential SQL injection in the login form. Investigating further.',
              createdAt: '2024-12-20T14:15:00Z'
            }
          ],
          labels: ['web-security', 'OWASP'],
          estimatedHours: 16,
          actualHours: 12
        },
        {
          id: 'task-3',
          title: 'Mobile App Penetration Testing',
          description: 'Test the mobile application for security vulnerabilities and insecure data storage.',
          status: 'todo',
          priority: 'medium',
          dueDate: '2024-12-30T00:00:00Z',
          createdAt: '2024-12-15T13:00:00Z',
          updatedAt: '2024-12-15T13:00:00Z',
          comments: [],
          labels: ['mobile-security', 'android', 'iOS'],
          estimatedHours: 20
        },
        {
          id: 'task-4',
          title: 'Report Writing and Documentation',
          description: 'Compile findings into a comprehensive security assessment report with remediation recommendations.',
          status: 'todo',
          priority: 'medium',
          createdAt: '2024-12-16T10:00:00Z',
          updatedAt: '2024-12-16T10:00:00Z',
          comments: [],
          labels: ['documentation', 'reporting'],
          estimatedHours: 6
        }
      ]

      const sampleProject: Project = {
        id: 'project-1',
        name: 'TechCorp Bug Bounty Program',
        description: 'Comprehensive security assessment of TechCorp\'s web and mobile applications with focus on critical vulnerabilities.',
        type: 'bug-bounty',
        status: 'active',
        ownerId: 'user-1',
        teamId: 'team-sample',
        milestones: [
          {
            id: 'milestone-1',
            title: 'Initial Assessment Phase',
            description: 'Complete reconnaissance and initial vulnerability scanning',
            dueDate: '2024-12-22T00:00:00Z',
            status: 'completed',
            progress: 100,
            tasks: ['task-1'],
            createdAt: '2024-12-10T09:00:00Z'
          },
          {
            id: 'milestone-2',
            title: 'Deep Security Testing',
            description: 'Perform comprehensive penetration testing on web and mobile apps',
            dueDate: '2024-12-28T00:00:00Z',
            status: 'active',
            progress: 60,
            tasks: ['task-2', 'task-3'],
            createdAt: '2024-12-12T11:00:00Z'
          },
          {
            id: 'milestone-3',
            title: 'Final Report Delivery',
            description: 'Complete documentation and deliver final security assessment report',
            dueDate: '2024-12-31T00:00:00Z',
            status: 'planning',
            progress: 0,
            tasks: ['task-4'],
            createdAt: '2024-12-16T10:00:00Z'
          }
        ],
        tasks: sampleTasks,
        startDate: '2024-12-10T00:00:00Z',
        endDate: '2024-12-31T00:00:00Z',
        budget: 15000,
        tags: ['bug-bounty', 'web-security', 'mobile-security', 'penetration-testing'],
        visibility: 'team',
        createdAt: '2024-12-10T09:00:00Z',
        updatedAt: '2024-12-20T14:15:00Z'
      }

      // Set the sample data
      setTeams([sampleTeam])
      setProjects([sampleProject])
    }
  }, [projects.length, setProjects, setTeams])
}