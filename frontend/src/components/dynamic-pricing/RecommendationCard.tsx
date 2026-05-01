import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { 
  Sparkles, 
  Clock, 
  Users, 
  Percent, 
  CheckCircle2, 
  XCircle, 
  TrendingDown,
  Loader2,
  Zap,
  BrainCircuit
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/integrations/backend/api';
import type { DiscountRecommendation } from '@/integrations/backend/types';

interface RecommendationCardProps {
  recommendation: DiscountRecommendation;
  eventTitle: string;
  basePrice: number;
  onRecommendationUpdated?: () => void;
}

export function RecommendationCard({ 
  recommendation, 
  eventTitle, 
  basePrice,
  onRecommendationUpdated 
}: RecommendationCardProps) {
  const [maxUses, setMaxUses] = useState('15');
  const [isLoading, setIsLoading] = useState(false);
  const [showApproveForm, setShowApproveForm] = useState(false);

  // Ensure basePrice is a number (API may return string)
  const numericBasePrice = typeof basePrice === 'number' ? basePrice : parseFloat(basePrice as string) || 0;
  const numericRecommendedPrice = typeof recommendation.recommended_price === 'number' 
    ? recommendation.recommended_price 
    : parseFloat(recommendation.recommended_price as string) || 0;

  const discountAmount = numericBasePrice - numericRecommendedPrice;
  const isPending = recommendation.status === 'pending';
  const isApproved = recommendation.status === 'approved';
  const isRejected = recommendation.status === 'rejected';

  const handleApprove = async () => {
    const uses = parseInt(maxUses, 10);
    if (isNaN(uses) || uses < 1 || uses > 1000) {
      toast.error('Max uses must be between 1 and 1000');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.approveRecommendation(recommendation.id, uses);
      toast.success('Discount approved! Promo code generated.');
      onRecommendationUpdated?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to approve recommendation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      await apiClient.rejectRecommendation(recommendation.id);
      toast.success('Recommendation rejected');
      onRecommendationUpdated?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reject recommendation');
    } finally {
      setIsLoading(false);
    }
  };

  const getUrgencyColor = (hours: number) => {
    if (hours <= 2) return 'text-red-600 bg-red-50';
    if (hours <= 6) return 'text-orange-600 bg-orange-50';
    if (hours <= 12) return 'text-yellow-600 bg-yellow-50';
    return 'text-blue-600 bg-blue-50';
  };

  return (
    <Card className={`border-l-4 ${isPending ? 'border-l-amber-500' : isApproved ? 'border-l-green-500' : 'border-l-gray-400'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isPending ? 'bg-amber-100' : isApproved ? 'bg-green-100' : 'bg-gray-100'}`}>
              {isPending ? (
                <Sparkles className="w-5 h-5 text-amber-600" />
              ) : isApproved ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-semibold">
                  {isPending 
                    ? (recommendation.recommendation_type === 'rule_based' ? 'Rule-Based Recommendation' : 'AI Recommendation')
                    : isApproved ? 'Discount Approved' : 'Recommendation Rejected'}
                </CardTitle>
                <Badge 
                  variant="outline" 
                  className={recommendation.recommendation_type === 'rule_based' 
                    ? 'bg-purple-50 text-purple-700 border-purple-200' 
                    : 'bg-blue-50 text-blue-700 border-blue-200'}
                >
                  {recommendation.recommendation_type === 'rule_based' ? (
                    <><Zap className="w-3 h-3 mr-1" />Rule-Based</>
                  ) : (
                    <><BrainCircuit className="w-3 h-3 mr-1" />AI</>
                  )}
                </Badge>
              </div>
              <CardDescription className="text-sm text-muted-foreground">
                {eventTitle}
                {recommendation.rule_name && (
                  <span className="text-purple-600 ml-2">via: {recommendation.rule_name}</span>
                )}
              </CardDescription>
            </div>
          </div>
          <Badge 
            variant={isPending ? 'default' : isApproved ? 'secondary' : 'outline'}
            className={isPending ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : ''}
          >
            {recommendation.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className={`p-3 rounded-lg ${getUrgencyColor(recommendation.hours_remaining)}`}>
            <div className="flex items-center gap-1 mb-1">
              <Clock className="w-3 h-3" />
              <span className="text-xs font-medium">Time Left</span>
            </div>
            <div className="text-lg font-bold">{recommendation.hours_remaining.toFixed(1)}h</div>
          </div>
          
          <div className="p-3 rounded-lg bg-blue-50 text-blue-700">
            <div className="flex items-center gap-1 mb-1">
              <Users className="w-3 h-3" />
              <span className="text-xs font-medium">Occupancy</span>
            </div>
            <div className="text-lg font-bold">{recommendation.occupancy_percent.toFixed(1)}%</div>
          </div>
          
          <div className="p-3 rounded-lg bg-green-50 text-green-700">
            <div className="flex items-center gap-1 mb-1">
              <Percent className="w-3 h-3" />
              <span className="text-xs font-medium">Discount</span>
            </div>
            <div className="text-lg font-bold">{recommendation.recommended_discount_percent}%</div>
          </div>
        </div>

        {/* Pricing Details */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Original</div>
            <div className="text-lg font-semibold line-through">${numericBasePrice.toFixed(2)}</div>
          </div>
          <TrendingDown className="w-5 h-5 text-green-600" />
          <div className="text-center">
            <div className="text-sm text-muted-foreground">New Price</div>
            <div className="text-lg font-bold text-green-600">
              ${numericRecommendedPrice.toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">You Save</div>
            <div className="text-lg font-semibold text-green-600">
              ${discountAmount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Reason */}
        {recommendation.recommendation_type === 'rule_based' ? (
          <Alert className="bg-purple-50 border-purple-200">
            <Zap className="w-4 h-4 text-purple-600" />
            <AlertTitle className="text-purple-800">Rule-Based Trigger</AlertTitle>
            <AlertDescription className="text-purple-700">
              This recommendation was generated by rule <strong>{recommendation.rule_name}</strong>.
              {' '}Occupancy ({recommendation.occupancy_percent.toFixed(1)}%) is below threshold with {recommendation.hours_remaining.toFixed(1)}h remaining.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-amber-50 border-amber-200">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <AlertTitle className="text-amber-800">AI Reasoning</AlertTitle>
            <AlertDescription className="text-amber-700">
              {recommendation.occupancy_percent < 20 
                ? `Very low attendance (${recommendation.occupancy_percent.toFixed(1)}%) with limited time remaining.`
                : recommendation.occupancy_percent < 40
                ? `Moderate occupancy (${recommendation.occupancy_percent.toFixed(1)}%) suggests a discount would help fill seats.`
                : `Time pressure (${recommendation.hours_remaining.toFixed(1)}h remaining) warrants a promotional discount.`}
            </AlertDescription>
          </Alert>
        )}

        {/* Promo Code (if approved) */}
        {isApproved && recommendation.promo_code && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-800">Generated Promo Code</span>
              <Badge variant="outline" className="border-green-300 text-green-700">
                {recommendation.promo_code.times_claimed} / {recommendation.promo_code.max_uses} claimed
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <code className="flex-1 px-4 py-3 bg-white border border-green-300 rounded-lg text-xl font-mono font-bold text-center text-green-700">
                {recommendation.promo_code.code}
              </code>
              <Button
                variant="outline"
                size="icon"
                className="border-green-300 hover:bg-green-100"
                onClick={() => {
                  navigator.clipboard.writeText(recommendation.promo_code!.code);
                  toast.success('Code copied to clipboard');
                }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </Button>
            </div>
            <p className="mt-2 text-xs text-green-700">
              Add this code to your external ticketing system (Eventbrite, Square, etc.)
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {isPending && (
          <>
            {!showApproveForm ? (
              <div className="flex gap-3">
                <Button 
                  onClick={() => setShowApproveForm(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve & Generate Code
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleReject}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            ) : (
              <div className="space-y-3 p-4 bg-muted rounded-lg">
                <Label htmlFor="max-uses">Maximum Code Uses</Label>
                <Input
                  id="max-uses"
                  type="number"
                  min="1"
                  max="1000"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  disabled={isLoading}
                />
                <div className="flex gap-3">
                  <Button 
                    onClick={handleApprove}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Confirm Approval
                  </Button>
                  <Button 
                    variant="ghost"
                    onClick={() => setShowApproveForm(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
