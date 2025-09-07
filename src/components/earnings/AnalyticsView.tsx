import { useState } from 'react';
import { useKVWithFallback } from '@/lib/kv-fallback';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  PieChart, 
  TrendUp, 
  TrendDown,
  Calendar,
  DollarSign,
  Users,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from '@/lib/phosphor-icons-wrapper';
import { User } from '@/types/user';
import { Earning, EarningType, EarningSource } from '@/types/earnings';

interface AnalyticsViewProps {
  currentUser: User
}

export function AnalyticsView({ currentUser }: AnalyticsViewProps) {
  const [earnings] = useKVWithFallback<Earning[]>(`earnings-${currentUser.id}`, []);
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '1y' | 'all'>('90d');

  // Filter earnings based on time range
  const getFilteredEarnings = () => {
    if (timeRange === 'all') {return earnings;}

    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeRange) {
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return earnings.filter(earning => new Date(earning.earnedAt) >= cutoffDate);
  };

  const filteredEarnings = getFilteredEarnings();

  // Calculate analytics data
  const totalEarnings = filteredEarnings.reduce((sum, earning) => sum + earning.amount, 0);
  const averagePerProject = filteredEarnings.length > 0 ? totalEarnings / filteredEarnings.length : 0;
  const projectCount = filteredEarnings.length;

  // Earnings by type
  const earningsByType = filteredEarnings.reduce((acc, earning) => {
    acc[earning.type] = (acc[earning.type] || 0) + earning.amount;
    return acc;
  }, {} as Record<EarningType, number>);

  const topEarningTypes = Object.entries(earningsByType)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Earnings by source
  const earningsBySource = filteredEarnings.reduce((acc, earning) => {
    acc[earning.source] = (acc[earning.source] || 0) + earning.amount;
    return acc;
  }, {} as Record<EarningSource, number>);

  // Monthly trends (last 12 months)
  const monthlyTrends = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const monthEarnings = earnings.filter(earning => {
      const earningDate = new Date(earning.earnedAt);
      return earningDate.getFullYear() === date.getFullYear() && 
             earningDate.getMonth() === date.getMonth();
    });

    monthlyTrends.push({
      month: date.toLocaleString('default', { month: 'short', year: '2-digit' }),
      earnings: monthEarnings.reduce((sum, e) => sum + e.amount, 0),
      projects: monthEarnings.length
    });
  }

  // Growth calculations
  const currentMonth = monthlyTrends[monthlyTrends.length - 1];
  const previousMonth = monthlyTrends[monthlyTrends.length - 2];
  const monthlyGrowth = previousMonth?.earnings > 0 
    ? ((currentMonth?.earnings - previousMonth?.earnings) / previousMonth?.earnings) * 100 
    : 0;

  // Team vs individual earnings
  const teamEarnings = filteredEarnings.filter(e => e.teamId).reduce((sum, e) => sum + e.amount, 0);
  const individualEarnings = filteredEarnings.filter(e => !e.teamId).reduce((sum, e) => sum + e.amount, 0);

  const formatEarningType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatEarningSource = (source: string) => {
    return source.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getTypeColor = (index: number) => {
    const colors = ['bg-primary', 'bg-accent', 'bg-secondary', 'bg-muted', 'bg-destructive'];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
        <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold text-foreground">${totalEarnings.toLocaleString()}</p>
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
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Projects</p>
                <p className="text-2xl font-bold text-foreground">{projectCount}</p>
              </div>
              <Target className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg per Project</p>
                <p className="text-2xl font-bold text-foreground">${averagePerProject.toLocaleString()}</p>
              </div>
              <BarChart className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team Ratio</p>
                <p className="text-2xl font-bold text-foreground">
                  {totalEarnings > 0 ? ((teamEarnings / totalEarnings) * 100).toFixed(0) : 0}%
                </p>
              </div>
              <Users className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Earnings by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topEarningTypes.length > 0 ? (
              <div className="space-y-4">
                {topEarningTypes.map(([type, amount], index) => {
                  const percentage = totalEarnings > 0 ? (amount / totalEarnings) * 100 : 0;
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{formatEarningType(type)}</span>
                        <div className="text-right">
                          <span className="text-sm font-semibold">${amount.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getTypeColor(index)}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No data available for this period</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Earnings by Source */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-accent" />
              Earnings by Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(earningsBySource).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(earningsBySource)
                  .sort(([,a], [,b]) => b - a)
                  .map(([source, amount], index) => {
                    const percentage = totalEarnings > 0 ? (amount / totalEarnings) * 100 : 0;
                    return (
                      <div key={source} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{formatEarningSource(source)}</span>
                          <div className="text-right">
                            <span className="text-sm font-semibold">${amount.toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getTypeColor(index)}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No data available for this period</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendUp className="h-5 w-5 text-primary" />
            Monthly Trends (Last 12 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyTrends.some(trend => trend.earnings > 0) ? (
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-2">
                {monthlyTrends.map((trend, index) => {
                  const maxEarnings = Math.max(...monthlyTrends.map(t => t.earnings));
                  const height = maxEarnings > 0 ? (trend.earnings / maxEarnings) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-primary rounded-t min-h-[4px] flex items-end justify-center relative group cursor-pointer"
                        style={{ height: `${Math.max(height, 4)}px` }}
                      >
                        <div className="absolute bottom-full mb-2 bg-card border rounded p-2 shadow-lg hidden group-hover:block z-10 whitespace-nowrap">
                          <p className="text-sm font-medium">{trend.month}</p>
                          <p className="text-sm text-muted-foreground">${trend.earnings.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{trend.projects} projects</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground transform -rotate-45 origin-center">
                        {trend.month}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Highest Month</p>
                  <p className="text-lg font-semibold">
                    ${Math.max(...monthlyTrends.map(t => t.earnings)).toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Average Month</p>
                  <p className="text-lg font-semibold">
                    ${(monthlyTrends.reduce((sum, t) => sum + t.earnings, 0) / 12).toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Growth Trend</p>
                  <div className="flex items-center justify-center gap-1">
                    {monthlyGrowth >= 0 ? (
                      <TrendUp className="h-4 w-4 text-accent" />
                    ) : (
                      <TrendDown className="h-4 w-4 text-destructive" />
                    )}
                    <span className={`font-semibold ${monthlyGrowth >= 0 ? 'text-accent' : 'text-destructive'}`}>
                      {Math.abs(monthlyGrowth).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No earnings data for trend analysis</p>
              <p className="text-sm text-muted-foreground">
                Start earning to see your performance trends
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team vs Individual Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            Team vs Individual Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {totalEarnings > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Team Projects</span>
                  <span className="font-semibold">${teamEarnings.toLocaleString()}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className="h-3 rounded-full bg-accent"
                    style={{ width: `${totalEarnings > 0 ? (teamEarnings / totalEarnings) * 100 : 0}%` }}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {((teamEarnings / totalEarnings) * 100).toFixed(1)}% of total earnings
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Individual Work</span>
                  <span className="font-semibold">${individualEarnings.toLocaleString()}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className="h-3 rounded-full bg-primary"
                    style={{ width: `${totalEarnings > 0 ? (individualEarnings / totalEarnings) * 100 : 0}%` }}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {((individualEarnings / totalEarnings) * 100).toFixed(1)}% of total earnings
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No performance data available</p>
              <p className="text-sm text-muted-foreground">
                Start working on projects to see your performance breakdown
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}