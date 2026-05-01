import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  Ticket, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface PricingAnalyticsCardProps {
  stats: {
    active_deals: number;
    total_claims: number;
    total_used: number;
    estimated_commission: string;
  } | null;
  pendingRecommendations: number;
}

export function PricingAnalyticsCard({ stats, pendingRecommendations }: PricingAnalyticsCardProps) {
  const commission = stats ? parseFloat(stats.estimated_commission) : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Pricing Analytics</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Overview of your dynamic pricing performance
              </CardDescription>
            </div>
          </div>
          {pendingRecommendations > 0 && (
            <Badge variant="default" className="bg-amber-500">
              {pendingRecommendations} pending
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Active Deals */}
          <div className="p-4 bg-indigo-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Ticket className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-medium text-indigo-700">Active Deals</span>
            </div>
            <div className="text-2xl font-bold text-indigo-900">
              {stats?.active_deals ?? 0}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3 text-green-600" />
              <span className="text-xs text-green-600">Promo codes</span>
            </div>
          </div>

          {/* Total Claims */}
          <div className="p-4 bg-blue-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Total Claims</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {stats?.total_claims ?? 0}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3 text-green-600" />
              <span className="text-xs text-green-600">User interest</span>
            </div>
          </div>

          {/* Used (Est.) */}
          <div className="p-4 bg-green-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">Used (est.)</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {stats?.total_used ?? 0}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowDownRight className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Redemptions</span>
            </div>
          </div>

          {/* Est. Commission */}
          <div className="p-4 bg-amber-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">Est. Commission</span>
            </div>
            <div className="text-2xl font-bold text-amber-900">
              ${commission.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-muted-foreground">5% of discount</span>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>How it works:</strong> When you approve AI discount recommendations, 
            we generate promo codes for your external ticketing system. You track redemptions 
            manually, and we calculate estimated commission based on claimed codes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
