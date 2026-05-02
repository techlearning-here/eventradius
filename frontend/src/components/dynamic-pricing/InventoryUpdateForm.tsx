import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Ticket, RefreshCw, TrendingUp, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/integrations/backend/api';

interface InventoryUpdateFormProps {
  eventId: string;
  eventTitle: string;
  maxCapacity: number;
  currentInventory?: {
    tickets_sold: number;
    tickets_remaining: number;
    occupancy_percent: number;
    reported_at: string;
  } | null;
  onInventoryUpdated?: () => void;
}

export function InventoryUpdateForm({ 
  eventId, 
  eventTitle, 
  maxCapacity, 
  currentInventory, 
  onInventoryUpdated 
}: InventoryUpdateFormProps) {
  const [ticketsSold, setTicketsSold] = useState(currentInventory?.tickets_sold?.toString() ?? '');
  const [isLoading, setIsLoading] = useState(false);

  const ticketsSoldNum = parseInt(ticketsSold, 10) || 0;
  const remaining = Math.max(0, maxCapacity - ticketsSoldNum);
  const occupancy = maxCapacity > 0 ? (ticketsSoldNum / maxCapacity) * 100 : 0;

  const handleUpdate = async () => {
    if (ticketsSoldNum < 0 || ticketsSoldNum > maxCapacity) {
      toast.error(`Tickets sold must be between 0 and ${maxCapacity}`);
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.updateInventory(eventId, ticketsSoldNum);
      toast.success('Inventory updated successfully');
      onInventoryUpdated?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update inventory');
    } finally {
      setIsLoading(false);
    }
  };

  const getOccupancyColor = (pct: number) => {
    if (pct >= 80) return 'bg-green-500';
    if (pct >= 50) return 'bg-yellow-500';
    if (pct >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getOccupancyBadge = (pct: number) => {
    if (pct >= 80) return { label: 'Great', variant: 'default' as const };
    if (pct >= 50) return { label: 'Good', variant: 'secondary' as const };
    if (pct >= 20) return { label: 'Low', variant: 'destructive' as const };
    return { label: 'Critical', variant: 'destructive' as const };
  };

  const badge = getOccupancyBadge(occupancy);
  const lastUpdated = currentInventory?.reported_at 
    ? new Date(currentInventory.reported_at).toLocaleString()
    : 'Never';

  return (
    <Card className="border-blue-100">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Ticket className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Update Inventory</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {eventTitle}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Updated: {lastUpdated}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Stats */}
        {currentInventory && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{currentInventory.tickets_sold}</div>
              <div className="text-xs text-muted-foreground">Sold</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{currentInventory.tickets_remaining}</div>
              <div className="text-xs text-muted-foreground">Remaining</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{currentInventory.occupancy_percent.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Occupancy</div>
            </div>
          </div>
        )}

        {/* Update Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tickets-sold" className="flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              Current Tickets Sold
            </Label>
            <Input
              id="tickets-sold"
              type="number"
              min="0"
              max={maxCapacity}
              placeholder={`0 - ${maxCapacity}`}
              value={ticketsSold}
              onChange={(e) => setTicketsSold(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Enter the total number of tickets sold so far
            </p>
          </div>

          {/* Preview */}
          {ticketsSold && (
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Occupancy Preview</span>
                <Badge variant={badge.variant}>{badge.label}</Badge>
              </div>
              
              <Progress value={occupancy} className="h-2" />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Occupancy:</span>
                  <span className="font-medium">{occupancy.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Remaining:</span>
                  <span className="font-medium">{remaining}</span>
                </div>
              </div>

              {occupancy < 60 && (
                <p className="text-sm text-amber-600">
                  Low occupancy detected. AI may recommend a discount after you update.
                </p>
              )}
            </div>
          )}

          <Button 
            onClick={handleUpdate} 
            disabled={isLoading || !ticketsSold}
            className="w-full"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Update Inventory
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
