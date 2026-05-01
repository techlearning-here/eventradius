import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Copy, 
  RefreshCw, 
  Power, 
  Users, 
  DollarSign, 
  Clock,
  CheckCircle2,
  Ticket,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/integrations/backend/api';
import type { PromoCode } from '@/integrations/backend/types';

interface PromoCodeDisplayProps {
  promoCode: PromoCode;
  eventTitle: string;
  onPromoCodeUpdated?: () => void;
}

export function PromoCodeDisplay({ promoCode, eventTitle, onPromoCodeUpdated }: PromoCodeDisplayProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Convert string values from API to numbers
  const estimatedCommission = typeof promoCode.estimated_commission === 'number' 
    ? promoCode.estimated_commission 
    : parseFloat(promoCode.estimated_commission as string) || 0;

  const usagePercent = (promoCode.times_claimed / promoCode.max_uses) * 100;
  const isNearLimit = usagePercent >= 80;
  const isExpired = new Date(promoCode.valid_until) < new Date();

  const handleCopy = () => {
    navigator.clipboard.writeText(promoCode.code);
    toast.success('Promo code copied to clipboard');
  };

  const handleDeactivate = async () => {
    setIsLoading(true);
    try {
      await apiClient.deactivatePromoCode(promoCode.id);
      toast.success('Promo code deactivated');
      onPromoCodeUpdated?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to deactivate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setIsLoading(true);
    try {
      await apiClient.regeneratePromoCode(promoCode.id);
      toast.success('New promo code generated');
      onPromoCodeUpdated?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to regenerate');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`${!promoCode.is_active || isExpired ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${promoCode.is_active && !isExpired ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Ticket className={`w-5 h-5 ${promoCode.is_active && !isExpired ? 'text-green-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{eventTitle}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {promoCode.discount_percent}% off • {promoCode.max_uses} max uses
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isExpired && (
              <Badge variant="outline" className="text-red-600 border-red-300">
                Expired
              </Badge>
            )}
            {!promoCode.is_active && !isExpired && (
              <Badge variant="outline" className="text-gray-600">
                Inactive
              </Badge>
            )}
            {promoCode.is_active && !isExpired && (
              <Badge variant="default" className="bg-green-600">
                Active
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Promo Code Display */}
        <div className="flex items-center gap-3">
          <code className="flex-1 px-4 py-4 bg-muted border-2 border-dashed border-muted-foreground/30 rounded-xl text-2xl font-mono font-bold text-center tracking-wider">
            {promoCode.code}
          </code>
          <Button
            variant="outline"
            size="icon"
            className="h-14 w-14"
            onClick={handleCopy}
            disabled={isLoading}
          >
            <Copy className="w-5 h-5" />
          </Button>
        </div>

        {/* Usage Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Usage</span>
            <span className="font-medium">
              {promoCode.times_claimed} / {promoCode.max_uses} claimed
            </span>
          </div>
          <Progress 
            value={usagePercent} 
            className="h-2"
          />
          {isNearLimit && promoCode.is_active && (
            <p className="text-xs text-amber-600">
              Approaching usage limit! Consider regenerating the code.
            </p>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Percent className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Discount</div>
              <div className="font-semibold">{promoCode.discount_percent}%</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Est. Commission</div>
              <div className="font-semibold">
                ${estimatedCommission.toFixed(2)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Users className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Claimed</div>
              <div className="font-semibold">{promoCode.times_claimed}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Used (est.)</div>
              <div className="font-semibold">{promoCode.times_used}</div>
            </div>
          </div>
        </div>

        {/* Validity */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted rounded-lg">
          <Clock className="w-4 h-4" />
          <span>
            Valid: {new Date(promoCode.valid_from).toLocaleDateString()} - {new Date(promoCode.valid_until).toLocaleString()}
          </span>
        </div>

        {/* Action Buttons */}
        {promoCode.is_active && !isExpired && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleRegenerate}
              disabled={isLoading}
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={isLoading}
              className="flex-1"
            >
              <Power className="w-4 h-4 mr-2" />
              Deactivate
            </Button>
          </div>
        )}

        {/* External Ticketing Link */}
        <Button variant="ghost" className="w-full" asChild>
          <a href="#" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Go to Ticketing Site
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

// Helper component for the percent icon
function Percent({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}
