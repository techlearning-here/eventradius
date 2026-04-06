import { useState } from 'react';
import { DollarSign, Trash2, Plus } from 'lucide-react';

interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  quantity_available: number | null;
  min_per_order: number;
  max_per_order: number;
  sales_start_time: Date | null;
  sales_end_time: Date | null;
  visibility: 'visible' | 'hidden' | 'hidden_when_not_on_sale';
  absorb_fees: boolean;
  is_donation: boolean;
}

interface TicketTypeEditorProps {
  ticketType: TicketType;
  onUpdate: (ticketType: TicketType) => void;
  onDelete: () => void;
}

export const TicketTypeEditor = ({
  ticketType,
  onUpdate,
  onDelete,
}: TicketTypeEditorProps) => {
  const [expanded, setExpanded] = useState(false);

  const updateField = (field: keyof TicketType, value: TicketType[keyof TicketType]) => {
    onUpdate({ ...ticketType, [field]: value });
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().slice(0, 16);
  };

  const handleDateTimeChange = (value: string, field: 'sales_start_time' | 'sales_end_time') => {
    if (!value) {
      updateField(field, null);
      return;
    }
    updateField(field, new Date(value));
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          <input
            type="text"
            value={ticketType.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
            placeholder="Ticket Name"
          />
        </div>
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-700 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={ticketType.description}
            onChange={(e) => updateField('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-20"
            placeholder="Describe this ticket type"
          />
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <div className="flex items-center gap-2">
              <select
                value={ticketType.currency}
                onChange={(e) => updateField('currency', e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
              <input
                type="number"
                value={ticketType.price}
                onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Quantity Available</label>
            <input
              type="number"
              value={ticketType.quantity_available || ''}
              onChange={(e) => updateField('quantity_available', e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Unlimited"
              min="1"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          {expanded ? 'Hide' : 'Show'} Advanced Options
        </button>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={ticketType.is_donation}
              onChange={(e) => updateField('is_donation', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">Donation</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={ticketType.absorb_fees}
              onChange={(e) => updateField('absorb_fees', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">Absorb Fees</span>
          </label>
        </div>
      </div>

      {expanded && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Min per Order</label>
              <input
                type="number"
                value={ticketType.min_per_order}
                onChange={(e) => updateField('min_per_order', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Max per Order</label>
              <input
                type="number"
                value={ticketType.max_per_order}
                onChange={(e) => updateField('max_per_order', parseInt(e.target.value) || 10)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Sales Start</label>
              <input
                type="datetime-local"
                value={formatDateTime(ticketType.sales_start_time)}
                onChange={(e) => handleDateTimeChange(e.target.value, 'sales_start_time')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sales End</label>
              <input
                type="datetime-local"
                value={formatDateTime(ticketType.sales_end_time)}
                onChange={(e) => handleDateTimeChange(e.target.value, 'sales_end_time')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Visibility</label>
            <select
              value={ticketType.visibility}
              onChange={(e) => updateField('visibility', e.target.value as TicketType['visibility'])}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="visible">Visible</option>
              <option value="hidden">Hidden</option>
              <option value="hidden_when_not_on_sale">Hidden when not on sale</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
