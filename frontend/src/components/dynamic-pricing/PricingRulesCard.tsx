import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/integrations/backend/api';

interface PricingRulesCardProps {
  eventId: string;
  eventTitle: string;
  existingRule?: {
    id: string;
    max_capacity: number;
    base_price: number;
    min_price: number;
    is_active: boolean;
  } | null;
  onRuleUpdated?: () => void;
}

export function PricingRulesCard({ eventId, eventTitle, existingRule, onRuleUpdated }: PricingRulesCardProps) {
  const [isEnabled, setIsEnabled] = useState(existingRule?.is_active ?? false);
  const [maxCapacity, setMaxCapacity] = useState(existingRule?.max_capacity?.toString() ?? '');
  const [basePrice, setBasePrice] = useState(existingRule?.base_price?.toString() ?? '');
  const [minPrice, setMinPrice] = useState(existingRule?.min_price?.toString() ?? '');
  const [isLoading, setIsLoading] = useState(false);

  const hasExistingRule = !!existingRule;

  const handleSave = async () => {
    if (!maxCapacity || !basePrice || !minPrice) {
      toast.error('Please fill in all fields');
      return;
    }

    const capacity = parseInt(maxCapacity, 10);
    const base = parseFloat(basePrice);
    const min = parseFloat(minPrice);

    if (isNaN(capacity) || capacity <= 0) {
      toast.error('Capacity must be a positive number');
      return;
    }

    if (isNaN(base) || base <= 0) {
      toast.error('Base price must be a positive number');
      return;
    }

    if (isNaN(min) || min <= 0) {
      toast.error('Minimum price must be a positive number');
      return;
    }

    if (min > base) {
      toast.error('Minimum price cannot exceed base price');
      return;
    }

    setIsLoading(true);
    try {
      if (hasExistingRule) {
        await apiClient.updatePricingRule(eventId, {
          max_capacity: capacity,
          base_price: base,
          min_price: min,
          is_active: isEnabled,
        });
        toast.success('Pricing rule updated successfully');
      } else {
        await apiClient.createPricingRule({
          event_id: eventId,
          max_capacity: capacity,
          base_price: base,
          min_price: min,
          is_active: isEnabled,
        });
        toast.success('Pricing rule created successfully');
      }
      onRuleUpdated?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save pricing rule');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-indigo-100">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Dynamic Pricing</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {eventTitle}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
              disabled={isLoading}
            />
            <Badge variant={isEnabled ? 'default' : 'secondary'} className="ml-2">
              {isEnabled ? 'Active' : 'Disabled'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isEnabled && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max-capacity" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Max Capacity
                </Label>
                <Input
                  id="max-capacity"
                  type="number"
                  min="1"
                  placeholder="e.g., 100"
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="base-price" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Base Price ($)
                </Label>
                <Input
                  id="base-price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="e.g., 50.00"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="min-price" className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Min Price ($)
                </Label>
                <Input
                  id="min-price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="e.g., 25.00"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
              <p>
                AI will recommend discounts based on occupancy and time remaining.
                The minimum price acts as a guardrail to protect your revenue.
              </p>
            </div>

            <Button 
              onClick={handleSave} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Saving...' : hasExistingRule ? 'Update Pricing Rule' : 'Enable Dynamic Pricing'}
            </Button>
          </>
        )}

        {!isEnabled && hasExistingRule && (
          <div className="text-center py-4 text-muted-foreground">
            <p>Dynamic pricing is currently disabled for this event.</p>
            <Button 
              variant="outline" 
              onClick={handleSave} 
              disabled={isLoading}
              className="mt-3"
            >
              {isLoading ? 'Saving...' : 'Re-enable Dynamic Pricing'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
