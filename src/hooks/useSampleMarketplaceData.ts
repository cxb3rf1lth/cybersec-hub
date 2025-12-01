import { useKVWithFallback } from '@/lib/kv-fallback'
import { useEffect } from 'react'
import { MarketplaceListing, MarketplaceProposal, MarketplaceReview } from '@/types/marketplace'

export function useSampleMarketplaceData() {
  const [listings, setListings] = useKVWithFallback<MarketplaceListing[]>('marketplaceListings', [])
  const [proposals, setProposals] = useKVWithFallback<MarketplaceProposal[]>('marketplaceProposals', [])
  const [reviews, setReviews] = useKVWithFallback<MarketplaceReview[]>('marketplaceReviews', [])

  useEffect(() => {
    if (listings.length === 0) {
      const sampleListings: MarketplaceListing[] = [
        {
          id: 'listing-1',
          teamId: 'team-1',
          title: 'Expert Penetration Testing Services',
          description: 'Comprehensive security assessments for web applications, networks, and mobile apps. Our certified team has 8+ years of experience in finding critical vulnerabilities.',
          category: 'penetration-testing',
          skills: ['OWASP Top 10', 'Network Security', 'Web Application Security', 'Mobile Security', 'API Testing'],
          priceRange: {
            min: 5000,
            max: 25000,
            currency: 'USD'
          },
          duration: '2-4 weeks',
          availability: 'within-week',
          portfolio: [
            {
              projectName: 'E-commerce Platform Security Audit',
              description: 'Complete security assessment of a major e-commerce platform handling 100K+ daily transactions',
              technologies: ['React', 'Node.js', 'MongoDB', 'AWS'],
              caseStudyUrl: '#'
            },
            {
              projectName: 'Banking Application Penetration Test',
              description: 'Critical vulnerability assessment for a mobile banking application',
              technologies: ['Flutter', 'Firebase', 'OAuth 2.0'],
              caseStudyUrl: '#'
            }
          ],
          certifications: ['OSCP', 'CEH', 'CISSP', 'GPEN'],
          rating: 4.9,
          reviewCount: 47,
          completedProjects: 156,
          responseTime: '< 4 hours',
          featured: true,
          createdAt: '2024-01-15T00:00:00Z',
          updatedAt: '2024-01-20T00:00:00Z',
          status: 'active'
        },
        {
          id: 'listing-2',
          teamId: 'team-2',
          title: 'Red Team Operations & Attack Simulation',
          description: 'Realistic adversarial simulations to test your organization\'s detection and response capabilities. Specialized in advanced persistent threat (APT) simulation.',
          category: 'red-team',
          skills: ['Social Engineering', 'Phishing Campaigns', 'Physical Security', 'Active Directory', 'C2 Frameworks'],
          priceRange: {
            min: 15000,
            max: 50000,
            currency: 'USD'
          },
          duration: '4-8 weeks',
          availability: 'within-month',
          portfolio: [
            {
              projectName: 'Fortune 500 Red Team Assessment',
              description: 'Multi-vector attack simulation targeting a global corporation with 50,000+ employees',
              technologies: ['Cobalt Strike', 'Empire', 'PowerShell', 'Mimikatz'],
              caseStudyUrl: '#'
            }
          ],
          certifications: ['OSEP', 'CRTO', 'GREM', 'GCIH'],
          rating: 4.8,
          reviewCount: 23,
          completedProjects: 89,
          responseTime: '< 12 hours',
          featured: true,
          createdAt: '2024-01-10T00:00:00Z',
          updatedAt: '2024-01-18T00:00:00Z',
          status: 'active'
        },
        {
          id: 'listing-3',
          teamId: 'team-3',
          title: 'Bug Bounty Program Management',
          description: 'Complete bug bounty program setup and management. We help establish responsible disclosure programs and manage security researcher relationships.',
          category: 'bug-bounty',
          skills: ['Vulnerability Assessment', 'Triage', 'Program Management', 'HackerOne', 'Bugcrowd'],
          priceRange: {
            min: 3000,
            max: 15000,
            currency: 'USD'
          },
          duration: '1-3 months',
          availability: 'immediate',
          portfolio: [
            {
              projectName: 'SaaS Platform Bug Bounty Launch',
              description: 'Successfully launched and managed bug bounty program for a fast-growing SaaS platform',
              technologies: ['React', 'Django', 'PostgreSQL', 'Docker'],
              caseStudyUrl: '#'
            }
          ],
          certifications: ['GCIH', 'GWAPT', 'Bug Bounty Hunter'],
          rating: 4.7,
          reviewCount: 31,
          completedProjects: 78,
          responseTime: '< 6 hours',
          featured: false,
          createdAt: '2024-01-12T00:00:00Z',
          updatedAt: '2024-01-19T00:00:00Z',
          status: 'active'
        },
        {
          id: 'listing-4',
          teamId: 'team-4',
          title: 'Cloud Security Architecture Review',
          description: 'Comprehensive security assessment of cloud infrastructure. Specializing in AWS, Azure, and GCP security best practices and compliance.',
          category: 'security-audit',
          skills: ['AWS Security', 'Azure Security', 'GCP Security', 'Kubernetes', 'Terraform', 'DevSecOps'],
          priceRange: {
            min: 8000,
            max: 30000,
            currency: 'USD'
          },
          duration: '3-6 weeks',
          availability: 'within-week',
          portfolio: [
            {
              projectName: 'Multi-Cloud Security Assessment',
              description: 'Security review of hybrid cloud infrastructure spanning AWS, Azure, and on-premises systems',
              technologies: ['AWS', 'Azure', 'Kubernetes', 'Terraform', 'Ansible'],
              caseStudyUrl: '#'
            }
          ],
          certifications: ['AWS Security Specialty', 'Azure Security Engineer', 'CISSP', 'CCSP'],
          rating: 4.6,
          reviewCount: 19,
          completedProjects: 42,
          responseTime: '< 8 hours',
          featured: false,
          createdAt: '2024-01-08T00:00:00Z',
          updatedAt: '2024-01-16T00:00:00Z',
          status: 'active'
        },
        {
          id: 'listing-5',
          teamId: 'team-5',
          title: 'Cybersecurity Training & Workshop',
          description: 'Interactive cybersecurity training sessions for development teams and security professionals. Hands-on workshops covering OWASP, secure coding, and incident response.',
          category: 'training',
          skills: ['Security Training', 'Secure Coding', 'OWASP', 'Incident Response', 'Security Awareness'],
          priceRange: {
            min: 2000,
            max: 10000,
            currency: 'USD'
          },
          duration: '1-2 weeks',
          availability: 'immediate',
          portfolio: [
            {
              projectName: 'Developer Security Training Program',
              description: 'Delivered comprehensive security training to 200+ developers across multiple teams',
              technologies: ['OWASP ZAP', 'Burp Suite', 'SonarQube', 'Docker'],
              caseStudyUrl: '#'
            }
          ],
          certifications: ['CISSP', 'GCIH', 'Security+ Trainer', 'SANS Instructor'],
          rating: 4.9,
          reviewCount: 65,
          completedProjects: 134,
          responseTime: '< 2 hours',
          featured: false,
          createdAt: '2024-01-05T00:00:00Z',
          updatedAt: '2024-01-17T00:00:00Z',
          status: 'active'
        }
      ]

      setListings(sampleListings)
    }

    if (proposals.length === 0) {
      const sampleProposals: MarketplaceProposal[] = [
        {
          id: 'proposal-1',
          listingId: 'listing-1',
          clientId: 'user-6',
          teamId: 'team-1',
          projectTitle: 'E-commerce Platform Security Assessment',
          projectDescription: 'We need a comprehensive penetration test of our e-commerce platform before launching new payment features.',
          budget: {
            amount: 12000,
            currency: 'USD'
          },
          timeline: '3 weeks',
          requirements: [
            'OWASP Top 10 testing',
            'Payment gateway security',
            'API security assessment',
            'Detailed remediation report'
          ],
          status: 'pending',
          createdAt: '2024-01-22T10:00:00Z',
          updatedAt: '2024-01-22T10:00:00Z',
          deadline: '2024-02-15T00:00:00Z'
        },
        {
          id: 'proposal-2',
          listingId: 'listing-2',
          clientId: 'user-7',
          teamId: 'team-2',
          projectTitle: 'Red Team Exercise for Financial Institution',
          projectDescription: 'Annual red team assessment to test our incident response capabilities and security awareness.',
          budget: {
            amount: 35000,
            currency: 'USD'
          },
          timeline: '6 weeks',
          requirements: [
            'Physical security testing',
            'Social engineering campaigns',
            'Network penetration',
            'Executive briefing'
          ],
          status: 'in-progress',
          createdAt: '2024-01-15T14:30:00Z',
          updatedAt: '2024-01-20T09:15:00Z',
          deadline: '2024-03-01T00:00:00Z'
        }
      ]

      setProposals(sampleProposals)
    }

    if (reviews.length === 0) {
      const sampleReviews: MarketplaceReview[] = [
        {
          id: 'review-1',
          listingId: 'listing-1',
          clientId: 'user-8',
          teamId: 'team-1',
          proposalId: 'proposal-completed-1',
          rating: 5,
          title: 'Exceptional penetration testing service',
          comment: 'The team delivered comprehensive testing with detailed findings and actionable recommendations. Their expertise in web application security is outstanding.',
          createdAt: '2024-01-18T16:45:00Z',
          helpful: 12,
          verified: true
        },
        {
          id: 'review-2',
          listingId: 'listing-2',
          clientId: 'user-9',
          teamId: 'team-2',
          proposalId: 'proposal-completed-2',
          rating: 5,
          title: 'Professional red team assessment',
          comment: 'Highly professional team that provided realistic attack scenarios. Their report helped us identify critical gaps in our security posture.',
          createdAt: '2024-01-16T11:20:00Z',
          helpful: 8,
          verified: true
        },
        {
          id: 'review-3',
          listingId: 'listing-3',
          clientId: 'user-10',
          teamId: 'team-3',
          proposalId: 'proposal-completed-3',
          rating: 4,
          title: 'Great bug bounty program setup',
          comment: 'They helped us launch our bug bounty program successfully. Good communication throughout the project.',
          createdAt: '2024-01-14T13:10:00Z',
          helpful: 5,
          verified: true
        }
      ]

      setReviews(sampleReviews)
    }
  }, [listings.length, proposals.length, reviews.length, setListings, setProposals, setReviews])
}