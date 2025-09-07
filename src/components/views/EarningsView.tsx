import { useState } from 'react';
import { useKVWithFallback } from '@/lib/kv-fallback';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendUp, 
  TrendDown, 
  DollarSign, 
  Calendar, 
  Users, 
  Target,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle
} from '@/lib/phosphor-icons-wrapper';
import { User } from '@/types/user';
import { Earning, EarningsAnalytics, TeamEarningsAnalytics, PaymentStatus } from '@/types/earnings';
import { EarningsOverview } from '@/components/earnings/EarningsOverview';
import { PaymentHistoryView } from '@/components/earnings/PaymentHistoryView';
import { TeamPerformanceView } from '@/components/earnings/TeamPerformanceView';
import { EarningsGoalsView } from '@/components/earnings/EarningsGoalsView';
import { AnalyticsView } from '@/components/earnings/AnalyticsView';

interface EarningsViewProps {
  currentUser: User
}

export function EarningsView({ currentUser }: EarningsViewProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [earnings] = useKVWithFallback<Earning[]>(`earnings-${currentUser.id}`, []);
  const [analytics] = useKVWithFallback<EarningsAnalytics | null>(`analytics-${currentUser.id}`, null);

  // Calculate quick stats
  const totalEarnings = earnings.reduce((sum, earning) => sum + earning.amount, 0);
  const paidEarnings = earnings.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);
  const pendingEarnings = earnings.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);
  const thisMonthEarnings = earnings.filter(e => {
    const earnedDate = new Date(e.earnedAt);
    const now = new Date();
    return earnedDate.getMonth() === now.getMonth() && earnedDate.getFullYear() === now.getFullYear();
  }).reduce((sum, e) => sum + e.amount, 0);

  const lastMonthEarnings = earnings.filter(e => {
    const earnedDate = new Date(e.earnedAt);
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return earnedDate.getMonth() === lastMonth.getMonth() && earnedDate.getFullYear() === lastMonth.getFullYear();
  }).reduce((sum, e) => sum + e.amount, 0);

  const monthlyGrowth = lastMonthEarnings > 0 ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100 : 0;

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Earnings Dashboard</h1>
          <p className="text-muted-foreground">
            Track your cybersecurity earnings, payments, and team performance
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold text-foreground">${totalEarnings.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold text-foreground">${thisMonthEarnings.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {monthlyGrowth >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 text-accent" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-destructive" />
                    )}
                    <span className={`text-sm font-medium ${monthlyGrowth >= 0 ? 'text-accent' : 'text-destructive'}`}>
                      {Math.abs(monthlyGrowth).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <TrendUp className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Paid Out</p>
                  <p className="text-2xl font-bold text-foreground">${paidEarnings.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-foreground">${pendingEarnings.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-secondary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <EarningsOverview currentUser={currentUser} />
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <PaymentHistoryView currentUser={currentUser} />
          </TabsContent>

          <TabsContent value="teams" className="space-y-6">
            <TeamPerformanceView currentUser={currentUser} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsView currentUser={currentUser} />
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <EarningsGoalsView currentUser={currentUser} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}