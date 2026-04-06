import { DollarSign, Plus } from 'lucide-react';

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

interface TicketingOverviewProps {
  ticketTypes: TicketType[];
  onAddTicket: () => void;
  totalRevenue?: number;
}

export const TicketingOverview = ({
  ticketTypes,
  onAddTicket,
  totalRevenue = 0,
}: TicketingOverviewProps) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const visibleTickets = ticketTypes.filter(t => t.visibility === 'visible');
  const hasPaidTickets = visibleTickets.some(t => t.price > 0);
  const hasFreeTickets = visibleTickets.some(t => t.price === 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Revenue</h3>
          </div>
          <p className="text-2xl font-bold text-blue-900">
            {formatCurrency(totalRevenue, 'USD')}
          </p>
          <p className="text-sm text-blue-700">Projected revenue</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Plus className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-900">Ticket Types</h3>
          </div>
          <p className="text-2xl font-bold text-green-900">{visibleTickets.length}</p>
          <p className="text-sm text-green-700">Available tickets</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900">Pricing</h3>
          </div>
          <div className="space-y-1">
            {hasPaidTickets && <p className="text-sm text-purple-700">Paid tickets available</p>}
            {hasFreeTickets && <p className="text-sm text-purple-700">Free tickets available</p>}
            {!hasPaidTickets && !hasFreeTickets && <p className="text-sm text-purple-700">No tickets configured</p>}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Ticket Management</h3>
          <p className="text-gray-600">Configure ticket types and pricing</p>
        </div>
        <button
          onClick={onAddTicket}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Ticket Type
        </button>
      </div>

      {/* Ticket Types List */}
      <div className="space-y-3">
        {ticketTypes.map((ticketType) => (
          <div
            key={ticketType.id}
            className={`border rounded-lg p-3 ${
              ticketType.visibility === 'visible'
                ? 'border-gray-200 bg-white'
                : 'border-gray-100 bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{ticketType.name}</h4>
                <p className="text-sm text-gray-600">{ticketType.description}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {formatCurrency(ticketType.price, ticketType.currency)}
                </p>
                <p className="text-xs text-gray-500">
                  {ticketType.quantity_available
                    ? `${ticketType.quantity_available} available`
                    : 'Unlimited'}
                </p>
              </div>
            </div>
          </div>
        ))}

        {ticketTypes.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Ticket Types</h3>
            <p className="text-gray-600 mb-4">
              Create your first ticket type to start selling tickets
            </p>
            <button
              onClick={onAddTicket}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Ticket Type
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
