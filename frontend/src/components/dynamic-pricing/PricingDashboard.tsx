import { useState, useEffect } from 'react';
import { apiClient } from '@/integrations/backend/api';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, AlertCircle, Zap } from 'lucide-react';

import { PricingRulesCard } from './PricingRulesCard';
import { InventoryUpdateForm } from './InventoryUpdateForm';
import { RecommendationCard } from './RecommendationCard';
import { PromoCodeDisplay } from './PromoCodeDisplay';
import { PricingAnalyticsCard } from './PricingAnalyticsCard';
import { DiscountRulesConfig } from './DiscountRulesConfig';
import type { Event, PricingRule, InventorySnapshot, DiscountRecommendation, PromoCode, PromoCodeStats } from '@/integrations/backend/types';

interface PricingDashboardProps {
  events: Event[];
}

export function PricingDashboard({ events }: PricingDashboardProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [pricingRules, setPricingRules] = useState<Record<string, PricingRule>>({});
  const [inventories, setInventories] = useState<Record<string, InventorySnapshot>>({});
  const [recommendations, setRecommendations] = useState<DiscountRecommendation[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [stats, setStats] = useState<PromoCodeStats | null>(null);

  // Filter to only paid events (ticket_price > 0)
  const paidEvents = events.filter(e => e.ticket_price > 0 || e.is_paid_event);

  const selectedEvent = paidEvents.find(e => e.id === selectedEventId);
  const selectedRule = selectedEventId ? pricingRules[selectedEventId] : null;
  const selectedInventory = selectedEventId ? inventories[selectedEventId] : null;

  const pendingRecommendations = recommendations.filter(r => r.status === 'pending').length;

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, []);

  // Auto-select first paid event if none selected
  useEffect(() => {
    if (paidEvents.length > 0 && !selectedEventId) {
      setSelectedEventId(paidEvents[0].id);
    }
  }, [paidEvents, selectedEventId]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      // Load pricing rules for all events
      const rules = await apiClient.listOrganizerPricingRules();
      const rulesMap: Record<string, PricingRule> = {};
      rules.forEach(rule => {
        rulesMap[rule.event_id] = rule as PricingRule;
      });
      setPricingRules(rulesMap);

      // Load recommendations
      const recs = await apiClient.listRecommendations();
      setRecommendations(recs as DiscountRecommendation[]);

      // Load promo codes
      const codes = await apiClient.listPromoCodes();
      setPromoCodes(codes as PromoCode[]);

      // Load stats
      const statsData = await apiClient.getPromoCodeStats();
      setStats(statsData);

      // Load inventory for each event with pricing rules
      const inventoryMap: Record<string, InventorySnapshot> = {};
      for (const rule of rules) {
        try {
          const history = await apiClient.getInventoryHistory(rule.event_id);
          if (history.snapshots.length > 0) {
            inventoryMap[rule.event_id] = history.snapshots[0];
          }
        } catch (e) {
          // No inventory yet for this event
        }
      }
      setInventories(inventoryMap);
    } catch (error) {
      toast.error('Failed to load pricing data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadAllData();
    if (selectedEventId) {
      loadEventData(selectedEventId);
    }
  };

  const loadEventData = async (eventId: string) => {
    try {
      // Load pricing rule for this event
      try {
        const rule = await apiClient.getPricingRule(eventId);
        setPricingRules(prev => ({ ...prev, [eventId]: rule as PricingRule }));
      } catch (e) {
        // No pricing rule yet
      }

      // Load inventory
      try {
        const history = await apiClient.getInventoryHistory(eventId);
        if (history.snapshots.length > 0) {
          setInventories(prev => ({ ...prev, [eventId]: history.snapshots[0] }));
        }
      } catch (e) {
        // No inventory yet
      }
    } catch (error) {
      console.error('Failed to load event data:', error);
    }
  };

  const eventRecommendations = selectedEventId 
    ? recommendations.filter(r => r.event_id === selectedEventId)
    : [];

  const eventPromoCodes = selectedEventId
    ? promoCodes.filter(p => p.event_id === selectedEventId)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dynamic Pricing</h2>
          <p className="text-muted-foreground">
            AI-powered discounts to fill empty seats
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      <PricingAnalyticsCard 
        stats={stats} 
        pendingRecommendations={pendingRecommendations} 
      />

      {/* Event Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Select Event</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="w-full md:w-[400px]">
              <SelectValue placeholder="Choose an event to manage pricing" />
            </SelectTrigger>
            <SelectContent>
              {paidEvents.map(event => (
                <SelectItem key={event.id} value={event.id}>
                  <div className="flex items-center gap-2">
                    <span>{event.title}</span>
                    {pricingRules[event.id] && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {pricingRules[event.id].is_active ? 'Active' : 'Disabled'}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedEvent && (
        <Tabs defaultValue="setup" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-[700px]">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="rules">
              <Zap className="w-3 h-3 mr-1" />
              Rules
            </TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="recommendations">
              Recommendations
              {eventRecommendations.length > 0 && (
                <Badge variant="default" className="ml-2 text-xs">
                  {eventRecommendations.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="codes">
              Promo Codes
              {eventPromoCodes.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {eventPromoCodes.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6">
            <PricingRulesCard
              eventId={selectedEvent.id}
              eventTitle={selectedEvent.title}
              existingRule={selectedRule || null}
              onRuleUpdated={() => loadEventData(selectedEvent.id)}
            />

            {!selectedRule && (
              <Card className="border-dashed">
                <CardContent className="flex items-center gap-3 py-6 text-muted-foreground">
                  <AlertCircle className="w-5 h-5" />
                  <p>
                    Enable dynamic pricing for this event to get AI recommendations 
                    when ticket sales are low.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rules" className="space-y-6">
            {selectedRule?.is_active ? (
              <DiscountRulesConfig
                eventId={selectedEvent.id}
                eventTitle={selectedEvent.title}
                onRulesUpdated={() => loadEventData(selectedEvent.id)}
              />
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p>Enable dynamic pricing first to configure discount rules</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            {selectedRule?.is_active ? (
              <InventoryUpdateForm
                eventId={selectedEvent.id}
                eventTitle={selectedEvent.title}
                maxCapacity={selectedRule.max_capacity}
                currentInventory={selectedInventory || null}
                onInventoryUpdated={() => loadEventData(selectedEvent.id)}
              />
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p>Enable dynamic pricing first to manage inventory</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            {eventRecommendations.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p className="mb-2">No recommendations yet</p>
                  <p className="text-sm">
                    Update your inventory to trigger AI recommendations when occupancy is low.
                  </p>
                </CardContent>
              </Card>
            ) : (
              eventRecommendations.map(rec => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  eventTitle={selectedEvent.title}
                  basePrice={selectedRule?.base_price || 0}
                  onRecommendationUpdated={handleRefresh}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="codes" className="space-y-6">
            {eventPromoCodes.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p className="mb-2">No promo codes yet</p>
                  <p className="text-sm">
                    Approve a discount recommendation to generate a promo code.
                  </p>
                </CardContent>
              </Card>
            ) : (
              eventPromoCodes.map(code => (
                <PromoCodeDisplay
                  key={code.id}
                  promoCode={code}
                  eventTitle={selectedEvent.title}
                  onPromoCodeUpdated={handleRefresh}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
