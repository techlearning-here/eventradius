import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { TicketBasicInfo } from './TicketBasicInfo';
import { TicketQuantity } from './TicketQuantity';
import { TicketAdvanced } from './TicketAdvanced';

interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  quantity_available: number;
  quantity_sold: number;
  min_per_order: number;
  max_per_order: number;
  sales_start_time?: Date;
  sales_end_time?: Date;
  is_donation: boolean;
}

interface TicketTypeEditorProps {
  ticketType: TicketType;
  onUpdate: (ticketType: TicketType) => void;
  onDelete: () => void;
}

export const TicketTypeEditor = ({ ticketType, onUpdate, onDelete }: TicketTypeEditorProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{ticketType.name || 'New Ticket Type'}</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-6">
          <TicketBasicInfo ticketType={ticketType} onUpdate={onUpdate} />
          <TicketQuantity ticketType={ticketType} onUpdate={onUpdate} />

          <div>
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
            >
              {showAdvanced ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              Advanced Options
            </Button>

            {showAdvanced && (
              <div className="mt-4">
                <TicketAdvanced ticketType={ticketType} onUpdate={onUpdate} />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
