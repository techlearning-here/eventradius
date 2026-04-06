import { Clock, Eye, DollarSign } from 'lucide-react';

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
  visibility: 'visible' | 'hidden' | 'hidden_when_not_on_sale';
  absorb_fees: boolean;
  delivery_options: string[];
}

interface TicketAdvancedProps {
  ticketType: TicketType;
  onUpdate: (ticketType: TicketType) => void;
}

export const TicketAdvanced = ({ ticketType, onUpdate }: TicketAdvancedProps) => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Sales Timing
      </h4>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Sales Start</label>
          <input
            type="datetime-local"
            value={ticketType.sales_start_time ? new Date(ticketType.sales_start_time).toISOString().slice(0, 16) : ''}
            onChange={(e) => onUpdate({ ...ticketType, sales_start_time: e.target.value ? new Date(e.target.value) : undefined })}
            className="w-full p-2 border rounded-md"
          />
          <p className="text-xs text-gray-500 mt-1">Leave blank for immediate</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sales End</label>
          <input
            type="datetime-local"
            value={ticketType.sales_end_time ? new Date(ticketType.sales_end_time).toISOString().slice(0, 16) : ''}
            onChange={(e) => onUpdate({ ...ticketType, sales_end_time: e.target.value ? new Date(e.target.value) : undefined })}
            className="w-full p-2 border rounded-md"
          />
          <p className="text-xs text-gray-500 mt-1">Leave blank for no end time</p>
        </div>
      </div>

      <h4 className="font-medium flex items-center gap-2">
        <Eye className="w-4 h-4" />
        Visibility & Options
      </h4>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Visibility</label>
          <select
            value={ticketType.visibility || 'visible'}
            onChange={(e) => onUpdate({ ...ticketType, visibility: e.target.value as TicketType['visibility'] })}
            className="w-full p-2 border rounded-md"
          >
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
            <option value="hidden_when_not_on_sale">Hidden when not on sale</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="absorb-fees"
            checked={ticketType.absorb_fees || false}
            onChange={(e) => onUpdate({ ...ticketType, absorb_fees: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="absorb-fees" className="text-sm">
            Absorb processing fees (attendees pay face value)
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is-donation"
            checked={ticketType.is_donation || false}
            onChange={(e) => onUpdate({ ...ticketType, is_donation: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="is-donation" className="text-sm">
            This is a donation ticket (pay what you want)
          </label>
        </div>
      </div>

      <h4 className="font-medium flex items-center gap-2">
        <DollarSign className="w-4 h-4" />
        Delivery Options
      </h4>

      <div>
        <label className="block text-sm font-medium mb-1">Delivery Methods</label>
        <div className="space-y-2">
          {['eticket', 'will_call', 'print_at_home'].map((method) => (
            <div key={method} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={method}
                checked={ticketType.delivery_options?.includes(method) || false}
                onChange={(e) => {
                  const current = ticketType.delivery_options || [];
                  if (e.target.checked) {
                    onUpdate({ ...ticketType, delivery_options: [...current, method] });
                  } else {
                    onUpdate({ ...ticketType, delivery_options: current.filter((m: string) => m !== method) });
                  }
                }}
                className="rounded"
              />
              <label htmlFor={method} className="text-sm capitalize">
                {method.replace('_', ' ')}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
