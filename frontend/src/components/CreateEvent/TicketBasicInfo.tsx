import { DollarSign, Users, Clock } from 'lucide-react';

interface TicketBasicInfoProps {
  ticketType: any;
  onUpdate: (ticketType: any) => void;
}

export const TicketBasicInfo = ({ ticketType, onUpdate }: TicketBasicInfoProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Ticket Name *</label>
        <input
          type="text"
          value={ticketType.name}
          onChange={(e) => onUpdate({ ...ticketType, name: e.target.value })}
          className="w-full p-2 border rounded-md"
          placeholder="General Admission"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={ticketType.description || ''}
          onChange={(e) => onUpdate({ ...ticketType, description: e.target.value })}
          className="w-full p-2 border rounded-md"
          rows={3}
          placeholder="Brief description of this ticket type"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Price *</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              value={ticketType.price}
              onChange={(e) => onUpdate({ ...ticketType, price: parseFloat(e.target.value) || 0 })}
              className="w-full pl-10 pr-3 py-2 border rounded-md"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Currency</label>
          <select
            value={ticketType.currency || 'USD'}
            onChange={(e) => onUpdate({ ...ticketType, currency: e.target.value })}
            className="w-full p-2 border rounded-md"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
      </div>
    </div>
  );
};
