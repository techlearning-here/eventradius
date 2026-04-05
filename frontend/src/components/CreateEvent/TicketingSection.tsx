import { useState } from 'react';
import { DollarSign, Ticket, ExternalLink, Plus, Trash2 } from 'lucide-react';

interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  quantity_available: number | null;
  quantity_sold: number;
  min_per_order: number;
  max_per_order: number;
  sales_start_time: Date | null;
  sales_end_time: Date | null;
  visibility: 'visible' | 'hidden' | 'hidden_when_not_on_sale';
  absorb_fees: boolean;
  is_donation: boolean;
}

interface TicketingSectionProps {
  ticketingWebsite: string;
  onTicketingWebsiteChange: (value: string) => void;
}

export const TicketingSection = ({
  ticketingWebsite,
  onTicketingWebsiteChange,
}: TicketingSectionProps) => {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    {
      id: '1',
      name: 'General Admission',
      description: 'Standard entry ticket',
      price: 0,
      currency: 'USD',
      quantity_available: null,
      quantity_sold: 0,
      min_per_order: 1,
      max_per_order: 10,
      sales_start_time: null,
      sales_end_time: null,
      visibility: 'visible',
      absorb_fees: false,
      is_donation: false,
    },
  ]);

  const [showAdvanced, setShowAdvanced] = useState(false);

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  ];

  const addTicketType = () => {
    const newTicket: TicketType = {
      id: Date.now().toString(),
      name: '',
      description: '',
      price: 0,
      currency: 'USD',
      quantity_available: null,
      quantity_sold: 0,
      min_per_order: 1,
      max_per_order: 10,
      sales_start_time: null,
      sales_end_time: null,
      visibility: 'visible',
      absorb_fees: false,
      is_donation: false,
    };
    setTicketTypes([...ticketTypes, newTicket]);
  };

  const updateTicketType = (id: string, updates: Partial<TicketType>) => {
    setTicketTypes(ticketTypes.map(ticket => 
      ticket.id === id ? { ...ticket, ...updates } : ticket
    ));
  };

  const removeTicketType = (id: string) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(ticketTypes.filter(ticket => ticket.id !== id));
    }
  };

  const getCurrencySymbol = (currencyCode: string) => {
    const currency = currencies.find(c => c.code === currencyCode);
    return currency?.symbol || '$';
  };

  return (
    <div className="space-y-8">
      {/* External Ticketing Website */}
      <div>
        <h3 className="text-lg font-semibold mb-4">External Ticketing</h3>
        <p className="text-gray-600 mb-4">
          If you're using an external ticketing platform, provide the link here
        </p>
        
        <div className="relative max-w-md">
          <ExternalLink className="absolute left-3 top-1/2 text-gray-400 w-4 h-4 transform -translate-y-1/2" />
          <input
            type="url"
            placeholder="https://example.com/tickets"
            value={ticketingWebsite}
            onChange={(e) => onTicketingWebsiteChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Divider */}
      {!ticketingWebsite && (
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-gray-500 text-sm font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>
      )}

      {/* Built-in Ticketing */}
      {!ticketingWebsite && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Ticket Types</h3>
            <button
              onClick={addTicketType}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Ticket Type
            </button>
          </div>

          <div className="space-y-6">
            {ticketTypes.map((ticket, index) => (
              <div key={ticket.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Ticket className="w-5 h-5 text-gray-600" />
                    <h4 className="font-semibold">Ticket Type {index + 1}</h4>
                  </div>
                  {ticketTypes.length > 1 && (
                    <button
                      onClick={() => removeTicketType(ticket.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Ticket Name</label>
                      <input
                        type="text"
                        placeholder="e.g., General Admission, VIP, Early Bird"
                        value={ticket.name}
                        onChange={(e) => updateTicketType(ticket.id, { name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        placeholder="What's included with this ticket?"
                        value={ticket.description}
                        onChange={(e) => updateTicketType(ticket.id, { description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-20"
                      />
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Price</label>
                      <div className="flex gap-2">
                        <select
                          value={ticket.currency}
                          onChange={(e) => updateTicketType(ticket.id, { currency: e.target.value })}
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {currencies.map((currency) => (
                            <option key={currency.code} value={currency.code}>
                              {currency.code}
                            </option>
                          ))}
                        </select>
                        <div className="relative flex-1">
                          <DollarSign className="absolute left-3 top-1/2 text-gray-400 w-4 h-4 transform -translate-y-1/2" />
                          <input
                            type="number"
                            placeholder="0.00"
                            value={ticket.price}
                            onChange={(e) => updateTicketType(ticket.id, { price: parseFloat(e.target.value) || 0 })}
                            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Quantity Available</label>
                      <input
                        type="number"
                        placeholder="Unlimited"
                        value={ticket.quantity_available || ''}
                        onChange={(e) => updateTicketType(ticket.id, { 
                          quantity_available: e.target.value ? parseInt(e.target.value) : null 
                        })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Advanced Settings Toggle */}
                <div className="mt-4">
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
                  </button>
                </div>

                {/* Advanced Settings */}
                {showAdvanced && (
                  <div className="mt-4 pt-4 border-t border-gray-200 grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Min per Order</label>
                      <input
                        type="number"
                        min="1"
                        value={ticket.min_per_order}
                        onChange={(e) => updateTicketType(ticket.id, { min_per_order: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Max per Order</label>
                      <input
                        type="number"
                        min="1"
                        value={ticket.max_per_order}
                        onChange={(e) => updateTicketType(ticket.id, { max_per_order: parseInt(e.target.value) || 10 })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`absorb-fees-${ticket.id}`}
                        checked={ticket.absorb_fees}
                        onChange={(e) => updateTicketType(ticket.id, { absorb_fees: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={`absorb-fees-${ticket.id}`} className="text-sm">
                        Absorb processing fees
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`donation-${ticket.id}`}
                        checked={ticket.is_donation}
                        onChange={(e) => updateTicketType(ticket.id, { is_donation: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={`donation-${ticket.id}`} className="text-sm">
                        Donation-based ticket
                      </label>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ticketing Tips */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-900 mb-2">💰 Ticketing Tips</h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Offer early bird discounts to encourage early registration</li>
          <li>• Consider tiered pricing for different access levels</li>
          <li>• Set reasonable limits to prevent scalping</li>
          <li>• Clear descriptions reduce support requests</li>
        </ul>
      </div>
    </div>
  );
};
