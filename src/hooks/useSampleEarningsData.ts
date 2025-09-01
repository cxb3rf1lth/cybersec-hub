import { useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Earning, EarningsGoal, EarningType, EarningSource, PaymentStatus } from '@/types/earnings'

export function useSampleEarningsData() {
  const [earnings, setEarnings] = useKV<Earning[]>('sample-earnings', [])
  const [goals, setGoals] = useKV<EarningsGoal[]>('sample-goals', [])

  useEffect(() => {
    // Only generate sample data if none exists
    if (earnings.length === 0) {
      const sampleEarnings: Earning[] = [
        {
          id: '1',
          userId: 'alice-chen',
          teamId: 'red-hawks',
          projectId: 'proj-1',
          amount: 5000,
          currency: 'USD',
          type: 'bug-bounty' as EarningType,
          status: 'paid' as PaymentStatus,
          source: 'team-project' as EarningSource,
          description: 'Critical SQL injection vulnerability discovered',
          earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          taxable: true,
          category: 'web-security',
          tags: ['sql-injection', 'critical', 'web-app'],
          teamName: 'Red Hawks',
          projectName: 'E-commerce Security Audit',
          clientName: 'TechCorp Inc.',
          paymentMethod: 'bank-transfer',
          transactionId: 'TXN-001',
          fees: 50,
          netAmount: 4950
        },
        {
          id: '2',
          userId: 'alice-chen',
          amount: 2500,
          currency: 'USD',
          type: 'penetration-test' as EarningType,
          status: 'paid' as PaymentStatus,
          source: 'individual-bounty' as EarningSource,
          description: 'Network penetration testing for startup',
          earnedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          paidAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          taxable: true,
          category: 'network-security',
          tags: ['penetration-test', 'network', 'startup'],
          clientName: 'StartupXYZ',
          paymentMethod: 'paypal',
          transactionId: 'TXN-002',
          fees: 25,
          netAmount: 2475
        },
        {
          id: '3',
          userId: 'alice-chen',
          teamId: 'cyber-guardians',
          projectId: 'proj-2',
          amount: 3500,
          currency: 'USD',
          type: 'incident-response' as EarningType,
          status: 'processing' as PaymentStatus,
          source: 'team-project' as EarningSource,
          description: 'Emergency incident response and forensics',
          earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          taxable: true,
          category: 'incident-response',
          tags: ['emergency', 'forensics', 'malware'],
          teamName: 'Cyber Guardians',
          projectName: 'Ransomware Response',
          clientName: 'Healthcare Corp',
          paymentMethod: 'wire-transfer',
          fees: 35
        },
        {
          id: '4',
          userId: 'alice-chen',
          amount: 1200,
          currency: 'USD',
          type: 'code-review' as EarningType,
          status: 'pending' as PaymentStatus,
          source: 'platform-reward' as EarningSource,
          description: 'Security code review for open source project',
          earnedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          taxable: true,
          category: 'code-security',
          tags: ['code-review', 'open-source', 'security'],
          projectName: 'OpenSecure Library',
          clientName: 'Open Source Foundation',
          fees: 12
        },
        {
          id: '5',
          userId: 'alice-chen',
          teamId: 'red-hawks',
          amount: 800,
          currency: 'USD',
          type: 'training' as EarningType,
          status: 'paid' as PaymentStatus,
          source: 'partnership' as EarningSource,
          description: 'Cybersecurity workshop for junior developers',
          earnedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          paidAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
          taxable: true,
          category: 'education',
          tags: ['training', 'workshop', 'education'],
          teamName: 'Red Hawks',
          projectName: 'Security Training Program',
          clientName: 'DevBootcamp',
          paymentMethod: 'stripe',
          transactionId: 'TXN-005',
          fees: 8,
          netAmount: 792
        },
        {
          id: '6',
          userId: 'alice-chen',
          amount: 6000,
          currency: 'USD',
          type: 'security-audit' as EarningType,
          status: 'paid' as PaymentStatus,
          source: 'external-contract' as EarningSource,
          description: 'Comprehensive security audit for fintech app',
          earnedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
          paidAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          taxable: true,
          category: 'application-security',
          tags: ['security-audit', 'fintech', 'comprehensive'],
          clientName: 'FinanceApp Ltd',
          paymentMethod: 'bank-transfer',
          transactionId: 'TXN-006',
          fees: 60,
          netAmount: 5940
        },
        {
          id: '7',
          userId: 'alice-chen',
          amount: 400,
          currency: 'USD',
          type: 'referral' as EarningType,
          status: 'paid' as PaymentStatus,
          source: 'referral-bonus' as EarningSource,
          description: 'Referral bonus for team member recruitment',
          earnedAt: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
          paidAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
          taxable: true,
          category: 'bonus',
          tags: ['referral', 'team-building'],
          paymentMethod: 'paypal',
          transactionId: 'TXN-007',
          fees: 4,
          netAmount: 396
        },
        {
          id: '8',
          userId: 'alice-chen',
          teamId: 'cyber-guardians',
          amount: 4200,
          currency: 'USD',
          type: 'consulting' as EarningType,
          status: 'paid' as PaymentStatus,
          source: 'team-project' as EarningSource,
          description: 'Security architecture consulting',
          earnedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          paidAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
          taxable: true,
          category: 'consulting',
          tags: ['architecture', 'consulting', 'enterprise'],
          teamName: 'Cyber Guardians',
          projectName: 'Enterprise Security Design',
          clientName: 'MegaCorp',
          paymentMethod: 'wire-transfer',
          transactionId: 'TXN-008',
          fees: 42,
          netAmount: 4158
        }
      ]

      setEarnings(sampleEarnings)
    }

    // Generate sample goals if none exist
    if (goals.length === 0) {
      const sampleGoals: EarningsGoal[] = [
        {
          id: 'goal-1',
          userId: 'alice-chen',
          title: 'Earn $50,000 in Bug Bounties',
          description: 'Focus on high-impact vulnerabilities in web applications and mobile apps',
          targetAmount: 50000,
          currentAmount: 18700, // Based on sample earnings
          currency: 'USD',
          deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months from now
          category: 'bug-bounty',
          priority: 'high',
          status: 'active',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'goal-2',
          userId: 'alice-chen',
          title: 'Monthly Team Earnings Target',
          description: 'Consistent monthly earnings from team projects',
          targetAmount: 8000,
          currentAmount: 6200,
          currency: 'USD',
          deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // End of month
          category: 'consulting',
          priority: 'medium',
          status: 'active',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'goal-3',
          userId: 'alice-chen',
          title: 'Training Revenue Goal',
          description: 'Build passive income through security training and workshops',
          targetAmount: 5000,
          currentAmount: 800,
          currency: 'USD',
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 3 months
          category: 'training',
          priority: 'low',
          status: 'active',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]

      setGoals(sampleGoals)
    }
  }, [earnings.length, goals.length, setEarnings, setGoals])

  return { earnings, goals }
}