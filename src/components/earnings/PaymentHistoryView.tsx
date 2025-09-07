import { useState } from 'react'
import { useKVWithFallback } from '@/lib/kv-fallback'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Download,
  Filter,
  Search,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpDown
} from '@phosphor-icons/react'
import { User } from '@/types/user'
import { Earning, PaymentStatus, EarningType } from '@/types/earnings'

interface PaymentHistoryViewProps {
  currentUser: User
}

export function PaymentHistoryView({ currentUser }: PaymentHistoryViewProps) {
  const [earnings] = useKVWithFallback<Earning[]>(`earnings-${currentUser.id}`, [])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<EarningType | 'all'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Filter and sort earnings
  const filteredEarnings = earnings
    .filter(earning => {
      const matchesSearch = earning.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           earning.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           earning.projectName?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || earning.status === statusFilter
      const matchesType = typeFilter === 'all' || earning.type === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.earnedAt).getTime() - new Date(b.earnedAt).getTime()
          break
        case 'amount':
          comparison = a.amount - b.amount
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-accent" />
      case 'pending': return <Clock className="h-4 w-4 text-secondary-foreground" />
      case 'processing': return <AlertCircle className="h-4 w-4 text-primary" />
      case 'failed': return <XCircle className="h-4 w-4 text-destructive" />
      case 'disputed': return <AlertCircle className="h-4 w-4 text-destructive" />
      case 'cancelled': return <XCircle className="h-4 w-4 text-muted-foreground" />
      default: return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'paid': return 'bg-accent text-accent-foreground'
      case 'pending': return 'bg-secondary text-secondary-foreground'
      case 'processing': return 'bg-primary text-primary-foreground'
      case 'failed': return 'bg-destructive text-destructive-foreground'
      case 'disputed': return 'bg-destructive text-destructive-foreground'
      case 'cancelled': return 'bg-muted text-muted-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const formatEarningType = (type: EarningType) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const exportToCSV = () => {
    const csvData = filteredEarnings.map(earning => ({
      Date: new Date(earning.earnedAt).toLocaleDateString(),
      Description: earning.description,
      Type: formatEarningType(earning.type),
      Amount: earning.amount,
      Status: earning.status,
      Team: earning.teamName || 'Individual',
      Project: earning.projectName || '',
      Client: earning.clientName || '',
      'Transaction ID': earning.transactionId || '',
      'Payment Method': earning.paymentMethod || ''
    }))

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `earnings-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const toggleSort = (field: 'date' | 'amount' | 'status') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PaymentStatus | 'all')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as EarningType | 'all')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="bug-bounty">Bug Bounty</SelectItem>
                <SelectItem value="penetration-test">Pen Test</SelectItem>
                <SelectItem value="security-audit">Security Audit</SelectItem>
                <SelectItem value="incident-response">Incident Response</SelectItem>
                <SelectItem value="consulting">Consulting</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="code-review">Code Review</SelectItem>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="bonus">Bonus</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          {filteredEarnings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-4 font-medium text-muted-foreground">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSort('date')}
                        className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                      >
                        Date
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </Button>
                    </th>
                    <th className="p-4 font-medium text-muted-foreground">Description</th>
                    <th className="p-4 font-medium text-muted-foreground">Type</th>
                    <th className="p-4 font-medium text-muted-foreground">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSort('amount')}
                        className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                      >
                        Amount
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </Button>
                    </th>
                    <th className="p-4 font-medium text-muted-foreground">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSort('status')}
                        className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                      >
                        Status
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </Button>
                    </th>
                    <th className="p-4 font-medium text-muted-foreground">Team/Project</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEarnings.map((earning, index) => (
                    <tr key={earning.id} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(earning.earnedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{earning.description}</p>
                          {earning.clientName && (
                            <p className="text-sm text-muted-foreground">
                              Client: {earning.clientName}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">
                          {formatEarningType(earning.type)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-accent" />
                          <span className="font-semibold">
                            {earning.amount.toLocaleString()}
                          </span>
                        </div>
                        {earning.fees && earning.fees > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Net: ${(earning.amount - earning.fees).toLocaleString()}
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(earning.status)}
                          <Badge className={getStatusColor(earning.status)}>
                            {earning.status}
                          </Badge>
                        </div>
                        {earning.paidAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Paid: {new Date(earning.paidAt).toLocaleDateString()}
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <div>
                          {earning.teamName && (
                            <p className="text-sm font-medium">{earning.teamName}</p>
                          )}
                          {earning.projectName && (
                            <p className="text-sm text-muted-foreground">{earning.projectName}</p>
                          )}
                          {!earning.teamName && !earning.projectName && (
                            <p className="text-sm text-muted-foreground">Individual</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No payment history found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'Start earning to see your payment history here'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}