import { Users } from 'lucide-react';

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

interface TicketQuantityProps {
  ticketType: TicketType;
  onUpdate: (ticketType: TicketType) => void;
}

export const TicketQuantity = ({ ticketType, onUpdate }: TicketQuantityProps) => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium flex items-center gap-2">
        <Users className="w-4 h-4" />
        Quantity Settings
      </h4>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Available Quantity</label>
          <input
            type="number"
            value={ticketType.quantity_available || ''}
            onChange={(e) => onUpdate({ ...ticketType, quantity_available: parseInt(e.target.value) || undefined })}
            className="w-full p-2 border rounded-md"
            min="1"
            placeholder="Unlimited"
          />
          <p className="text-xs text-gray-500 mt-1">Leave blank for unlimited</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sold</label>
          <input
            type="number"
            value={ticketType.quantity_sold || 0}
            onChange={(e) => onUpdate({ ...ticketType, quantity_sold: parseInt(e.target.value) || 0 })}
            className="w-full p-2 border rounded-md"
            min="0"
            readOnly
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Min per Order</label>
          <input
            type="number"
            value={ticketType.min_per_order || 1}
            onChange={(e) => onUpdate({ ...ticketType, min_per_order: parseInt(e.target.value) || 1 })}
            className="w-full p-2 border rounded-md"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Max per Order</label>
          <input
            type="number"
            value={ticketType.max_per_order || 10}
            onChange={(e) => onUpdate({ ...ticketType, max_per_order: parseInt(e.target.value) || 10 })}
            className="w-full p-2 border rounded-md"
            min="1"
          />
        </div>
      </div>
    </div>
  );
};
